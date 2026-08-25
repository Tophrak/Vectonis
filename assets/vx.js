/* Vectonis ana site — ortak davranışlar */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Gezinme zemini */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobil menü */
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

  /* Görünüme girme (emniyet ağlı) */
  var fired = 0, io = null;
  function hepsi() {
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
  }
  function tara() {
    var items = [].slice.call(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduce) { hepsi(); return; }
    if (!io) {
      io = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { fired++; e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    }
    items.forEach(function (el) { io.observe(el); });
  }
  setTimeout(function () { if (!fired) hepsi(); }, 3000);
  tara();
})();
