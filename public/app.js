/* Shared demo data + storage used by both pages (لوحة التاجر و واجهة المتجر) */
(function () {
  const KEY = 'sana-reviews-demo-v1';

  const SEED = {
    store: { name: 'متجر سَنا', tagline: 'عطور وعناية بلمسة سعودية', coupon: 'SANA15' },
    settings: { showReplies: true, showBadge: true, sort: 'newest', defaultTone: 'friendly' },
    products: [
      { id: 'p1', name: 'عطر عود ملكي', size: '50 مل', price: 289, art: 'bottle', tile: 'lilac', img: 'img/p1.webp', desc: 'عود كمبودي مع لمسة ورد، ثبات يدوم طوال اليوم.' },
      { id: 'p2', name: 'بخور معطّر فاخر', size: '100 جرام', price: 145, art: 'box', tile: 'butter', img: 'img/p2.webp', desc: 'قطع بخور منتقاة تفوح بالمسك والعنبر.' },
      { id: 'p3', name: 'شمعة الورد الطائفي', size: '220 جرام', price: 89, art: 'candle', tile: 'mint', img: 'img/p3.webp', desc: 'شمعة صويا طبيعية تشتعل حتى 40 ساعة.' },
      { id: 'p4', name: 'مرطب يدين بالمسك', size: '75 مل', price: 59, art: 'jar', tile: 'lilac', img: 'img/p4.webp', desc: 'قوام خفيف يمتص بسرعة ولا يترك أثرًا دهنيًا.' },
      { id: 'p5', name: 'زيت الأرغان للشعر', size: '30 مل', price: 119, art: 'dropper', tile: 'butter', img: 'img/p5.webp', desc: 'زيت مغربي نقي يغذي الأطراف ويمنح لمعانًا.' },
      { id: 'p6', name: 'معطر مفارش لافندر', size: '250 مل', price: 69, art: 'spray', tile: 'mint', img: 'img/p6.webp', desc: 'رذاذ ناعم يمنح المفارش رائحة هادئة.' }
    ],
    reviews: [
      { id: 'r1', productId: 'p1', customer: 'نورة العتيبي', rating: 5, date: '2026-10-21T19:40', text: 'ريحته فخمة وثباته طول اليوم، والتغليف مرة مرتب. أكيد بطلبه مرة ثانية' },
      { id: 'r2', productId: 'p1', customer: 'عبدالله الشهري', rating: 2, date: '2026-10-21T11:05', text: 'العطر حلو بس التوصيل تأخر أسبوع كامل وما أحد رد علي بالواتساب' },
      { id: 'r5', productId: 'p2', customer: 'فهد المطيري', rating: 1, date: '2026-10-20T22:15', text: 'وصلني البخور والعلبة مكسورة ونص القطع متفتتة' },
      { id: 'r3', productId: 'p3', customer: 'ريم القحطاني', rating: 4, date: '2026-10-20T16:30', text: 'الشمعة ريحتها هادية وحلوة، بس كنت أتمنى تكون أكبر شوي بالنسبة للسعر' },
      { id: 'r9', productId: 'p3', customer: 'لمى السبيعي', rating: 2, date: '2026-10-19T13:00', text: 'اللون اللي وصلني مختلف عن الصورة تمامًا' },
      { id: 'r6', productId: 'p5', customer: 'هيا الزهراني', rating: 3, date: '2026-10-18T09:20', text: 'الزيت عادي، ما لاحظت فرق كبير في شعري بعد أسبوعين' },
      { id: 'r7', productId: 'p6', customer: 'منيرة الحربي', rating: 5, date: '2026-10-17T21:45', text: 'أحلى معطر جربته، ريحة اللافندر تريح الأعصاب والتوصيل كان سريع' },
      { id: 'r12', productId: 'p4', customer: 'أمل الرشيدي', rating: 3, date: '2026-10-16T18:10', text: 'المنتج حلو بس التغليف بسيط مرة وما يناسب هدية' },
      { id: 'r13', productId: 'p6', customer: 'ناصر القرني', rating: 4, date: '2026-10-15T12:00', text: 'ريحته حلوة وتدوم، بس العبوة صغيرة' },
      { id: 'r11', productId: 'p5', customer: 'جود الشمري', rating: 4, date: '2026-10-14T20:30', text: 'ريحته حلوة وخفيف على الشعر' },
      { id: 'r14', productId: 'p1', customer: 'مها العمري', rating: 5, date: '2026-10-13T17:25', text: 'جبته هدية لأمي وانبسطت عليه مرة، الريحة فخمة' },
      {
        id: 'r4', productId: 'p4', customer: 'سارة الدوسري', rating: 5, date: '2026-10-12T10:00', pinned: true,
        text: 'مرطب خفيف وما يخلي اليد دهنية، وريحة المسك ناعمة',
        reply: 'هلا سارة،\nسعدنا كثير إن مرطب يدين بالمسك عجبك، وتقييمك يفرق معنا. ويسعدنا إن الريحة والجودة كانت عند توقعك.\nننتظرك في طلبك الجاي!\n— فريق متجر سَنا',
        repliedAt: '2026-10-12T14:00'
      },
      {
        id: 'r8', productId: 'p1', customer: 'خالد الغامدي', rating: 4, date: '2026-10-10T15:40',
        text: 'ثبات ممتاز بس السعر مرتفع شوي',
        reply: 'أهلًا خالد،\nشكرًا على تقييمك الحلو لعطر عود ملكي. ويسعدنا إن الثبات عجبك. ملاحظتك على السعر وصلت، وتابع عروضنا الجاية لأنها بتعجبك.\nنشوفك قريب إن شاء الله.\n— فريق متجر سَنا',
        repliedAt: '2026-10-10T18:00'
      },
      {
        id: 'r10', productId: 'p2', customer: 'تركي العنزي', rating: 5, date: '2026-10-08T19:00', pinned: true,
        text: 'بخور أصلي وريحته تملي البيت، وخدمة العملاء تعاملهم راقي',
        reply: 'يا هلا تركي،\nممتنين لك على هالتقييم، وفرحنا إن البخور كان عند توقعك. وبنوصل شكرك لفريق خدمة العملاء.\nدمت بخير ونتشرف بخدمتك دايم.\n— فريق متجر سَنا',
        repliedAt: '2026-10-09T09:30'
      }
    ],
    cart: []
  };

  let memory = null;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Data saved before products had photos has no `img`; take it from the seed.
  function withImages(state) {
    (state.products || []).forEach((p) => {
      const seed = SEED.products.find((s) => s.id === p.id);
      if (!p.img && seed) p.img = seed.img;
    });
    return state;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return withImages(JSON.parse(raw));
    } catch (e) { /* storage blocked: fall back to memory */ }
    return clone(memory || SEED);
  }
  function save(state) {
    memory = clone(state);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* keep in memory only */ }
  }
  function reset() {
    memory = null;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    return clone(SEED);
  }
  // Fires when the other page (in another tab) changes the data.
  function onExternalChange(cb) {
    window.addEventListener('storage', (e) => { if (e.key === KEY) cb(load()); });
  }

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let dateFmt;
  try { dateFmt = new Intl.DateTimeFormat('ar-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long' }); } catch (e) { dateFmt = null; }
  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'اليوم';
    return dateFmt ? dateFmt.format(d) : iso.slice(0, 10);
  }

  function stars(n) {
    let h = '';
    for (let i = 1; i <= 5; i++) h += `<span class="${i <= Math.round(n) ? 'on' : ''}">★</span>`;
    return `<span class="stars" role="img" aria-label="${Number(n).toFixed(1)} من 5">${h}</span>`;
  }

  function productStats(state, pid) {
    const rs = state.reviews.filter((r) => r.productId === pid);
    const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
    const dist = [5, 4, 3, 2, 1].map((s) => rs.filter((r) => r.rating === s).length);
    return { count: rs.length, avg, dist, pending: rs.filter((r) => !r.reply).length };
  }
  function storeAvg(state) {
    const rs = state.reviews;
    return rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
  }
  function replyRate(state) {
    const n = state.reviews.length;
    return n ? Math.round((state.reviews.filter((r) => r.reply).length / n) * 100) : 0;
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2800);
  }

  const ART = {
    bottle: '<rect x="50" y="16" width="20" height="14" rx="3" class="f-ink"/><rect x="55" y="29" width="10" height="9" class="f-ink"/><rect x="32" y="38" width="56" height="64" rx="14" class="f-glass"/><rect x="44" y="58" width="32" height="20" rx="4" class="f-label"/>',
    box: '<path d="M52 12 q7 7 0 13 q-7 6 0 13" class="f-smoke"/><path d="M68 18 q6 6 0 11 q-6 5 0 11" class="f-smoke"/><rect x="26" y="50" width="68" height="50" rx="9" class="f-glass"/><rect x="26" y="50" width="68" height="15" rx="7" class="f-ink"/><rect x="44" y="74" width="32" height="14" rx="3" class="f-label"/>',
    candle: '<path d="M60 14c7 9 7 16 0 21c-7-5-7-12 0-21z" class="f-flame"/><rect x="58" y="34" width="4" height="12" class="f-ink"/><rect x="32" y="46" width="56" height="56" rx="10" class="f-glass"/><rect x="34" y="64" width="52" height="16" class="f-label"/>',
    jar: '<rect x="36" y="32" width="48" height="16" rx="5" class="f-ink"/><rect x="30" y="47" width="60" height="55" rx="16" class="f-glass"/><rect x="42" y="64" width="36" height="20" rx="4" class="f-label"/>',
    dropper: '<rect x="54" y="12" width="12" height="20" rx="6" class="f-ink"/><rect x="50" y="31" width="20" height="11" rx="2" class="f-ink"/><rect x="38" y="42" width="44" height="60" rx="10" class="f-glass"/><rect x="46" y="60" width="28" height="22" rx="3" class="f-label"/>',
    spray: '<rect x="54" y="14" width="24" height="10" rx="3" class="f-ink"/><rect x="54" y="23" width="14" height="16" class="f-ink"/><rect x="40" y="39" width="42" height="63" rx="12" class="f-glass"/><rect x="48" y="60" width="26" height="20" rx="3" class="f-label"/>'
  };
  const art = (kind) => `<svg viewBox="0 0 120 120" aria-hidden="true">${ART[kind] || ART.bottle}</svg>`;

  // Product photo for the big tiles; the drawn icon stands in if there is no photo or it fails to load.
  const photo = (p, alt) => p.img
    ? `<img class="photo" src="${esc(p.img)}" alt="${esc(alt || '')}" width="900" height="900" decoding="async" data-art="${esc(p.art)}">`
    : art(p.art);
  // Small square photo for lists (cart, product performance).
  const thumb = (p) => p.img
    ? `<img class="photo thumb" src="${esc(p.img)}" alt="" width="900" height="900" decoding="async" loading="lazy">`
    : '';
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('photo')) return;
    if (img.dataset.art && img.parentElement && img.parentElement.classList.contains('product-art')) img.outerHTML = art(img.dataset.art);
    else img.hidden = true;
  }, true);

  const money = (n) => `${n} ر.س`;
  const uid = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.App = { load, save, reset, onExternalChange, esc, fmtDate, stars, productStats, storeAvg, replyRate, toast, art, photo, thumb, money, uid };
})();
