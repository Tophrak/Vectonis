/* NihaiRota tanıtım sayfaları — vx.js üzerine biner */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function yukle(img) {
    if (!img) return;
    var ert = img.getAttribute('data-src');
    if (ert) { img.src = ert; img.removeAttribute('data-src'); }
  }

  /* Rol sekmeleri */
  (function () {
    var tabs = [].slice.call(document.querySelectorAll('.rolebox__tab'));
    var panes = [].slice.call(document.querySelectorAll('[data-rolepane2]'));
    if (!tabs.length) return;
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var rol = t.getAttribute('data-role');
        tabs.forEach(function (x) {
          var on = x === t;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach(function (p) {
          var acik = p.getAttribute('data-rolepane2') === rol;
          p.hidden = !acik;
          if (acik) yukle(p.querySelector('.frame.is-active'));
        });
      });
    });
  })();

  /* Telefon ekran geçişleri */
  document.querySelectorAll('[data-frames]').forEach(function (block) {
    var frames = [].slice.call(block.querySelectorAll('.frame'));
    var btns = [].slice.call(block.querySelectorAll('.screens button'));
    if (frames.length < 2) return;
    var i = 0, timer = null;

    function goster(n) {
      i = n;
      frames.forEach(function (f, k) {
        f.classList.toggle('is-active', k === n);
        if (k === n) yukle(f);
      });
      btns.forEach(function (b, k) {
        b.classList.toggle('is-active', k === n);
        b.setAttribute('aria-selected', k === n ? 'true' : 'false');
      });
    }
    function basla() { if (!timer && !reduce && !block.hidden) timer = setInterval(function () { goster((i + 1) % frames.length); }, 2800); }
    function dur() { if (timer) { clearInterval(timer); timer = null; } }

    btns.forEach(function (b, k) {
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { dur(); goster(k); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) basla(); else dur(); });
      }, { threshold: .25 }).observe(block);
    } else { basla(); }
    block.addEventListener('mouseenter', dur);
    block.addEventListener('mouseleave', basla);
    goster(0);
  });

  /* Taraf seçici (kurum / servis firması) */
  (function () {
    var segler = [].slice.call(document.querySelectorAll('[data-seg]'));
    var gruplar = {};
    document.querySelectorAll('[data-seggroup]').forEach(function (el) {
      gruplar[el.getAttribute('data-seggroup')] = el;
    });
    if (!segler.length) return;
    segler.forEach(function (b) {
      b.addEventListener('click', function () {
        var ad = b.getAttribute('data-seg');
        segler.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        Object.keys(gruplar).forEach(function (k) {
          gruplar[k].hidden = k !== ad;
          if (k === ad) yukle(gruplar[k].querySelector('.webframe.is-active'));
        });
      });
    });
  })();

  /* Pencere galerisi */
  document.querySelectorAll('[data-seggroup], [data-gallery]').forEach(function (kap) {
    var kareler = [].slice.call(kap.querySelectorAll('.webframe'));
    var dugmeler = [].slice.call(kap.querySelectorAll('.picklist button'));
    if (kareler.length < 2 || !dugmeler.length) return;
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

  /* SSS */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var acik = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', acik ? 'false' : 'true');
      var cevap = document.getElementById(b.getAttribute('aria-controls'));
      if (cevap) cevap.hidden = acik;
    });
  });
})();
