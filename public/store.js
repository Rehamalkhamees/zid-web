/* واجهة المتجر */
(function () {
  const A = window.App;
  const $ = (s) => document.querySelector(s);

  let state = A.load();
  let openId = null;
  let newRating = 0;
  let productSort = 'featured';
  let lastFocus = null;

  const product = (id) => state.products.find((p) => p.id === id);

  function visibleReviews(pid) {
    const s = state.settings.sort;
    return state.reviews
      .filter((r) => r.productId === pid && !r.hidden)
      .sort((a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        (s === 'highest' ? b.rating - a.rating : 0) ||
        (s === 'replied' ? (b.reply ? 1 : 0) - (a.reply ? 1 : 0) : 0) ||
        b.date.localeCompare(a.date)
      );
  }

  /* ---------- Render ---------- */
  function renderTrust() {
    const el = $('#trust');
    el.hidden = !state.settings.showBadge;
    el.innerHTML = `<span>★ ${A.storeAvg(state).toFixed(1)} متوسط تقييم المتجر من ${state.reviews.length} تقييم</span><span>التاجر يرد على ${A.replyRate(state)}% من التقييمات</span>`;
  }

  function renderCartCount() {
    $('#cartCount').textContent = state.cart.reduce((a, c) => a + c.qty, 0);
  }

  function renderGrid() {
    const items = state.products.slice();
    if (productSort === 'rating') items.sort((a, b) => A.productStats(state, b.id).avg - A.productStats(state, a.id).avg);
    if (productSort === 'price-asc') items.sort((a, b) => a.price - b.price);
    if (productSort === 'price-desc') items.sort((a, b) => b.price - a.price);

    $('#grid').innerHTML = items.map((p) => {
      const s = A.productStats(state, p.id);
      const pinned = visibleReviews(p.id).find((r) => r.pinned);
      return `<article class="product">
        <button type="button" class="product-art tile-${p.tile}" data-open="${p.id}" aria-label="عرض ${A.esc(p.name)}">${A.photo(p)}</button>
        <div class="product-body">
          <h3><button type="button" class="linklike" data-open="${p.id}">${A.esc(p.name)}</button></h3>
          <div class="rating-line">${A.stars(s.avg)} <span>${s.count ? s.avg.toFixed(1) : 'جديد'}</span> <span>(${s.count} تقييم)</span></div>
          <p class="price">${A.money(p.price)} <span class="muted" style="font-size:13px;font-weight:500">· ${A.esc(p.size)}</span></p>
          ${pinned ? `<p class="snippet"><b>${A.esc(pinned.customer.split(' ')[0])}:</b> «${A.esc(pinned.text)}»</p>` : ''}
          <div class="product-actions">
            <button type="button" class="btn btn-primary" data-add="${p.id}">أضف للسلة</button>
            <button type="button" class="btn" data-open="${p.id}">التقييمات (${visibleReviews(p.id).length})</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  function renderProduct() {
    const p = product(openId);
    if (!p) return closeModal('#productModal');
    const s = A.productStats(state, p.id);
    const rs = visibleReviews(p.id);
    const max = Math.max(1, ...s.dist);
    const reviewsHtml = rs.length
      ? rs.map((r) => `<div class="store-review">
          <div class="store-review-top"><b>${A.esc(r.customer)}</b>${A.stars(r.rating)}</div>
          <div class="store-review-top"><small>${A.fmtDate(r.date)}</small>${r.pinned ? '<span class="pill pill-accent">مختار من المتجر</span>' : ''}</div>
          <p>${A.esc(r.text)}</p>
          ${state.settings.showReplies && r.reply ? `<div class="merchant-reply"><b>رد ${A.esc(state.store.name)}</b>${A.esc(r.reply)}</div>` : ''}
        </div>`).join('')
      : '<p class="muted">ما فيه تقييمات ظاهرة للحين. كن أول من يقيّم!</p>';

    $('#pdInfo').innerHTML = `<div style="display:grid;gap:18px">
      <div class="pd-top">
        <div class="product-art tile-${p.tile}">${A.photo(p, `${p.name}، ${p.size}`)}</div>
        <div class="pd-info">
          <h2 id="pdTitle">${A.esc(p.name)}</h2>
          <p class="muted">${A.esc(p.size)} · ${A.esc(p.desc)}</p>
          <p class="price">${A.money(p.price)}</p>
          <div><button type="button" class="btn btn-primary" data-add="${p.id}">أضف للسلة</button></div>
        </div>
      </div>
      <div class="summary">
        <div class="summary-score"><span class="big-avg">${s.count ? s.avg.toFixed(1) : '—'}</span>${A.stars(s.avg)}<small>${s.count} تقييم</small></div>
        <div class="dist">${[5, 4, 3, 2, 1].map((n, i) =>
          `<div class="dist-row"><span>${n} ★</span><span class="bar"><i style="width:${(s.dist[i] / max) * 100}%"></i></span><span>${s.dist[i]}</span></div>`).join('')}</div>
      </div>
      <div>
        <h3 style="font-size:17px">تجارب العملاء</h3>
        <div class="store-reviews">${reviewsHtml}</div>
      </div>
    </div>`;
  }

  function renderStarPick() {
    $('#starPick').innerHTML = [1, 2, 3, 4, 5].map((n) =>
      `<button type="button" role="radio" aria-checked="${newRating === n}" aria-label="${n} من 5" data-star="${n}" class="${n <= newRating ? 'on' : ''}">★</button>`
    ).join('');
  }

  function renderCart() {
    const lines = state.cart.map((c) => ({ ...c, p: product(c.id) })).filter((c) => c.p);
    const total = lines.reduce((a, c) => a + c.p.price * c.qty, 0);
    $('#cartBody').innerHTML = lines.length
      ? `<div class="cart-list">${lines.map((c) => `<div class="cart-item">
            ${A.thumb(c.p)}
            <div><b>${A.esc(c.p.name)}</b><br><small>${A.money(c.p.price)} × ${c.qty}</small></div>
            <div class="qty"><button type="button" data-qty="${c.id}" data-d="1" aria-label="زيادة">+</button><span>${c.qty}</span><button type="button" data-qty="${c.id}" data-d="-1" aria-label="إنقاص">−</button></div>
          </div>`).join('')}</div>
          <div class="cart-total"><span>المجموع</span><span>${A.money(total)}</span></div>
          <button type="button" class="btn btn-primary" id="checkoutBtn">إتمام الطلب</button>`
      : '<p class="muted">سلتك فاضية. أضف منتجًا من الواجهة.</p>';
  }

  function render() {
    renderTrust();
    renderCartCount();
    renderGrid();
    if (openId) renderProduct();
    if (!$('#cartModal').hidden) renderCart();
  }

  /* ---------- Modals ---------- */
  function openModal(sel) {
    lastFocus = document.activeElement;
    $(sel).hidden = false;
    document.documentElement.classList.add('locked');
    $(sel).querySelector('[data-close]').focus();
  }
  function closeModal(sel) {
    $(sel).hidden = true;
    if (sel === '#productModal') openId = null;
    if ($('#productModal').hidden && $('#cartModal').hidden) document.documentElement.classList.remove('locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openProduct(id) {
    openId = id;
    newRating = 0;
    $('#reviewForm').reset();
    $('#rvError').hidden = true;
    renderStarPick();
    renderProduct();
    openModal('#productModal');
    $('#productModal .sheet').scrollTop = 0;
  }

  function addToCart(id) {
    const line = state.cart.find((c) => c.id === id);
    if (line) line.qty += 1;
    else state.cart.push({ id, qty: 1 });
    A.save(state);
    renderCartCount();
    A.toast(`أضفنا ${product(id).name} للسلة`);
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]');
    if (open) return openProduct(open.dataset.open);
    const add = e.target.closest('[data-add]');
    if (add) return addToCart(add.dataset.add);
    const close = e.target.closest('[data-close]');
    if (close) return closeModal('#' + close.closest('.modal').id);
    if (e.target.classList.contains('modal')) return closeModal('#' + e.target.id);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#cartModal').hidden) closeModal('#cartModal');
    else if (!$('#productModal').hidden) closeModal('#productModal');
  });

  $('#sortProducts').addEventListener('change', (e) => { productSort = e.target.value; renderGrid(); });

  $('#starPick').addEventListener('click', (e) => {
    const b = e.target.closest('[data-star]');
    if (!b) return;
    newRating = Number(b.dataset.star);
    renderStarPick();
    $('#starPick').querySelector(`[data-star="${newRating}"]`).focus();
  });

  $('#reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#rvName').value.trim();
    const text = $('#rvText').value.trim();
    const err = $('#rvError');
    let msg = '';
    if (!newRating) msg = 'اختر عدد النجوم أول.';
    else if (text.length < 5) msg = 'اكتب تجربتك بكلمتين على الأقل.';
    if (msg) { err.textContent = msg; err.hidden = false; return; }
    err.hidden = true;
    state.reviews.unshift({
      id: A.uid(), productId: openId, customer: name || 'عميل المتجر', rating: newRating,
      date: new Date().toISOString(), text, isNew: true
    });
    A.save(state);
    newRating = 0;
    $('#reviewForm').reset();
    renderStarPick();
    render();
    $('#productModal .sheet').scrollTo({ top: 0, behavior: 'smooth' });
    A.toast('شكرًا! تقييمك ظاهر الحين، وبيوصل للتاجر عشان يرد عليه');
  });

  $('#cartBtn').addEventListener('click', () => { renderCart(); openModal('#cartModal'); });
  $('#cartBody').addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const line = state.cart.find((c) => c.id === q.dataset.qty);
      line.qty += Number(q.dataset.d);
      if (line.qty <= 0) state.cart = state.cart.filter((c) => c !== line);
      A.save(state);
      renderCart();
      renderCartCount();
      return;
    }
    if (e.target.id === 'checkoutBtn') {
      state.cart = [];
      A.save(state);
      renderCart();
      renderCartCount();
      A.toast('تم استلام طلبك (طلب تجريبي)');
    }
  });

  A.onExternalChange((next) => { state = next; render(); });

  render();
})();
