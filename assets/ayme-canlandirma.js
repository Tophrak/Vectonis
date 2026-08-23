// ─── Pişiriyor tanıtım sayfası — ekran canlandırmaları ────────────────────
// Mockup'lar duran resim değil: masalar dolup boşalıyor, sipariş mutfağa
// düşüyor ve hazır olunca listeden çıkıyor. Sayfanın anlattığı akışı
// göstermek için — süs olsun diye değil.
//
// Kurallar:
//   • Hareketi azalt tercihi açıksa hiçbir şey oynatılmaz.
//   • Yalnız ekranda görünen mockup çalışır; sekme arkadayken durur.
//   • JS yüklenmezse mockup'lar sabit ama eksiksiz görünür.
// ── 0) Ekran seçici ───────────────────────────────────────────────────────
// Panel metninin altındaki düğmeler, yanındaki çerçevede hangi ekranın
// görüneceğini belirler. Bu bir süs değil gezinme aracı; "hareketi azalt"
// tercihinden bağımsız olarak her zaman çalışır.
(function ekranSecici() {
  'use strict';

  document.querySelectorAll('[data-ekran-sec]').forEach(function (liste) {
    var ad = liste.getAttribute('data-ekran-sec');
    var yigin = document.querySelector('[data-ekran-yigin="' + ad + '"]');
    var baslik = document.querySelector('[data-ekran-baslik="' + ad + '"]');
    if (!yigin) return;

    var ekranlar = Array.prototype.filter.call(yigin.children, function (e) {
      return e.classList.contains('ay-ekran');
    });
    var dugmeler = Array.prototype.slice.call(liste.querySelectorAll('button'));
    if (!ekranlar.length || ekranlar.length !== dugmeler.length) return;

    function goster(sira) {
      ekranlar.forEach(function (e, i) { e.classList.toggle('is-active', i === sira); });
      dugmeler.forEach(function (d, i) {
        d.classList.toggle('is-active', i === sira);
        d.setAttribute('aria-selected', i === sira ? 'true' : 'false');
      });
      // Pencere başlık çubuğu da o ekranın adını gösterir
      if (baslik) baslik.textContent = ekranlar[sira].getAttribute('data-baslik') || '';
    }

    dugmeler.forEach(function (d, i) {
      d.addEventListener('click', function () { goster(i); });
    });

    // Klavyeyle gezinme: sekme şeridinde sol/sağ ok, Home ve End
    liste.addEventListener('keydown', function (olay) {
      var suanki = dugmeler.indexOf(document.activeElement);
      if (suanki === -1) return;
      var hedef = null;
      if (olay.key === 'ArrowRight') hedef = (suanki + 1) % dugmeler.length;
      else if (olay.key === 'ArrowLeft') hedef = (suanki - 1 + dugmeler.length) % dugmeler.length;
      else if (olay.key === 'Home') hedef = 0;
      else if (olay.key === 'End') hedef = dugmeler.length - 1;
      if (hedef === null) return;
      olay.preventDefault();
      dugmeler[hedef].focus();
      goster(hedef);
    });
  });
})();

// ── Ekran canlandırmaları ─────────────────────────────────────────────────
(function () {
  'use strict';

  // Kurulum izi: hareket görünmediğinde sebebin betik mi, tercih mi, yoksa
  // görünürlük mü olduğunu konsoldan ayırt edebilmek için.
  window.__canlandirma = { kuruldu: false, sebep: null };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__canlandirma.sebep = 'hareket-azalt-tercihi';
    return;
  }

  /** Öğe ekranda görünürken `calistir`, çıkınca `durdur` çağırır. */
  function gorunurkenCalistir(hedef, calistir, durdur) {
    if (!('IntersectionObserver' in window)) { calistir(); return; }
    var acik = false;
    new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting && !acik) { acik = true; calistir(); }
        else if (!g.isIntersecting && acik) { acik = false; durdur(); }
      });
    }, { threshold: 0.25 }).observe(hedef);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && acik) durdur();
      else if (!document.hidden && acik) calistir();
    });
  }

  // ── 1) Masa ızgarası: masalar dolar, adisyon kesilir, masa boşalır ──────
  // Sayfada birden çok masa ızgarası var (kahraman bölümü + garson sekmesi);
  // her biri kendi zamanlayıcısıyla, yalnız görünürken çalışır.
  document.querySelectorAll('.ay-masalar').forEach(function masalar(izgara) {
    var kutular = Array.prototype.slice.call(izgara.querySelectorAll('.ay-masa'));
    if (!kutular.length) return;

    var zamanlayici = null;

    function tutarYaz() {
      // 180–2400 ₺ arası, 10'un katı; binlik ayıracı Türkçe biçimde
      var t = (Math.floor(Math.random() * 223) + 18) * 10;
      return t.toLocaleString('tr-TR') + ' ₺';
    }

    function durumAta(kutu, durum) {
      kutu.classList.remove('ay-masa--bos', 'ay-masa--dolu', 'ay-masa--odeme');
      kutu.classList.add('ay-masa--' + durum);
      var etiket = kutu.querySelector('small');
      if (etiket) etiket.textContent = (durum === 'bos') ? 'BOŞ' : tutarYaz();

      // Vurgu sınıfı her seferinde yeniden tetiklensin
      kutu.classList.remove('ay-masa--degisti');
      void kutu.offsetWidth;
      kutu.classList.add('ay-masa--degisti');
    }

    function adim() {
      var kutu = kutular[Math.floor(Math.random() * kutular.length)];
      // Gerçek akış: boş → dolu → (adisyon kesildi) ödeme → boş
      if (kutu.classList.contains('ay-masa--bos')) durumAta(kutu, 'dolu');
      else if (kutu.classList.contains('ay-masa--dolu')) durumAta(kutu, 'odeme');
      else durumAta(kutu, 'bos');
    }

    gorunurkenCalistir(izgara,
      function () { if (!zamanlayici) zamanlayici = setInterval(adim, 2200); },
      function () { clearInterval(zamanlayici); zamanlayici = null; });
  });

  // ── 2) Mutfak ekranı: sipariş gelir, hazırlanır, listeden düşer ─────────
  (function mutfak() {
    var liste = document.querySelector('.ay-kds');
    if (!liste) return;
    var kartlar = Array.prototype.slice.call(liste.querySelectorAll('.ay-kds-kart'));
    if (kartlar.length < 2) return;

    var masaNolari = [3, 7, 9, 11, 14, 2, 18, 6];
    var garsonlar = ['Hasan', 'Ayşe', 'Murat', 'Elif'];
    var yemekler = [
      ['2x ADANA KEBAP', '1x AYRAN'],
      ['1x KÜNEFE', '2x ÇAY'],
      ['3x LAHMACUN', '1x ŞALGAM'],
      ['1x KARIŞIK PİDE'],
      ['2x TAVUK ŞİŞ', '1x ÇOBAN SALATA']
    ];
    var sira = 0, sayac = 0, zamanlayici = null;

    function saatYaz() {
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function kartiTazele(kart) {
      var no = masaNolari[sayac % masaNolari.length];
      var garson = garsonlar[sayac % garsonlar.length];
      var urunler = yemekler[sayac % yemekler.length];
      sayac++;

      kart.classList.remove('ay-kds-kart--yapiliyor', 'ay-kds-kart--paket');
      var ust = kart.querySelector('.ay-kds-kart__ust');
      if (ust) {
        ust.innerHTML = '🍽️ MASA ' + no + '<b>' + garson + ' · ' + saatYaz() + '</b>';
      }
      var govde = kart.querySelector('.ay-kds-kart__gvd');
      if (govde) {
        govde.innerHTML = urunler.map(function (u) { return '<div>' + u + '</div>'; }).join('');
      }
      // Yeni sipariş iki düğmeyle gelir (BAŞLA + HAZIR)
      var alt = kart.querySelector('.ay-kds-kart__alt');
      if (alt) {
        alt.innerHTML =
          '<span class="ay-kds-btn ay-kds-btn--basla">BAŞLA</span>' +
          '<span class="ay-kds-btn ay-kds-btn--hazir">HAZIR</span>';
      }
    }

    function adim() {
      var kart = kartlar[sira % kartlar.length];
      sira++;

      if (!kart.classList.contains('ay-kds-kart--yapiliyor')) {
        // Aşçı "BAŞLA" dedi: kart sarıya döner, yalnız HAZIR düğmesi kalır
        kart.classList.add('ay-kds-kart--yapiliyor');
        var alt = kart.querySelector('.ay-kds-kart__alt');
        if (alt) alt.innerHTML = '<span class="ay-kds-btn ay-kds-btn--hazir">HAZIR</span>';
        return;
      }

      // "HAZIR" dendi: kart listeden düşer, yerine yeni sipariş gelir
      kart.classList.add('ay-kds-kart--cikiyor');
      setTimeout(function () {
        kart.classList.remove('ay-kds-kart--cikiyor');
        kartiTazele(kart);
        kart.classList.remove('ay-kds-kart--yeni');
        void kart.offsetWidth;
        kart.classList.add('ay-kds-kart--yeni');
      }, 560);
    }

    gorunurkenCalistir(liste,
      function () { if (!zamanlayici) zamanlayici = setInterval(adim, 2600); },
      function () { clearInterval(zamanlayici); zamanlayici = null; });
  })();

  // ── 3) İstatistik: sayı olan değerler sıfırdan sayarak gelir ───────────
  (function sayaclar() {
    var hedefler = Array.prototype.slice.call(document.querySelectorAll('.ay-stat__num'))
      .filter(function (el) { return /^\d+$/.test(el.textContent.trim()); });
    if (!hedefler.length || !('IntersectionObserver' in window)) return;

    var izleyici = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        izleyici.unobserve(g.target);

        var son = parseInt(g.target.textContent, 10);
        var baslangic = null, sure = 900;
        (function adim(zaman) {
          if (baslangic === null) baslangic = zaman;
          var oran = Math.min(1, (zaman - baslangic) / sure);
          // yumuşak yavaşlama
          var yumusak = 1 - Math.pow(1 - oran, 3);
          g.target.textContent = Math.round(son * yumusak);
          if (oran < 1) requestAnimationFrame(adim);
          else g.target.textContent = son;
        })(performance.now());
      });
    }, { threshold: 0.6 });

    hedefler.forEach(function (el) { izleyici.observe(el); });
  })();

  window.__canlandirma.kuruldu = true;
})();
