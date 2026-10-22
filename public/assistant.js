/* مساعد الرد على التقييمات: يحلل التقييم ويقترح ردًا مناسبًا لتجربة العميل */
(function () {
  const TOPICS = [
    { id: 'shipping', label: 'التوصيل', words: ['توصيل', 'شحن', 'تأخر', 'تاخر', 'متأخر'] },
    { id: 'packaging', label: 'التغليف', words: ['تغليف', 'علبة', 'العلبه', 'مكسور', 'انكسر', 'متفتت'] },
    { id: 'mismatch', label: 'مطابقة الصورة', words: ['مختلف', 'الصورة', 'الصوره', 'غير مطابق'] },
    { id: 'price', label: 'السعر', words: ['سعر', 'غالي', 'مرتفع'] },
    { id: 'size', label: 'الحجم', words: ['أكبر', 'اكبر', 'صغير', 'الحجم'] },
    { id: 'service', label: 'خدمة العملاء', words: ['خدمة العملاء', 'الواتساب', 'ما أحد رد', 'ما ردوا', 'تعاملهم', 'التعامل', 'تواصل'] },
    { id: 'quality', label: 'جودة المنتج', words: ['ريح', 'رائحة', 'ثبات', 'جودة', 'خفيف', 'أصلي', 'اصلي', 'فرق', 'فخم'] }
  ];
  const TOPIC_LABEL = Object.fromEntries(TOPICS.map((t) => [t.id, t.label]));

  const L = {
    friendly: {
      hello: (n) => [`هلا ${n}،`, `أهلًا ${n}،`, `يا هلا ${n}،`],
      open: {
        positive: (p) => [`شكرًا على تقييمك الحلو لـ${p}، كلامك أسعدنا مرة.`, `سعدنا كثير بتجربتك مع ${p}، وتقييمك يفرق معنا.`, `ممتنين لك على هالتقييم، وفرحنا إن تجربتك مع ${p} كانت عند توقعك.`],
        mixed: (p) => [`شكرًا على تقييمك الصريح لـ${p}، ملاحظاتك تهمنا.`, `نقدّر إنك شاركتنا رأيك في ${p} بكل وضوح.`, `شكرًا على وقتك وتقييمك لـ${p}، ناخذ كل ملاحظة بجدية.`],
        negative: (p) => [`نعتذر منك على تجربتك مع ${p}، وهذا مو المستوى اللي نرضاه لك.`, `آسفين جدًا إن تجربتك مع ${p} ما كانت مثل ما تستاهل.`, `حقك علينا، تجربتك مع ${p} ما تمثّلنا ونبي نصلحها.`]
      },
      praise: {
        quality: 'ويسعدنا إن الريحة والجودة كانت عند توقعك.',
        packaging: 'ونحرص على التغليف عشان يوصلك الطلب بأحلى شكل.',
        shipping: 'ويسعدنا إن التوصيل كان سريع.',
        service: 'وبنوصل شكرك لفريق خدمة العملاء.',
        price: 'ويسعدنا إنك شفت المنتج يستاهل سعره.'
      },
      issue: {
        shipping: 'نعتذر عن تأخر التوصيل، وراجعنا طلبك مع شركة الشحن عشان ما يتكرر.',
        packaging: 'وبخصوص التغليف، بنرسل لك بديل بدون أي تكلفة.',
        mismatch: 'ونقدر نستبدل لك المنتج فورًا باللي في الصورة.',
        price: 'ملاحظتك على السعر وصلت، وتابع عروضنا الجاية لأنها بتعجبك.',
        size: 'ملاحظتك على الحجم في محلها، ونشتغل على توفير حجم أكبر قريب.',
        service: 'وبخصوص التواصل، نبهنا فريق خدمة العملاء يكلمك اليوم.',
        quality: 'نتفهم إن النتيجة ما كانت مثل توقعك، ويسعدنا نساعدك تختار المنتج الأنسب لك.'
      },
      generic: 'نبي نفهم وش صار بالضبط عشان نصلحه.',
      contact: 'راسلنا من صفحة طلبك ونخدمك مباشرة.',
      coupon: (c) => `وهذا كود خصم ${c} على طلبك الجاي، تقديرًا لصبرك.`,
      close: {
        positive: ['ننتظرك في طلبك الجاي!', 'نشوفك قريب إن شاء الله.', 'دمت بخير ونتشرف بخدمتك دايم.'],
        mixed: ['نتمنى نكون عند حسن ظنك المرة الجاية.', 'نبي تجربتك الجاية تكون كاملة.'],
        negative: ['ثقتك تهمنا، ونبي نصلح الموقف.', 'نتمنى تعطينا فرصة ثانية.']
      }
    },
    formal: {
      hello: (n) => [`مرحبًا ${n}،`, `أهلًا بك ${n}،`, `تحية طيبة ${n}،`],
      open: {
        positive: (p) => [`نشكرك على تقييمك لـ${p}، ويسعدنا رضاك عنه.`, `يسعدنا أن ${p} نال إعجابك، ونقدّر مشاركتك لتجربتك.`, `نقدّر تقييمك الكريم لـ${p}.`],
        mixed: (p) => [`نشكرك على تقييمك لـ${p} وعلى ملاحظاتك القيّمة.`, `نقدّر مشاركتك رأيك في ${p} بكل وضوح.`, `نشكرك على وقتك في تقييم ${p}.`],
        negative: (p) => [`نعتذر عن تجربتك مع ${p}، فهي لا تعكس المستوى الذي نلتزم به.`, `نأسف لأن تجربتك مع ${p} لم تكن بالمستوى المطلوب.`, `نعتذر بصدق عمّا واجهته مع ${p}.`]
      },
      praise: {
        quality: 'ويسعدنا أن الرائحة والجودة جاءت كما توقعت.',
        packaging: 'ونحرص دائمًا على أن يصلك الطلب بتغليف يليق بك.',
        shipping: 'ويسعدنا أن التوصيل كان سريعًا.',
        service: 'وسننقل شكرك إلى فريق خدمة العملاء.',
        price: 'ويسعدنا أنك وجدت المنتج يستحق قيمته.'
      },
      issue: {
        shipping: 'وقد راجعنا تأخر التوصيل مع شركة الشحن لتفادي تكرار ذلك.',
        packaging: 'وبخصوص التغليف، سنرسل لك بديلًا دون أي تكلفة إضافية.',
        mismatch: 'ويسعدنا استبدال المنتج لك فورًا بما يطابق الصورة.',
        price: 'نقدّر ملاحظتك على السعر، وندعوك لمتابعة عروضنا القادمة.',
        size: 'ملاحظتك على الحجم في محلها، ونعمل على توفير حجم أكبر قريبًا.',
        service: 'وسيتواصل معك فريق خدمة العملاء اليوم لمتابعة طلبك.',
        quality: 'نتفهم أن النتيجة لم تكن كما توقعت، ويسعدنا مساعدتك في اختيار المنتج الأنسب لك.'
      },
      generic: 'نرغب في معرفة تفاصيل ما حدث لمعالجته على الفور.',
      contact: 'يمكنك مراسلتنا من صفحة الطلب وسنخدمك مباشرة.',
      coupon: (c) => `ونقدّم لك كود الخصم ${c} على طلبك القادم تقديرًا لصبرك.`,
      close: {
        positive: ['نتطلع لخدمتك مجددًا.', 'نسعد بخدمتك دائمًا.'],
        mixed: ['نأمل أن تكون تجربتك القادمة أفضل.', 'نسعى لأن نكون عند حسن ظنك.'],
        negative: ['ثقتك تهمنا، ونلتزم بمعالجة الموقف.', 'نأمل أن تمنحنا فرصة أخرى لخدمتك.']
      }
    }
  };

  // Text after "بس / لكن" is where the customer's complaint usually is.
  function analyze(review) {
    const text = review.text || '';
    const parts = text.split(/\s(?:بس|لكن|ولكن)\s/);
    const before = parts[0];
    const after = parts.slice(1).join(' ');
    const sentiment = review.rating >= 4 ? 'positive' : review.rating === 3 ? 'mixed' : 'negative';
    const has = (t, s) => t.words.some((w) => s.includes(w));
    const praise = [];
    const issues = [];
    TOPICS.forEach((t) => {
      if (after && has(t, after)) issues.push(t.id);
      else if (has(t, before)) (after || sentiment === 'positive' ? praise : issues).push(t.id);
    });
    const priority = sentiment === 'negative' ? 'urgent' : sentiment === 'mixed' || issues.length ? 'medium' : 'low';
    return { sentiment, praise, issues, priority };
  }

  function generate(review, product, opts) {
    const o = opts || {};
    const lib = L[o.tone] || L.friendly;
    const v = o.variant || 0;
    const a = analyze(review);
    const pick = (arr, k) => arr[(v + k) % arr.length];
    const first = (review.customer || '').trim().split(/\s+/)[0] || 'عميلنا';

    const body = [pick(lib.open[a.sentiment](product.name), 1)];
    a.praise.slice(0, 2).forEach((id) => { if (lib.praise[id]) body.push(lib.praise[id]); });
    a.issues.slice(0, 2).forEach((id) => body.push(lib.issue[id]));
    if (a.sentiment !== 'positive' && !a.issues.length) body.push(lib.generic);
    if (a.sentiment === 'negative') body.push(lib.contact);
    if (o.coupon) body.push(lib.coupon(o.coupon));

    return [pick(lib.hello(first), 0), body.join(' '), pick(lib.close[a.sentiment], 2), `— فريق ${o.storeName || 'المتجر'}`].join('\n');
  }

  const SENTIMENT = { positive: { label: 'إيجابي', cls: 'pill-good' }, mixed: { label: 'محايد', cls: 'pill-warn' }, negative: { label: 'سلبي', cls: 'pill-bad' } };
  const PRIORITY = { urgent: { label: 'عاجل', rank: 0 }, medium: { label: 'يحتاج انتباه', rank: 1 }, low: { label: 'شكر وتقدير', rank: 2 } };

  window.Assistant = { analyze, generate, TOPIC_LABEL, SENTIMENT, PRIORITY };
})();
