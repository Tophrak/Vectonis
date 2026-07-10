// ─── VECTONIS site davranışları ──────────────────────────────────────────
// Bağımlılıksız imza hareket dili: cam nav, reveal, ilerleme çizgisi,
// rota kuyruklu yıldızı, imleç spotu, 3B eğilme, mıknatıs butonlar.
// Hepsi progressive-enhancement — JS yoksa site tam ve okunur kalır.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1) Üst çubuk: kaydırınca cam zemin
  var nav = document.querySelector('.nav');
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });
  }

  // 2) Görünüme girince yumuşak reveal (reduced-motion'da CSS zaten kapatır)
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 3) Aktif sayfa bağlantısını işaretle
  var here = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav__link').forEach(function (a) {
    var target = a.getAttribute('href');
    var isHome = (target === './' || target === 'index.html') && (here === '/' || /\/$/.test(here));
    if (isHome || (target !== './' && here.indexOf(target.replace('./', '')) !== -1)) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // 4) Kaydırma ilerleme çizgisi (ember)
  if (!reduceMotion) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var progressTick = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    };
    progressTick();
    window.addEventListener('scroll', progressTick, { passive: true });
    window.addEventListener('resize', progressTick, { passive: true });
  }

  // 5) Kahraman rota sahnesi: ember kuyruklu yıldızı yol boyunca süzülür
  var scene = document.querySelector('.hero__scene');
  if (scene && !reduceMotion) {
    var path = scene.querySelector('.scene-path');
    var halo = scene.querySelector('.comet-halo');
    var core = scene.querySelector('.comet-core');
    if (path && halo && core && typeof path.getTotalLength === 'function') {
      var len = path.getTotalLength();
      var t0 = null;
      var DURATION = 9000; // tam tur ~9sn — telaşsız
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var t = ((ts - t0) % DURATION) / DURATION;
        // yumuşak giriş-çıkış hissi için hafif ease
        var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var pt = path.getPointAtLength(eased * len);
        halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
        core.setAttribute('cx', pt.x); core.setAttribute('cy', pt.y);
        // uçlara yaklaşırken sön, ortada parla
        var glow = Math.sin(Math.PI * t);
        halo.setAttribute('opacity', (0.25 + 0.55 * glow).toFixed(2));
        core.setAttribute('opacity', (0.5 + 0.5 * glow).toFixed(2));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  // 6) İmleç spotu + hafif 3B eğilme (yalnız gerçek imleçte)
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        if (card.classList.contains('card--tilt')) {
          var rx = ((ev.clientY - r.top) / r.height - 0.5) * -3.2;
          var ry = ((ev.clientX - r.left) / r.width - 0.5) * 3.2;
          card.style.transform =
            'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        }
      });
      card.addEventListener('pointerleave', function () {
        if (card.classList.contains('card--tilt')) card.style.transform = '';
      });
    });

    // Mıknatıs butonlar: imlece 4px kadar süzülür
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (ev) {
        var r = btn.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = 'translate(' + (dx * 4).toFixed(1) + 'px,' + (dy * 3 - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }
})();
