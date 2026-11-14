/* KASTUDIOPRODUCTION v2 — interactions */
(() => {
  const CFG = window.KA_CONFIG || {};
  const REEL = window.KA_REEL || [];
  const WORK = window.KA_WORK || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!window.gsap;
  const root = document.documentElement;
  if (reduce) root.classList.add('reduce');
  const wa = text => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ---------- WhatsApp links ---------- */
  $$('[data-wa]').forEach(a => a.href = wa(a.dataset.wa));
  $$('.svc-link[data-svc]').forEach(a => a.addEventListener('click', () => {
    const v = { 'graphic design': 'Graphic design', 'AI video / animation': 'AI video / animation' }[a.dataset.svc] || 'Video editing';
    const r = $(`.pick input[value="${v}"]`); if (r) r.checked = true;
  }));
  $('.yr').textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .11 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (hasGsap && window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); closeMenu();
    lenis ? lenis.scrollTo(t, { offset: id === '#top' ? 0 : -60 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- nav ---------- */
  const nav = $('.nav'), burger = $('.burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------- intro ---------- */
  let seen = false; try { seen = sessionStorage.getItem('ka-intro') === '1'; sessionStorage.setItem('ka-intro', '1'); } catch (e) {}
  const heroIn = () => {
    if (!hasGsap || reduce) return;
    gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .09 });
    gsap.from('.kicker, .hero-sub, .hero-actions, .now-playing, .hud', { opacity: 0, y: 20, duration: .8, ease: 'power3.out', stagger: .06, delay: .3 });
  };
  if (!hasGsap || reduce || seen) { root.classList.add('no-intro'); heroIn(); }
  else {
    const paths = $$('.intro-k path');
    paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.timeline({ onComplete: () => root.classList.add('no-intro') })
      .to(paths, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut', stagger: .15 })
      .to(paths, { fill: '#ff914d', duration: .3 }, '-=.1')
      .to('.intro-word', { opacity: 1, y: -4, duration: .35 }, '-=.2')
      .to('.intro', { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut', delay: .25 })
      .add(heroIn, '-=.45');
    // never leave a visitor stuck behind the intro (e.g. tab opened in the background)
    setTimeout(() => root.classList.add('no-intro'), 4000);
  }

  /* ---------- hero showreel ---------- */
  const playlist = REEL.filter(r => !r.vertical);
  const vids = $$('.hero-vid');
  const npTitle = $('.np-title'), npCat = $('.np-cat'), npBar = $('.np-bar i'), clipNo = $('.clip-no'), tcEl = $('.tc');
  $('.clip-total').textContent = String(playlist.length).padStart(2, '0');
  const HOLD = 3600; let cur = 0, active = 0, timer = null, heroVisible = true, t0 = performance.now(), frames = 0;
  const load = (v, i) => { v.src = `assets/reel/${playlist[i].id}.mp4`; v.poster = `assets/reel/${playlist[i].id}.jpg`; v.load(); };
  function show(i) {
    const next = vids[1 - active], prev = vids[active];
    const go = () => {
      next.currentTime = 0; next.play().catch(() => {});
      next.classList.add('is-on'); prev.classList.remove('is-on');
      setTimeout(() => prev.pause(), 1000);
      active = 1 - active; cur = i;
      const c = playlist[i];
      npTitle.textContent = c.title; npCat.textContent = `${c.cat} · ${mmss(c.duration)}`;
      clipNo.textContent = String(i + 1).padStart(2, '0');
      if (npBar) { npBar.style.transition = 'none'; npBar.style.width = '0'; npBar.offsetWidth; npBar.style.transition = `width ${HOLD}ms linear`; npBar.style.width = '100%'; }
      schedule();
    };
    if (next.dataset.idx !== String(i)) { next.dataset.idx = i; load(next, i); }
    if (next.readyState >= 2) go(); else next.addEventListener('loadeddata', go, { once: true });
  }
  function schedule() { clearTimeout(timer); if (heroVisible && !document.hidden) timer = setTimeout(() => show((cur + 1) % playlist.length), HOLD); }
  if (playlist.length) {
    vids[0].dataset.idx = 0; load(vids[0], 0);
    vids[0].addEventListener('loadeddata', () => {
      vids[0].play().catch(() => {});
      const c = playlist[0]; npTitle.textContent = c.title; npCat.textContent = `${c.cat} · ${mmss(c.duration)}`; clipNo.textContent = '01';
      if (npBar) { npBar.style.transition = `width ${HOLD}ms linear`; requestAnimationFrame(() => npBar.style.width = '100%'); }
      // preload the next clip
      vids[1].dataset.idx = 1; load(vids[1], 1);
      schedule();
    }, { once: true });
    new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
      if (heroVisible) { vids[active].play().catch(() => {}); schedule(); } else { clearTimeout(timer); vids.forEach(v => v.pause()); }
    }, { threshold: .15 }).observe($('.hero'));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  }
  // timecode
  (function tick() {
    if (heroVisible) {
      const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 25);
      tcEl.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s) % 60, f].map(n => String(n).padStart(2, '0')).join(':');
    }
    requestAnimationFrame(tick);
  })();

  // rotating word
  const words = ['move', 'noticed', 'stick', 'pop', 'move'];
  const swap = $('.swap');
  if (hasGsap && !reduce && swap) {
    let w = 0;
    setInterval(() => {
      w = (w + 1) % (words.length - 1);
      gsap.to(swap, { yPercent: -100, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => {
        swap.textContent = words[w]; gsap.fromTo(swap, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' });
      } });
    }, 2600);
  }

  /* ---------- lazy autoplay helper ---------- */
  const playIO = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target.tagName === 'VIDEO' ? e.target : $('video', e.target);
    if (!v) return;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().then(() => e.target.classList.add('playing')).catch(() => {});
    } else { v.pause(); }
  }), { threshold: .35, rootMargin: '0px 0px 80px 0px' });

  /* ---------- video wall ---------- */
  const wall = $('#wall');
  REEL.forEach((r, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile rv' + (r.vertical ? ' tall' : (i === 0 || i === 9) ? ' big' : '');
    b.dataset.group = r.group; b.dataset.i = i;
    b.setAttribute('aria-label', `Play ${r.title} (${r.cat})`);
    b.innerHTML = `<img src="assets/reel/${r.id}.jpg" alt="" loading="lazy">
      <video muted loop playsinline preload="none" data-src="assets/reel/${r.id}.mp4"></video>
      <span class="tile-cap"><span><small>${r.cat}</small><b>${r.title}</b></span><span class="tile-dur">${mmss(r.duration)}</span></span>`;
    b.addEventListener('click', () => openLB('video', i));
    wall.appendChild(b); playIO.observe(b);
  });

  /* ---------- design masonry ---------- */
  const mas = $('#masonry');
  WORK.forEach((w, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'card rv'; b.dataset.group = w.cat;
    b.setAttribute('aria-label', `View ${w.title}`);
    b.innerHTML = `<img src="assets/work/${w.id}.webp" width="${w.w}" height="${w.h}" alt="${w.title}" loading="lazy"><span>${w.title}</span>`;
    b.addEventListener('click', () => openLB('image', i));
    mas.appendChild(b);
  });

  /* ---------- filters ---------- */
  function filters(btnSel, attr, items) {
    $$(btnSel).forEach(btn => btn.addEventListener('click', () => {
      $$(btnSel).forEach(x => { x.classList.toggle('on', x === btn); x.setAttribute('aria-pressed', String(x === btn)); });
      const f = btn.dataset[attr];
      $$(items).forEach(el => el.classList.toggle('hide', f !== 'all' && el.dataset.group !== f));
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
  }
  filters('[data-f]', 'f', '.tile'); filters('[data-g]', 'g', '.card');

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbMedia = $('.lb-media'), lbTitle = $('.lb-title'), lbCat = $('.lb-cat'), lbFull = $('.lb-full');
  let lbType = 'video', lbIdx = 0, lastFocus = null;
  const visibleIdx = () => $$(lbType === 'video' ? '.tile' : '.card').filter(el => !el.classList.contains('hide')).map(el => [...el.parentNode.children].indexOf(el));
  function renderLB() {
    lbMedia.innerHTML = '';
    if (lbType === 'video') {
      const r = REEL[lbIdx];
      const v = document.createElement('video');
      Object.assign(v, { src: `assets/reel/${r.id}.mp4`, poster: `assets/reel/${r.id}.jpg`, muted: true, loop: true, autoplay: true, playsInline: true });
      lbMedia.appendChild(v); v.play().catch(() => {});
      lbTitle.textContent = r.title; lbCat.textContent = `${r.cat} · full edit ${mmss(r.duration)}`;
      lbFull.hidden = false; lbFull.href = r.drive;
    } else {
      const w = WORK[lbIdx];
      const im = new Image(); im.src = `assets/work/${w.id}.webp`; im.alt = w.title;
      lbMedia.appendChild(im);
      lbTitle.textContent = w.title; lbCat.textContent = w.cat; lbFull.hidden = true;
    }
  }
  function openLB(type, i) {
    lbType = type; lbIdx = i; lastFocus = document.activeElement;
    renderLB(); lb.hidden = false; lenis && lenis.stop(); document.body.style.overflow = 'hidden';
    $('.lb-close').focus();
  }
  function closeLB() { lb.hidden = true; lbMedia.innerHTML = ''; lenis && lenis.start(); document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }
  function stepLB(d) { const v = visibleIdx(); const p = v.indexOf(lbIdx); lbIdx = v[(p + d + v.length) % v.length]; renderLB(); }
  $('.lb-close').addEventListener('click', closeLB);
  $('.lb-prev').addEventListener('click', () => stepLB(-1));
  $('.lb-next').addEventListener('click', () => stepLB(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') stepLB(-1); else if (e.key === 'ArrowRight') stepLB(1);
    else if (e.key === 'Tab') { const f = $$('button, a[href]:not([hidden])', lb); const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  /* ---------- service video ---------- */
  $$('.svc-media video').forEach(v => playIO.observe(v));

  /* ---------- brief form → WhatsApp ---------- */
  $('#brief').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const lines = [`Hi KASTUDIOPRODUCTION! I'd like a quote.`, ``, `Service: ${d.get('need')}`];
    if (d.get('name')) lines.push(`Name: ${d.get('name')}`);
    if (d.get('about')) lines.push(`Project: ${d.get('about')}`);
    if (d.get('when')) lines.push(`Deadline: ${d.get('when')}`);
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; countIO.unobserve(e.target);
    const el = e.target, end = +el.dataset.count;
    if (reduce || !hasGsap) { el.textContent = end; return; }
    const o = { v: 0 }; gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) });
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- scroll reveals ---------- */
  if (hasGsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch('.rv', { start: 'top 92%', once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .06, overwrite: true }) });
    $$('h2').forEach(h => gsap.from(h, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));
    gsap.from('.svc', { y: 70, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.svc-grid', start: 'top 85%' } });
    gsap.from('.steps li', { y: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
    gsap.to('.foot-big', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  } else { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); }

  /* ---------- 3D printer animation ---------- */
  // K mark, same outline as the logo (viewBox 520 300 800 940)
  const K = [
    [[549,798],[664,914],[1294,322],[1294,478],[755,960],[1035,1218],[871,1218],[664,1025],[664,1218],[549,1218]],
    [[840,957],[1293,567],[1293,1218],[1181,1218],[1181,826],[924,1038]]
  ];
  function printer(canvas, th, onProgress) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const LAYERS = 120, BUILD = 9000, HOLD_MS = 1800;
    // layout: K fills a box, extruded "depth" goes up-right
    const scale = Math.min(W * .5 / 800, H * .55 / 940);
    const ox = W / 2 - (520 + 400) * scale - W * .03, oy = H * .80 - 1218 * scale;
    const dep = { x: W * .06, y: -H * .045 };
    const kTop = oy + 322 * scale, kBot = oy + 1218 * scale;
    const P = ([x, y]) => [ox + x * scale, oy + y * scale];
    const path = (dx = 0, dy = 0) => { ctx.beginPath(); K.forEach(poly => { poly.forEach((pt, j) => { const [x, y] = P(pt); j ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy); }); ctx.closePath(); }); };
    let start = performance.now(), visible = false, raf = 0;
    function frame(now) {
      const t = now - start, cyc = BUILD + HOLD_MS;
      if (t > cyc + 500) start = now;
      const p = reduce ? 1 : Math.min(1, t / BUILD);
      const fade = t > cyc ? 1 - (t - cyc) / 500 : 1;
      ctx.clearRect(0, 0, W, H);
      // bed
      const bx = W * .14, bw = W * .72, by = kBot + 6, bh = H * .07;
      ctx.fillStyle = th.bed; ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw + dep.x * 1.4, by + dep.y * 1.4 - 0); ctx.lineTo(bx + dep.x * 1.4, by + dep.y * 1.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = th.bedEdge; ctx.fillRect(bx, by, bw, bh * .25);
      // frame uprights + top bar
      ctx.fillStyle = th.frame;
      const fl = W * .1, fr = W * .9 - 14, ft = H * .08;
      ctx.fillRect(fl, ft, 14, by + bh * .25 - ft); ctx.fillRect(fr, ft, 14, by + bh * .25 - ft); ctx.fillRect(fl, ft, fr - fl + 14, 14);
      // printed part
      const cutY = kBot - (kBot - kTop) * p;
      ctx.save(); ctx.globalAlpha = fade;
      ctx.beginPath(); ctx.rect(0, cutY + dep.y, W, H); ctx.clip();
      for (let s = 28; s >= 1; s--) { path(dep.x * s / 28, dep.y * s / 28); ctx.fillStyle = th.side; ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = fade;
      ctx.beginPath(); ctx.rect(0, cutY, W, H); ctx.clip();
      path(); ctx.fillStyle = th.face; ctx.fill();
      // layer lines
      ctx.clip(); ctx.strokeStyle = th.lines; ctx.lineWidth = 1;
      const step = (kBot - kTop) / LAYERS;
      for (let y = kBot; y > cutY; y -= step * 2) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
      // gantry + nozzle
      const gy = Math.min(cutY, kBot) - 26;
      const nx = ox + (560 + (1290 - 560) * (.5 + .5 * Math.sin(now / 260))) * scale + dep.x * .5;
      ctx.fillStyle = th.frame; ctx.fillRect(fl, gy - 6, fr - fl + 14, 10);
      ctx.fillStyle = th.head; roundRect(ctx, nx - 26, gy - 30, 52, 38, 6); ctx.fill();
      ctx.fillStyle = th.accent; ctx.fillRect(nx - 18, gy - 22, 10, 10);
      ctx.fillStyle = th.head; ctx.beginPath(); ctx.moveTo(nx - 8, gy + 8); ctx.lineTo(nx + 8, gy + 8); ctx.lineTo(nx, gy + 22); ctx.closePath(); ctx.fill();
      if (p < 1) { ctx.fillStyle = th.hot; ctx.beginPath(); ctx.arc(nx, gy + 24, 3, 0, 7); ctx.fill(); }
      onProgress && onProgress(p);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting; cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    }).observe(canvas);
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  const pct = $('.lab-pct'), bar = $('.lab-track i'), layer = $('.lab-layer');
  printer($('#printer'), { bed: '#16161633', bedEdge: '#16161666', frame: '#161616', head: '#161616', accent: '#ff914d', hot: '#fff3c4',
    face: '#f4efe7', side: '#c7b9a6', lines: '#00000014' }, p => {
      const n = Math.round(p * 100); pct.textContent = n + '%'; bar.style.width = n + '%'; layer.textContent = Math.round(p * 120);
    });
  printer($('.mini-printer'), { bed: '#ffffff14', bedEdge: '#ffffff26', frame: '#3a3a3a', head: '#4a4a4a', accent: '#ff914d', hot: '#ffd29a',
    face: '#ff914d', side: '#a9541f', lines: '#00000022' });
})();
