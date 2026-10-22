/* لوحة تحكم التاجر */
(function () {
  const A = window.App;
  const AI = window.Assistant;
  const $ = (s) => document.querySelector(s);

  let state = A.load();
  const drafts = {}; // reviewId -> { text, tone, variant, coupon, loading }
  let filter = 'pending';
  let productFilter = 'all';

  const FILTERS = [
    ['pending', 'بانتظار الرد', (r) => !r.reply],
    ['attention', 'تحتاج اهتمام', (r) => !r.reply && AI.analyze(r).priority !== 'low'],
    ['replied', 'تم الرد', (r) => !!r.reply],
    ['all', 'الكل', () => true]
  ];

  const product = (id) => state.products.find((p) => p.id === id) || { name: 'منتج' };
  const review = (id) => state.reviews.find((r) => r.id === id);

  function commit(msg) {
    A.save(state);
    render();
    if (msg) A.toast(msg);
  }

  function makeDraft(r, tone, variant, withCoupon) {
    const text = AI.generate(r, product(r.productId), {
      tone,
      variant,
      coupon: withCoupon ? state.store.coupon : '',
      storeName: state.store.name
    });
    return { text, tone, variant, coupon: withCoupon, loading: false };
  }

  // Short "thinking" pause so it feels like the tool is running.
  function suggest(ids) {
    ids.forEach((id) => { drafts[id] = { loading: true }; });
    renderList();
    setTimeout(() => {
      ids.forEach((id) => {
        const r = review(id);
        if (!r) return delete drafts[id];
        // Start each review on a different wording so replies don't all read the same.
        const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
        drafts[id] = makeDraft(r, state.settings.defaultTone, seed, AI.analyze(r).sentiment === 'negative');
      });
      render();
    }, 650);
  }

  function publish(id, silent) {
    const r = review(id);
    const d = drafts[id];
    if (!r || !d || d.loading) return false;
    const text = (d.text || '').trim();
    if (!text) { A.toast('اكتب الرد قبل النشر'); return false; }
    r.reply = text;
    r.repliedAt = new Date().toISOString();
    delete drafts[id];
    if (!silent) commit('تم نشر الرد، وصار ظاهر في المتجر');
    return true;
  }

  /* ---------- Render ---------- */
  function kpi(label, value, extra) {
    return `<div class="kpi"><span class="kpi-label">${label}</span><span class="kpi-value">${value}</span>${extra}</div>`;
  }

  function renderKpis() {
    const rs = state.reviews;
    const avg = A.storeAvg(state);
    const pending = rs.filter((r) => !r.reply);
    const urgent = pending.filter((r) => AI.analyze(r).priority === 'urgent').length;
    const rate = A.replyRate(state);
    $('#kpis').innerHTML = [
      kpi('متوسط تقييم المتجر', avg.toFixed(1), A.stars(avg)),
      kpi('بانتظار الرد', pending.length, urgent ? `<span><span class="pill pill-bad">${urgent} عاجل</span></span>` : '<span><span class="pill pill-good">ما فيه شي عاجل</span></span>'),
      kpi('نسبة الرد', rate + '%', `<span class="meter" aria-hidden="true"><i style="width:${rate}%"></i></span>`),
      kpi('إجمالي التقييمات', rs.length, `<span class="muted" style="font-size:13px">على ${state.products.length} منتجات</span>`)
    ].join('');
  }

  function scoped() {
    return state.reviews.filter((r) => productFilter === 'all' || r.productId === productFilter);
  }

  function renderFilters() {
    const rs = scoped();
    $('#filters').innerHTML = FILTERS.map(([key, label, fn]) =>
      `<button type="button" class="chipbtn ${filter === key ? 'is-on' : ''}" data-filter="${key}" aria-pressed="${filter === key}">${label}<span class="n">${rs.filter(fn).length}</span></button>`
    ).join('');

    const sel = $('#productFilter');
    sel.innerHTML = `<option value="all">كل المنتجات</option>` +
      state.products.map((p) => `<option value="${p.id}">${A.esc(p.name)}</option>`).join('');
    sel.value = productFilter;

    const pendingIds = rs.filter((r) => !r.reply && !drafts[r.id]).length;
    const bulk = $('#bulkBtn');
    bulk.disabled = !pendingIds;
    bulk.textContent = pendingIds ? `جهّز ردود لكل التقييمات المعلّقة (${pendingIds})` : 'كل التقييمات المعلّقة لها مسودات';

    const ready = Object.keys(drafts).filter((id) => !drafts[id].loading && review(id));
    const pubAll = $('#publishAllBtn');
    pubAll.hidden = ready.length < 2;
    pubAll.textContent = `انشر كل المسودات (${ready.length})`;
  }

  function chipsFor(r) {
    const a = AI.analyze(r);
    const s = AI.SENTIMENT[a.sentiment];
    let h = `<span class="pill ${s.cls}">${s.label}</span>`;
    if (!r.reply) h += `<span class="pill ${a.priority === 'urgent' ? 'pill-bad' : 'pill-accent'}">${AI.PRIORITY[a.priority].label}</span>`;
    a.praise.forEach((t) => { h += `<span class="pill">✓ ${AI.TOPIC_LABEL[t]}</span>`; });
    a.issues.forEach((t) => { h += `<span class="pill pill-warn">ملاحظة: ${AI.TOPIC_LABEL[t]}</span>`; });
    return `<div class="chips"><span class="chips-label">تحليل المساعد:</span>${h}</div>`;
  }

  function draftBlock(r) {
    const d = drafts[r.id];
    if (d.loading) {
      return `<div class="draft"><div class="loading"><span class="dots"><i></i><i></i><i></i></span> المساعد يقرأ التقييم ويكتب الرد…</div></div>`;
    }
    return `<div class="draft">
      <div class="draft-head">
        <span class="draft-label">${r.reply ? 'تعديل الرد' : 'الرد المقترح'}</span>
        <div class="seg" role="group" aria-label="نبرة الرد">
          <button type="button" data-act="tone" data-tone="friendly" class="${d.tone === 'friendly' ? 'on' : ''}">ودّي</button>
          <button type="button" data-act="tone" data-tone="formal" class="${d.tone === 'formal' ? 'on' : ''}">رسمي</button>
        </div>
      </div>
      <textarea id="draft-${r.id}" data-act="edit" rows="6" aria-label="نص الرد">${A.esc(d.text)}</textarea>
      <label class="check"><input type="checkbox" id="coupon-${r.id}" data-act="coupon" ${d.coupon ? 'checked' : ''}> إضافة كود التعويض ${A.esc(state.store.coupon)}</label>
      <div class="draft-actions">
        <button type="button" class="btn btn-primary" data-act="publish">${r.reply ? 'حفظ التعديل' : 'انشر الرد في المتجر'}</button>
        <button type="button" class="btn" data-act="regen">اقتراح آخر</button>
        <button type="button" class="btn btn-ghost" data-act="cancel">إلغاء</button>
      </div>
    </div>`;
  }

  function card(r) {
    const p = product(r.productId);
    const a = AI.analyze(r);
    let body;
    if (drafts[r.id]) body = draftBlock(r);
    else if (r.reply) {
      body = `<div class="reply">
        <div class="reply-head"><b>ردك المنشور</b><span class="muted">${A.fmtDate(r.repliedAt)}</span></div>
        <p>${A.esc(r.reply)}</p>
        <div class="reply-actions">
          <button type="button" class="btn btn-sm" data-act="editReply">تعديل</button>
          <button type="button" class="btn btn-sm btn-ghost btn-danger" data-act="removeReply">حذف الرد</button>
        </div>
      </div>`;
    } else {
      body = `<div class="draft-actions"><button type="button" class="btn btn-primary" data-act="suggest">✦ اقترح ردًا</button><button type="button" class="btn btn-ghost" data-act="manual">أكتب بنفسي</button></div>`;
    }
    const status = r.reply
      ? '<span class="pill pill-good">تم الرد</span>'
      : '<span class="pill pill-warn">بانتظار الرد</span>';
    return `<article class="review ${!r.reply && a.priority === 'urgent' ? 'is-urgent' : ''} ${r.hidden ? 'is-hidden' : ''}" data-id="${r.id}">
      <div class="review-top">
        <div class="who"><span class="avatar" aria-hidden="true">${A.esc(r.customer.trim().charAt(0))}</span>
          <div><b>${A.esc(r.customer)}</b><small>${A.esc(p.name)} · ${A.fmtDate(r.date)}${r.isNew ? ' · <span class="pill pill-accent">جديد من المتجر</span>' : ''}</small></div>
        </div>
        <div class="review-meta">${A.stars(r.rating)}${status}</div>
      </div>
      <p>${A.esc(r.text)}</p>
      ${chipsFor(r)}
      ${body}
      <div class="review-foot">
        <label class="switch"><input type="checkbox" id="vis-${r.id}" data-act="visible" ${r.hidden ? '' : 'checked'}> ظاهر في المتجر</label>
        <label class="switch"><input type="checkbox" id="pin-${r.id}" data-act="pin" ${r.pinned ? 'checked' : ''}> تثبيت في أعلى صفحة المنتج</label>
      </div>
    </article>`;
  }

  function renderList() {
    const fn = FILTERS.find((f) => f[0] === filter)[2];
    const rs = scoped().filter((r) => fn(r) || drafts[r.id]);
    rs.sort((a, b) => {
      if (filter !== 'replied' && filter !== 'all') {
        const d = AI.PRIORITY[AI.analyze(a).priority].rank - AI.PRIORITY[AI.analyze(b).priority].rank;
        if (d) return d;
      }
      return b.date.localeCompare(a.date);
    });
    $('#list').innerHTML = rs.length
      ? rs.map(card).join('')
      : `<div class="empty"><b>${filter === 'pending' || filter === 'attention' ? 'رديت على كل التقييمات هنا' : 'ما فيه تقييمات هنا'}</b><span>جرّب فلتر «الكل»، أو افتح واجهة المتجر واكتب تقييمًا جديدًا كعميل.</span></div>`;
    renderFilters();
  }

  function renderPerf() {
    $('#perf').innerHTML = state.products.map((p) => {
      const s = A.productStats(state, p.id);
      return `<button type="button" data-product="${p.id}" class="${productFilter === p.id ? 'is-on' : ''}" aria-pressed="${productFilter === p.id}">
        ${A.thumb(p)}<span class="name">${A.esc(p.name)}</span><span class="avg">${s.count ? s.avg.toFixed(1) : '—'}</span>
        <span class="sub">${A.stars(s.avg)} ${s.count} تقييم ${s.pending ? `<span class="pill pill-warn">${s.pending} بدون رد</span>` : ''}</span>
      </button>`;
    }).join('');
  }

  function renderSettings() {
    $('#setReplies').checked = !!state.settings.showReplies;
    $('#setBadge').checked = !!state.settings.showBadge;
    $('#setSort').value = state.settings.sort;
    $('#setTone').value = state.settings.defaultTone;
    if (document.activeElement !== $('#setCoupon')) $('#setCoupon').value = state.store.coupon;
  }

  function render() {
    renderKpis();
    renderList();
    renderPerf();
    renderSettings();
  }

  /* ---------- Events ---------- */
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    renderList();
  });
  $('#productFilter').addEventListener('change', (e) => {
    productFilter = e.target.value;
    renderList();
    renderPerf();
  });
  $('#perf').addEventListener('click', (e) => {
    const b = e.target.closest('[data-product]');
    if (!b) return;
    productFilter = productFilter === b.dataset.product ? 'all' : b.dataset.product;
    renderList();
    renderPerf();
  });

  $('#bulkBtn').addEventListener('click', () => {
    const ids = scoped().filter((r) => !r.reply && !drafts[r.id]).map((r) => r.id);
    if (!ids.length) return;
    if (filter === 'replied') filter = 'pending';
    suggest(ids);
    A.toast(`المساعد يجهّز ${ids.length} ردود…`);
  });
  $('#publishAllBtn').addEventListener('click', () => {
    const ids = Object.keys(drafts).filter((id) => !drafts[id].loading);
    const n = ids.filter((id) => publish(id, true)).length;
    commit(`تم نشر ${n} ردود في المتجر`);
  });

  const list = $('#list');
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.closest('[data-id]').dataset.id;
    const r = review(id);
    const d = drafts[id];
    switch (btn.dataset.act) {
      case 'suggest': suggest([id]); break;
      case 'manual':
        drafts[id] = { text: '', tone: state.settings.defaultTone, variant: 0, coupon: false };
        renderList();
        document.getElementById('draft-' + id)?.focus();
        break;
      case 'regen':
        drafts[id] = makeDraft(r, d.tone, (d.variant || 0) + 1, d.coupon);
        renderList();
        break;
      case 'tone':
        drafts[id] = makeDraft(r, btn.dataset.tone, d.variant || 0, d.coupon);
        renderList();
        break;
      case 'publish': publish(id); break;
      case 'cancel': delete drafts[id]; renderList(); break;
      case 'editReply':
        drafts[id] = { text: r.reply, tone: state.settings.defaultTone, variant: 0, coupon: false };
        renderList();
        break;
      case 'removeReply':
        r.reply = null;
        r.repliedAt = null;
        commit('تم حذف الرد من المتجر');
        break;
    }
  });
  list.addEventListener('input', (e) => {
    if (e.target.dataset.act !== 'edit') return;
    const id = e.target.closest('[data-id]').dataset.id;
    if (drafts[id]) drafts[id].text = e.target.value;
  });
  list.addEventListener('change', (e) => {
    const act = e.target.dataset.act;
    const id = e.target.closest('[data-id]')?.dataset.id;
    const r = review(id);
    if (!r) return;
    if (act === 'coupon') {
      const d = drafts[id];
      drafts[id] = makeDraft(r, d.tone, d.variant || 0, e.target.checked);
      renderList();
    } else if (act === 'visible') {
      r.hidden = !e.target.checked;
      commit(r.hidden ? 'تم إخفاء التقييم من المتجر' : 'التقييم ظاهر في المتجر');
    } else if (act === 'pin') {
      r.pinned = e.target.checked;
      if (r.pinned) r.hidden = false;
      commit(r.pinned ? 'تم تثبيت التقييم في أعلى صفحة المنتج' : 'تم إلغاء التثبيت');
    }
  });

  $('#setReplies').addEventListener('change', (e) => { state.settings.showReplies = e.target.checked; commit('تم تحديث واجهة المتجر'); });
  $('#setBadge').addEventListener('change', (e) => { state.settings.showBadge = e.target.checked; commit('تم تحديث واجهة المتجر'); });
  $('#setSort').addEventListener('change', (e) => { state.settings.sort = e.target.value; commit('تم تغيير ترتيب التقييمات في المتجر'); });
  $('#setTone').addEventListener('change', (e) => { state.settings.defaultTone = e.target.value; commit('الردود الجاية بتكون بهالنبرة'); });
  $('#setCoupon').addEventListener('change', (e) => {
    state.store.coupon = e.target.value.trim().toUpperCase().replace(/\s+/g, '') || 'SANA15';
    commit('تم حفظ كود التعويض');
  });

  let resetArmed = null;
  $('#resetBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    if (!resetArmed) {
      b.textContent = 'متأكد؟ اضغط مرة ثانية للإرجاع';
      b.classList.add('btn-danger');
      resetArmed = setTimeout(() => { resetArmed = null; b.textContent = 'إرجاع البيانات التجريبية'; b.classList.remove('btn-danger'); }, 3500);
      return;
    }
    clearTimeout(resetArmed);
    resetArmed = null;
    b.textContent = 'إرجاع البيانات التجريبية';
    b.classList.remove('btn-danger');
    Object.keys(drafts).forEach((k) => delete drafts[k]);
    state = A.reset();
    filter = 'pending';
    productFilter = 'all';
    commit('رجعت البيانات التجريبية لوضعها الأول');
  });

  A.onExternalChange((next) => {
    const before = state.reviews.length;
    state = next;
    render();
    if (state.reviews.length > before) A.toast('وصل تقييم جديد من المتجر');
  });

  render();
})();
