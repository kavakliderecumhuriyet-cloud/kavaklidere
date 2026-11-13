/* Kavaklıdere – çerez ve yerel depolama tercih yönetimi
 * - Zorunlu olmayan kayıtlar (işlevsel, analitik) yalnızca ziyaretçi izin verince kullanılır.
 * - Tercih yalnızca bu cihazda saklanır (localStorage "kvk-cerez-tercih"); sunucuya gönderilmez.
 * - Tercih 12 ay sonra veya politika sürümü değişince yeniden sorulur.
 * Diğer kodlar için: window.Cerez.izin("islevsel"|"analitik"|"pazarlama"), window.Cerez.ac(),
 * document "cerez-degisti" olayı (detail = tercih nesnesi).
 */
(function () {
  "use strict";
  var ANAHTAR = "kvk-cerez-tercih";
  var SURUM = 1;                       // Politika değişirse artırın: herkesten yeniden izin istenir.
  var GECERLILIK_GUN = 365;
  // Kategoriye göre, izin geri alınınca silinecek kayıtlar
  var KAYITLAR = {
    islevsel: { local: ["tema", "appKurKapali"], session: [] },
    analitik: { local: [], session: ["ziyaret-sayildi"] },
    pazarlama: { local: [], session: [] }
  };
  var KATEGORILER = [
    { id: "zorunlu", ad: "Zorunlu", sabit: true,
      metin: "Web sitesinin temel işlevlerini gerçekleştirmek için gereklidir: çerez tercihinizin hatırlanması, kapattığınız acil duyuru şeridinin o oturumda tekrar çıkmaması ve uygulama olarak yüklendiğinde sayfaların internetsiz açılabilmesi. Her zaman aktiftir." },
    { id: "islevsel", ad: "İşlevsel",
      metin: "Seçtiğiniz açık/koyu görünümü ve “Uygulamayı yükle” kutusunu kapattığınızı sonraki ziyaretlerinizde hatırlamak için kullanılır. Kapalıyken bu tercihler yalnızca tarayıcıyı kapatana kadar geçerli olur." },
    { id: "analitik", ad: "Analitik",
      metin: "Ana sayfadaki ziyaretçi sayacı içindir: ziyaretiniz, harici sayaç servisine (abacus.jasoncameron.dev) “bir ziyaret oldu” olarak bildirilir ve bir oturumda iki kez sayılmamanız için tarayıcıda kısa süreli bir işaret tutulur. Kapalıyken sayaç servisine hiç bağlanılmaz." },
    { id: "pazarlama", ad: "Pazarlama", yok: true,
      metin: "Bu sitede şu anda reklam veya pazarlama amaçlı çerez ya da takip kodu kullanılmamaktadır. Bu nedenle bu seçenek kapalıdır ve açılamaz." }
  ];

  function oku() {
    try {
      var t = JSON.parse(localStorage.getItem(ANAHTAR) || "null");
      if (!t || t.s !== SURUM || !t.t) return null;
      if ((Date.now() - Date.parse(t.t)) / 864e5 > GECERLILIK_GUN) return null;
      return t;
    } catch (e) { return null; }
  }
  var tercih = oku();

  function temizle(kat) {
    var k = KAYITLAR[kat]; if (!k) return;
    k.local.forEach(function (x) { try { localStorage.removeItem(x); } catch (e) {} });
    k.session.forEach(function (x) { try { sessionStorage.removeItem(x); } catch (e) {} });
  }
  function kaydet(i, a) {
    var onceki = tercih;
    tercih = { s: SURUM, i: !!i, a: !!a, p: false, t: new Date().toISOString() };
    try { localStorage.setItem(ANAHTAR, JSON.stringify(tercih)); } catch (e) {}
    // İşlevsel tercihler: izin varsa oturumdakini kalıcı yap, yoksa kalıcıyı yalnızca bu oturuma taşı
    KAYITLAR.islevsel.local.forEach(function (x) {
      try {
        if (tercih.i) { var sv = sessionStorage.getItem(x); if (sv !== null) { localStorage.setItem(x, sv); sessionStorage.removeItem(x); } }
        else { var lv = localStorage.getItem(x); if (lv !== null) sessionStorage.setItem(x, lv); }
      } catch (e) {}
    });
    if (!tercih.i) temizle("islevsel");
    if (!tercih.a) temizle("analitik");
    temizle("pazarlama");
    bannerKapat();
    try { document.dispatchEvent(new CustomEvent("cerez-degisti", { detail: tercih, bubbles: false })); } catch (e) {}
    if (onceki && onceki.a && !tercih.a) { /* analitik geri alındı: bir sonraki sayfa açılışında sayaç çalışmaz */ }
  }
  function izin(kat) {
    if (kat === "zorunlu") return true;
    if (!tercih) return false;
    return kat === "islevsel" ? tercih.i : kat === "analitik" ? tercih.a : false;
  }

  /* ---------- Görünüm ---------- */
  var CSS =
    ".cz-banner{position:fixed;left:12px;right:12px;bottom:12px;z-index:9000;max-width:760px;margin:0 auto;background:var(--surface,#fff);color:var(--ink,#1c241e);border:1px solid var(--line,#d9ddd6);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:18px 18px 16px;font-family:var(--body,system-ui,sans-serif)}" +
    ".cz-banner h2{font-family:var(--display,Georgia,serif);font-size:19px;margin:0 0 6px;line-height:1.25}" +
    ".cz-banner p{margin:0 0 4px;font-size:15px;line-height:1.5;color:var(--muted,#55605a)}" +
    ".cz-banner a{color:inherit;font-weight:600}" +
    ".cz-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}" +
    "@media (max-width:560px){.cz-btns{grid-template-columns:1fr}}" +
    ".cz-b{appearance:none;border:2px solid var(--green,#2f6b3f);background:var(--surface,#fff);color:var(--green-strong,#1f4d2c);font:700 15px/1.2 var(--body,system-ui,sans-serif);padding:12px 10px;border-radius:10px;cursor:pointer;min-height:46px}" +
    ".cz-b:hover{background:var(--green-soft,#e6efe7)}" +
    ".cz-b:focus-visible,.cz-sw input:focus-visible+span{outline:3px solid var(--amber,#c98a1a);outline-offset:2px}" +
    ".cz-dlg{border:0;border-radius:18px;padding:0;width:min(560px,calc(100vw - 24px));max-height:calc(100dvh - 24px);background:var(--surface,#fff);color:var(--ink,#1c241e);box-shadow:0 20px 60px rgba(0,0,0,.3)}" +
    ".cz-dlg::backdrop{background:rgba(0,0,0,.45)}" +
    ".cz-in{padding:20px 20px 16px;display:grid;gap:12px;font-family:var(--body,system-ui,sans-serif)}" +
    ".cz-in h2{font-family:var(--display,Georgia,serif);font-size:22px;margin:0}" +
    ".cz-in>p{margin:0;font-size:15px;line-height:1.5;color:var(--muted,#55605a)}" +
    ".cz-kat{border:1px solid var(--line,#d9ddd6);border-radius:12px;padding:12px 14px;display:grid;gap:6px}" +
    ".cz-ust{display:flex;align-items:center;justify-content:space-between;gap:12px}" +
    ".cz-ust strong{font-size:16px}" +
    ".cz-kat p{margin:0;font-size:14px;line-height:1.55;color:var(--muted,#55605a)}" +
    ".cz-etiket{font-size:13px;font-weight:700;color:var(--green-strong,#1f4d2c)}" +
    ".cz-sw{position:relative;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;font-weight:600}" +
    ".cz-sw input{position:absolute;opacity:0;width:1px;height:1px}" +
    ".cz-sw span{width:46px;height:26px;border-radius:13px;background:var(--line,#c9cfc6);position:relative;transition:background .2s;flex:none}" +
    ".cz-sw span:after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}" +
    ".cz-sw input:checked+span{background:var(--green,#2f6b3f)}" +
    ".cz-sw input:checked+span:after{transform:translateX(20px)}" +
    ".cz-sw input:disabled+span{opacity:.55;cursor:not-allowed}" +
    ".cz-alt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:sticky;bottom:0;background:var(--surface,#fff);padding-top:6px}" +
    "@media (max-width:560px){.cz-alt{grid-template-columns:1fr}}" +
    ".cz-kapat{position:absolute;top:10px;right:10px;border:0;background:transparent;font-size:22px;line-height:1;color:var(--muted,#55605a);cursor:pointer;padding:8px;border-radius:8px}" +
    ".cz-not{font-size:13px;color:var(--muted,#55605a);margin:0}";

  var banner, dlg;
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  function bannerGoster() {
    if (banner) { banner.hidden = false; return; }
    banner = el(
      '<section class="cz-banner" role="region" aria-labelledby="czBaslik">' +
      '<h2 id="czBaslik">Gizliliğiniz Bizim İçin Önemli</h2>' +
      '<p>Kavaklıdere Mahallesi web sitemizde, sitenin düzgün çalışmasını sağlamak, kullanıcı deneyimini geliştirmek ve izin vermeniz halinde ziyaret istatistiklerini analiz etmek amacıyla çerezler kullanılabilir.</p>' +
      '<p>Çerez tercihlerinizi dilediğiniz zaman değiştirebilirsiniz. <a href="/cerez-politikasi.html">Çerez Politikası</a></p>' +
      '<div class="cz-btns">' +
      '<button type="button" class="cz-b" data-cz="kabul">Tümünü Kabul Et</button>' +
      '<button type="button" class="cz-b" data-cz="red">Tümünü Reddet</button>' +
      '<button type="button" class="cz-b" data-cz="tercih">Çerez Tercihlerim</button>' +
      "</div></section>");
    document.body.appendChild(banner);
  }
  function bannerKapat() { if (banner) banner.hidden = true; }

  function dlgOlustur() {
    if (dlg) return dlg;
    dlg = el(
      '<dialog class="cz-dlg" aria-labelledby="czTBaslik"><div class="cz-in" style="position:relative">' +
      '<button type="button" class="cz-kapat" data-cz="kapat" aria-label="Kapat">✕</button>' +
      '<h2 id="czTBaslik">Çerez Tercihlerim</h2>' +
      '<p>Hangi kategorilere izin verdiğinizi seçin. Zorunlu olmayan kategoriler siz açmadıkça kapalıdır. Tercihiniz yalnızca bu cihazda saklanır. Ayrıntılar: <a href="/cerez-politikasi.html">Çerez Politikası</a>.</p>' +
      KATEGORILER.map(function (k) {
        var sag = k.sabit ? '<span class="cz-etiket">Her zaman aktif</span>'
          : '<label class="cz-sw"><input type="checkbox" data-kat="' + k.id + '"' + (k.yok ? " disabled" : "") + '><span aria-hidden="true"></span><em class="cz-durum" style="font-style:normal">Kapalı</em><b style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">' + k.ad + ' çerezleri</b></label>';
        return '<div class="cz-kat"><div class="cz-ust"><strong>' + k.ad + ' Çerezler</strong>' + sag + "</div><p>" + k.metin + "</p></div>";
      }).join("") +
      '<div class="cz-alt">' +
      '<button type="button" class="cz-b" data-cz="red">Tümünü Reddet</button>' +
      '<button type="button" class="cz-b" data-cz="kaydet">Seçimimi Kaydet</button>' +
      '<button type="button" class="cz-b" data-cz="kabul">Tümünü Kabul Et</button>' +
      "</div>" +
      '<p class="cz-not" id="czSon"></p>' +
      "</div></dialog>");
    document.body.appendChild(dlg);
    dlg.addEventListener("change", function (e) { if (e.target.matches("input[data-kat]")) durumYaz(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    return dlg;
  }
  function durumYaz() {
    Array.prototype.forEach.call(dlg.querySelectorAll("input[data-kat]"), function (c) {
      c.closest(".cz-sw").querySelector(".cz-durum").textContent = c.disabled ? "Kullanılmıyor" : c.checked ? "Açık" : "Kapalı";
    });
  }
  function ac() {
    dlgOlustur();
    var t = tercih || { i: false, a: false };
    dlg.querySelector('[data-kat="islevsel"]').checked = !!t.i;
    dlg.querySelector('[data-kat="analitik"]').checked = !!t.a;
    dlg.querySelector('[data-kat="pazarlama"]').checked = false;
    durumYaz();
    dlg.querySelector("#czSon").textContent = tercih
      ? "Son kaydedilen tercih: " + new Date(tercih.t).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" }) + "."
      : "Henüz bir tercih kaydetmediniz.";
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cz],[data-cerez-ac]");
    if (!b) return;
    if (b.hasAttribute("data-cerez-ac")) { e.preventDefault(); ac(); return; }
    var c = b.getAttribute("data-cz");
    if (c === "kabul") { kaydet(true, true); if (dlg && dlg.open) dlg.close(); }
    else if (c === "red") { kaydet(false, false); if (dlg && dlg.open) dlg.close(); }
    else if (c === "tercih") ac();
    else if (c === "kapat") dlg.close();
    else if (c === "kaydet") {
      kaydet(dlg.querySelector('[data-kat="islevsel"]').checked, dlg.querySelector('[data-kat="analitik"]').checked);
      dlg.close();
    }
  });

  function baslat() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    if (!tercih) {
      temizle("islevsel"); temizle("analitik"); // izin yoksa eski kayıtlar da kalmasın
      bannerGoster();
    }
  }
  window.Cerez = { izin: izin, ac: ac, tercih: function () { return tercih; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", baslat); else baslat();
})();
