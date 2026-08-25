/* ============================================================
   NihaiRota tanıtım sayfaları — ortak davranışlar
   Kullanan: urunler/nihairota.html, -mobil.html, -web.html
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Görünüme girme (emniyet ağlı) ───────────────────────── */
  var revealIO = null, revealFired = 0;

  function revealAll() {
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
  }

  function revealScan() {
    var items = [].slice.call(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduce) { revealAll(); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { revealFired++; e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
        });
      }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    }
    items.forEach(function (el) { revealIO.observe(el); });
  }
  setTimeout(function () { if (!revealFired) revealAll(); }, 3000);

  /* ── Gezinme zemini ──────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobil menü ──────────────────────────────────────────── */
  (function () {
    var menu = document.getElementById('mobmenu');
    var burger = document.getElementById('burger');
    var close = document.getElementById('mobclose');
    if (!menu || !burger) return;
    function set(open) {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { set(true); });
    if (close) close.addEventListener('click', function () { set(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  })();

  /* ── Taraf seçici + görsel galerisi (web paneli sayfası) ─── */
  (function () {
    var segler = [].slice.call(document.querySelectorAll('[data-webseg]'));
    var kaplar = {};
    document.querySelectorAll('[data-webgroup]').forEach(function (el) {
      kaplar[el.getAttribute('data-webgroup')] = el;
    });
    if (!Object.keys(kaplar).length) return;

    segler.forEach(function (b) {
      b.addEventListener('click', function () {
        var ad = b.getAttribute('data-webseg');
        segler.forEach(function (x) {
          var acik = x === b;
          x.classList.toggle('is-active', acik);
          x.setAttribute('aria-selected', acik ? 'true' : 'false');
        });
        Object.keys(kaplar).forEach(function (k) { kaplar[k].hidden = k !== ad; });
        revealScan();
      });
    });

    function yukle(img) {
      if (!img) return;
      var ertelenen = img.getAttribute('data-src');
      if (ertelenen) { img.src = ertelenen; img.removeAttribute('data-src'); }
    }

    Object.keys(kaplar).forEach(function (ad) {
      var kap = kaplar[ad];
      var kareler = [].slice.call(kap.querySelectorAll('.webframe'));
      var dugmeler = [].slice.call(kap.querySelectorAll('.weblist button'));
      if (kareler.length < 2) return;
      dugmeler.forEach(function (b, n) {
        b.addEventListener('click', function () {
          yukle(kareler[n]);
          yukle(kareler[n + 1]);
          kareler.forEach(function (f, k) { f.classList.toggle('is-active', k === n); });
          dugmeler.forEach(function (d, k) {
            d.classList.toggle('is-active', k === n);
            d.setAttribute('aria-selected', k === n ? 'true' : 'false');
          });
        });
      });
    });
  })();

  /* ── Rol sekmeleri (mobil sayfası) ───────────────────────── */
  (function () {
    var tabs = [].slice.call(document.querySelectorAll('.showcase__tab'));
    var panes = [].slice.call(document.querySelectorAll('[data-rolepane]'));
    if (!tabs.length) return;
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var role = t.getAttribute('data-role');
        tabs.forEach(function (x) {
          var on = x === t;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach(function (p) { p.hidden = p.getAttribute('data-rolepane') !== role; });
        revealScan();
      });
    });
  })();

  /* ── Telefon çerçevesi: ekran geçişleri ──────────────────── */
  document.querySelectorAll('[data-frames]').forEach(function (block) {
    var frames = [].slice.call(block.querySelectorAll('.frame'));
    var btns = [].slice.call(block.querySelectorAll('.screens button'));
    if (frames.length < 2) return;
    var i = 0, timer = null;

    function show(n) {
      i = n;
      frames.forEach(function (f, k) {
        f.classList.toggle('is-active', k === n);
        if (k === n) {
          var ert = f.getAttribute('data-src');
          if (ert) { f.src = ert; f.removeAttribute('data-src'); }
        }
      });
      btns.forEach(function (b, k) {
        b.classList.toggle('is-active', k === n);
        b.setAttribute('aria-selected', k === n ? 'true' : 'false');
      });
    }
    function start() { if (!timer && !reduce && !block.hidden) timer = setInterval(function () { show((i + 1) % frames.length); }, 2800); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    btns.forEach(function (b, k) {
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { stop(); show(k); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: .25 }).observe(block);
    } else { start(); }
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);
    show(0);
  });

  /* ── SSS ─────────────────────────────────────────────────── */
  document.querySelectorAll('.sss__soru').forEach(function (b) {
    b.addEventListener('click', function () {
      var acik = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', acik ? 'false' : 'true');
      var cevap = document.getElementById(b.getAttribute('aria-controls'));
      if (cevap) cevap.hidden = acik;
    });
  });

  /* ── Kahraman görselinde imleç eğimi ─────────────────────── */
  if (finePointer && !reduce) {
    var stage = document.querySelector('.stage');
    var shot = document.querySelector('.stage__shot');
    if (stage && shot) {
      stage.addEventListener('pointermove', function (ev) {
        var r = stage.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        shot.style.transform = 'perspective(1400px) rotateY(' + (dx * 2.2).toFixed(2) + 'deg) rotateX(' + (-dy * 1.6).toFixed(2) + 'deg)';
      });
      stage.addEventListener('pointerleave', function () { shot.style.transform = ''; });
    }
  }

  revealScan();
})();
