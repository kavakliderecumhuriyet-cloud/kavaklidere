/* Kavaklıdere Dijital Mahalle Portalı – uygulama kodu (bağımlılık yok) */
(function () {
  "use strict";
  var D = window.SITE_DATA || {};
  var M = D.mahalle || {};
  var TZ = "Europe/Istanbul";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Tarih yardımcıları (Türkiye saati) ---------- */
  function todayISO() { return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); }
  function fmtDate(iso, opt) {
    if (!iso) return "";
    var d = new Date(iso.length === 10 ? iso + "T12:00:00+03:00" : iso);
    return new Intl.DateTimeFormat("tr-TR", Object.assign({ timeZone: TZ, day: "numeric", month: "long", year: "numeric" }, opt || {})).format(d);
  }
  var TODAY = todayISO();

  /* ---------- WhatsApp ---------- */
  var WA = M.whatsapp || "";
  function waLink(t) { return "https://wa.me/" + WA + (t ? "?text=" + encodeURIComponent(t) : ""); }

  /* ---------- Duyurular ---------- */
  var TUR = { acil: "Acil", onemli: "Önemli", bilgi: "Bilgi" };
  var ALL = (D.duyurular || []).slice();
  function isArchived(a) { return a.bitis && a.bitis < TODAY; }
  function sortNews(list) {
    return list.slice().sort(function (a, b) {
      if (!!b.sabit - !!a.sabit) return (!!b.sabit) - (!!a.sabit);
      if (a.tarih !== b.tarih) return a.tarih < b.tarih ? 1 : -1;
      var w = { acil: 0, onemli: 1, bilgi: 2 };
      return (w[a.tur] || 3) - (w[b.tur] || 3);
    });
  }
  var ACTIVE = sortNews(ALL.filter(function (a) { return !isArchived(a); }));
  var ARCHIVE = ALL.filter(isArchived).sort(function (a, b) { return a.tarih < b.tarih ? 1 : -1; });
  var byId = {}; ALL.forEach(function (a) { byId[a.id] = a; });

  function tags(a, light) {
    var h = '<span class="tag t-' + a.tur + '">' + TUR[a.tur] + "</span>";
    if (a.sabit) h += '<span class="tag t-sabit">Sabit</span>';
    if (a.ornek) h += '<span class="tag t-ornek" title="Tasarım için yazılmış örnek, gerçek duyuru değildir">Örnek</span>';
    if (isArchived(a)) h += '<span class="tag t-sabit">Arşiv</span>';
    return h;
  }
  var ICONS = {
    acil: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 3l9 16H3L12 3zM12 10v4M12 17h.01"/>',
    onemli: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 10v4h3l6 4V6L7 10H4zm13-1a4 4 0 0 1 0 6"/>',
    bilgi: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01"/>'
  };
  function newsCard(a) {
    var ph = a.foto ? '<img src="' + esc(a.foto) + '" alt="" loading="lazy">' : '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[a.tur] + "</svg>";
    return '<a class="news-card' + (a.sabit ? " pinned" : "") + '" href="#d-' + esc(a.id) + '">' +
      '<div class="ph ' + a.tur + (a.foto ? " has-img" : "") + '">' + ph + "</div>" +
      '<div class="bd"><div class="tags">' + tags(a) + '<span class="tag t-sabit">' + esc(a.kat || "") + "</span></div>" +
      "<h3>" + esc(a.baslik) + "</h3><p>" + esc(a.metin) + "</p>" +
      '<div class="dt"><span>Yayın: ' + fmtDate(a.tarih) + "</span>" + (a.olay ? "<span>· " + esc(a.olay) + "</span>" : "") + "</div></div></a>";
  }

  /* Acil şerit */
  (function () {
    var u = ACTIVE.filter(function (a) { return a.tur === "acil"; })[0];
    if (!u || store.sget("acilKapali") === u.id) return;
    $("#acilLink").textContent = (u.ornek ? "[Örnek] " : "") + u.baslik + ": " + u.metin;
    $("#acilLink").href = "#d-" + u.id;
    $("#acil").hidden = false;
    $("#acilKapat").addEventListener("click", function () { $("#acil").hidden = true; store.sset("acilKapali", u.id); });
  })();

  /* Öne çıkan duyuru (hero) */
  (function () {
    var f = ACTIVE.filter(function (a) { return a.tur === "acil" && !a.ornek; })[0] || ACTIVE.filter(function (a) { return a.sabit; })[0] || ACTIVE[0];
    var el = $("#oneCikan");
    if (!f) { el.hidden = true; return; }
    el.innerHTML = '<div class="lbl">Öne çıkan ' + tags(f) + "</div><h2>" + esc(f.baslik) + "</h2><p>" + esc(f.metin) + "</p>" +
      (f.olay ? '<p><b>' + esc(f.olay) + "</b></p>" : "") + '<a class="more" href="#d-' + esc(f.id) + '">Ayrıntılar →</a>';
  })();

  /* Ana sayfa haber kartları */
  var evHaber = $("#evHaber");
  evHaber.innerHTML = ACTIVE.slice(0, 6).map(newsCard).join("") || '<div class="empty">Şu an yayında duyuru yok.</div>';

  /* Duyurular sayfası: arama, filtre, arşiv */
  (function () {
    var cats = ["Tümü", "Acil", "Önemli", "Bilgi"];
    var kats = []; ALL.forEach(function (a) { if (a.kat && kats.indexOf(a.kat) < 0) kats.push(a.kat); });
    var f = "Tümü", q = "";
    $("#dFiltre").innerHTML = cats.concat(kats).map(function (c, i) { return '<button type="button" aria-pressed="' + (i === 0) + '">' + esc(c) + "</button>"; }).join("");
    function match(a) {
      var tf = f === "Tümü" || TUR[a.tur] === f || a.kat === f;
      var s = (a.baslik + " " + a.metin + " " + (a.kat || "") + " " + (a.olay || "")).toLocaleLowerCase("tr");
      return tf && (!q || s.indexOf(q) >= 0);
    }
    function render() {
      var l = ACTIVE.filter(match), ar = ARCHIVE.filter(match);
      $("#dListe").innerHTML = l.map(newsCard).join("") || '<div class="empty">Aramanıza uygun güncel duyuru bulunamadı.</div>';
      $("#dArsiv").innerHTML = ar.map(newsCard).join("") || '<div class="empty">Arşivde uygun duyuru yok.</div>';
    }
    $("#dFiltre").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      f = b.textContent; $$("#dFiltre button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render();
    });
    $("#dAra").addEventListener("input", function (e) { q = e.target.value.trim().toLocaleLowerCase("tr"); render(); });
    $("#arsivBtn").addEventListener("click", function () {
      var a = $("#dArsiv"); a.hidden = !a.hidden;
      this.setAttribute("aria-expanded", String(!a.hidden)); this.textContent = a.hidden ? "Arşivi göster (" + ARCHIVE.length + ")" : "Arşivi gizle";
    });
    $("#arsivBtn").textContent = "Arşivi göster (" + ARCHIVE.length + ")";
    render();
  })();

  /* Detay penceresi */
  var dlg = $("#detay"), lastRoute = null;
  function openDetail(id) {
    var a = byId[id]; if (!a) return;
    $("#detayIcerik").innerHTML = '<div class="row">' + tags(a) + "</div>" +
      '<h2 id="detayBaslik">' + esc(a.baslik) + "</h2><p style=\"margin:0;font-size:17px\">" + esc(a.metin) + "</p>" +
      "<dl>" + (a.olay ? "<dt>Ne zaman</dt><dd>" + esc(a.olay) + "</dd>" : "") +
      "<dt>Yayın</dt><dd>" + fmtDate(a.tarih) + "</dd>" + (a.kaynak ? "<dt>Duyuran</dt><dd>" + esc(a.kaynak) + "</dd>" : "") +
      (a.kat ? "<dt>Kategori</dt><dd>" + esc(a.kat) + "</dd>" : "") + "</dl>" +
      '<div class="row"><button type="button" class="btn ghost" id="paylas">Bağlantıyı kopyala</button>' +
      '<a class="wa" href="' + waLink("Kavaklıdere duyurusu: " + a.baslik + " – " + location.href.split("#")[0] + "#d-" + a.id) + '" target="_blank" rel="noopener">WhatsApp\'ta paylaş</a></div>' +
      (a.ornek ? '<p class="note">Bu metin tasarımı göstermek için yazılmış bir örnektir, gerçek bir duyuru değildir.</p>' : "");
    $("#paylas").addEventListener("click", function () {
      var url = location.href.split("#")[0] + "#d-" + a.id, b = this;
      var done = function () { b.textContent = "Kopyalandı"; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { b.textContent = url; });
      else b.textContent = url;
    });
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }
  function closeDetail() { if (dlg.open) dlg.close(); }
  $("#detayKapat").addEventListener("click", closeDetail);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDetail(); });
  dlg.addEventListener("close", function () { if (/^#d-/.test(location.hash)) { try { history.replaceState(null, "", lastRoute ? "#" + lastRoute : location.pathname); } catch (e) {} } });

  /* ---------- Şimdi yayında (döngü) ---------- */
  (function () {
    var L = ACTIVE; if (!L.length) { $(".onair").hidden = true; return; }
    var i = 0, paused = false, t0 = performance.now(), DUR = 8000, el = {
      tag: $("#oaTag"), b: $("#oaBaslik"), m: $("#oaMetin"), meta: $("#oaMeta"), bar: $("#oaBar"), dots: $("#oaDots")
    };
    el.dots.innerHTML = L.map(function (a, j) { return '<button type="button" aria-label="' + esc(a.baslik) + '"></button>'; }).join("");
    function show(n) {
      i = (n + L.length) % L.length; var a = L[i];
      el.tag.textContent = TUR[a.tur] + (a.ornek ? " · Örnek" : "");
      el.b.textContent = a.baslik; el.m.textContent = a.metin;
      el.meta.textContent = [a.olay, a.kaynak].filter(Boolean).join(" · ");
      $$("button", el.dots).forEach(function (d, j) { d.setAttribute("aria-current", String(j === i)); });
      t0 = performance.now();
    }
    el.dots.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show($$("button", el.dots).indexOf(b)); });
    $("#oaIleri").addEventListener("click", function () { show(i + 1); });
    $("#oaGeri").addEventListener("click", function () { show(i - 1); });
    $("#oaDur").addEventListener("click", function () {
      paused = !paused; this.textContent = paused ? "Devam et" : "Duraklat";
      if (!paused) t0 = performance.now() - (parseFloat(el.bar.style.width) || 0) / 100 * DUR;
    });
    if (reduce) { paused = true; $("#oaDur").textContent = "Devam et"; }
    function tick(now) {
      if (!paused && !document.hidden) { var p = Math.min(1, (now - t0) / DUR); el.bar.style.width = p * 100 + "%"; if (p >= 1) show(i + 1); }
      requestAnimationFrame(tick);
    }
    show(0); requestAnimationFrame(tick);
  })();

  /* ---------- Saat ---------- */
  (function () {
    var fs = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
    var fd = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
    function up() { var n = new Date(); $("#saat").textContent = fs.format(n); $("#tarih").textContent = fd.format(n) + " · Türkiye saati"; }
    up(); setInterval(up, 15000);
  })();

  /* ---------- Hava durumu (Open-Meteo) ---------- */
  var WMO = {
    0: ["Açık", "sun"], 1: ["Çoğunlukla açık", "sun"], 2: ["Parçalı bulutlu", "part"], 3: ["Kapalı", "cloud"],
    45: ["Sis", "fog"], 48: ["Kırağılı sis", "fog"], 51: ["Hafif çisenti", "rain"], 53: ["Çisenti", "rain"], 55: ["Yoğun çisenti", "rain"],
    56: ["Dondurucu çisenti", "rain"], 57: ["Dondurucu çisenti", "rain"], 61: ["Hafif yağmur", "rain"], 63: ["Yağmur", "rain"], 65: ["Şiddetli yağmur", "rain"],
    66: ["Dondurucu yağmur", "rain"], 67: ["Dondurucu yağmur", "rain"], 71: ["Hafif kar", "snow"], 73: ["Kar", "snow"], 75: ["Yoğun kar", "snow"], 77: ["Kar taneleri", "snow"],
    80: ["Hafif sağanak", "rain"], 81: ["Sağanak", "rain"], 82: ["Şiddetli sağanak", "rain"], 85: ["Kar sağanağı", "snow"], 86: ["Yoğun kar sağanağı", "snow"],
    95: ["Gök gürültülü fırtına", "storm"], 96: ["Dolu ile fırtına", "storm"], 99: ["Şiddetli dolu ile fırtına", "storm"]
  };
  var WI = {
    sun: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>',
    moon: '<path fill="currentColor" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    part: '<circle cx="9" cy="9" r="3.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 2.5v1.5M2.5 9H4M4.4 4.4l1 1M13.6 4.4l-1 1"/></g><path fill="var(--muted)" d="M8 20h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.5A3.3 3.3 0 0 0 8 20z"/>',
    cloud: '<path fill="var(--muted)" d="M7 19h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 1.6A3.8 3.8 0 0 0 7 19z"/>',
    fog: '<g stroke="var(--muted)" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></g>',
    rain: '<path fill="var(--muted)" d="M7 15h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 1.6A3.8 3.8 0 0 0 7 15z"/><g stroke="#3B82C4" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g>',
    snow: '<path fill="var(--muted)" d="M7 15h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 1.6A3.8 3.8 0 0 0 7 15z"/><g fill="#7FB3E0"><circle cx="8" cy="19" r="1.3"/><circle cx="12" cy="20.5" r="1.3"/><circle cx="16" cy="19" r="1.3"/></g>',
    storm: '<path fill="var(--muted)" d="M7 14h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 1.6A3.8 3.8 0 0 0 7 14z"/><path fill="currentColor" d="M12 13l-3 5h3l-1 4 4-6h-3l1-3z"/>'
  };
  function wIcon(code, day) {
    var k = (WMO[code] || ["", "cloud"])[1]; if (k === "sun" && day === 0) k = "moon";
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + WI[k] + "</svg>";
  }
  function dir(deg) { return ["K", "KD", "D", "GD", "G", "GB", "B", "KB"][Math.round(((deg % 360) / 45)) % 8]; }
  var n0 = function (x) { return Math.round(x); };

  function loadWeather() {
    var box = $("#hava"), c = M.konum || { lat: 38.42573, lon: 28.35379 };
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max" +
      "&timezone=Europe%2FIstanbul&forecast_days=7&wind_speed_unit=kmh";
    var head = box.querySelector(".sec-head").outerHTML;
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
    fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (w) {
        clearTimeout(timer);
        var cur = w.current, d = w.daily;
        // Ölçüm 3 saatten eskiyse güncel gibi göstermeyelim
        var measured = new Date(cur.time + ":00+03:00"), ageMin = (Date.now() - measured.getTime()) / 60000;
        if (!(ageMin < 180)) throw new Error("stale");
        var desc = (WMO[cur.weather_code] || ["—"])[0];
        var days = d.time.map(function (t, j) {
          var mn = d.temperature_2m_min[j], cls = mn <= 0 ? " freeze" : mn <= 3 ? " frost" : "";
          var lbl = j === 0 ? "Bugün" : new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: TZ }).format(new Date(t + "T12:00:00+03:00"));
          return '<div class="w-day' + cls + '" title="' + esc((WMO[d.weather_code[j]] || [""])[0]) + '"><span class="d">' + lbl + "</span>" + wIcon(d.weather_code[j], 1) +
            "<span><b>" + n0(d.temperature_2m_max[j]) + "°</b> <span class=\"mm\">" + n0(mn) + "°</span></span>" +
            '<span class="pp">%' + (d.precipitation_probability_max[j] == null ? "–" : d.precipitation_probability_max[j]) + "</span></div>";
        }).join("");
        // Tarımsal uyarılar: önümüzdeki 3 gün
        var alerts = [];
        for (var j = 0; j < Math.min(3, d.time.length); j++) {
          var mn = d.temperature_2m_min[j], day = j === 0 ? "bugün" : j === 1 ? "yarın" : new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone: TZ }).format(new Date(d.time[j] + "T12:00:00+03:00"));
          if (mn <= 0) alerts.push(["danger", "Don uyarısı: " + day + " en düşük " + n0(mn) + "°C bekleniyor. Fidan ve bağları koruyun."]);
          else if (mn <= 3) alerts.push(["warn", "Don riski: " + day + " en düşük " + n0(mn) + "°C. Açık ve rüzgârsız gecelerde arazide sıcaklık daha düşük olabilir."]);
          if ([96, 99].indexOf(d.weather_code[j]) >= 0) alerts.push(["danger", "Dolu riski: " + day + " dolu ile fırtına bekleniyor."]);
        }
        var alertHtml = alerts.length ? alerts.map(function (a) { return '<div class="w-alert ' + a[0] + '" role="status">' + esc(a[1]) + "</div>"; }).join("")
          : '<div class="w-alert ok">Önümüzdeki 3 günde don veya dolu beklenmiyor.</div>';
        var t = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(measured);
        box.innerHTML = head +
          '<div class="w-top"><div class="w-now">' + wIcon(cur.weather_code, cur.is_day) +
          '<div><div class="w-temp">' + n0(cur.temperature_2m) + '°</div><div class="w-desc">' + esc(desc) + "</div></div></div>" +
          '<div class="w-meta"><div><span>Hissedilen</span><b>' + n0(cur.apparent_temperature) + "°C</b></div>" +
          "<div><span>Rüzgâr</span><b>" + n0(cur.wind_speed_10m) + " km/s " + dir(cur.wind_direction_10m) + "</b></div>" +
          "<div><span>Yağış ihtimali</span><b>%" + (d.precipitation_probability_max[0] == null ? "–" : d.precipitation_probability_max[0]) + "</b></div></div></div>" +
          alertHtml + '<div class="w-days" aria-label="7 günlük tahmin">' + days + "</div>" +
          '<div class="w-foot"><span>Ölçüm saati: ' + t + " · Model verisi, mahalle koordinatı " + c.lat.toFixed(3) + ", " + c.lon.toFixed(3) + "</span><span>Kaynak: Open-Meteo</span></div>";
      })
      .catch(function () {
        clearTimeout(timer);
        box.innerHTML = head + '<div class="w-empty">Hava durumu bilgisi şu an alınamıyor. İnternet bağlantınızı kontrol edip sayfayı daha sonra yenileyin. Eski veriler gösterilmez.</div>';
      });
  }
  loadWeather();
  setInterval(function () { if (!document.hidden && !$("[data-view='']").hidden) loadWeather(); }, 30 * 60000);

  /* ---------- Arka plan videoları: her biri 15 sn (kısa klipler döngüde) ---------- */
  (function () {
    var vids = $$("#hero video"), cap = $("#heroCap");
    var slow = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ""));
    if (!vids.length || reduce || slow) { vids.forEach(function (v) { v.remove(); }); return; }
    var i = 0;
    vids.forEach(function (v) { v.addEventListener("error", function () { v.classList.remove("on"); }); });
    function play(n) {
      var v = vids[n]; v.preload = "auto";
      try { v.currentTime = 0; } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      vids.forEach(function (x, j) { x.classList.toggle("on", j === n); });
      cap.textContent = v.dataset.cap;
      var nx = vids[(n + 1) % vids.length]; if (nx.preload === "none") nx.preload = "auto";
    }
    play(0);
    setInterval(function () {
      if (document.hidden) return;
      var prev = i; i = (i + 1) % vids.length; play(i);
      setTimeout(function () { vids[prev].pause(); }, 1300);
    }, 15000);
  })();

  /* ---------- İlanlar (satılık / kiralık) ---------- */
  var setIlanTip = (function () {
    var KATS = {
      satilik: ["Tümü", "Ev ve daire", "Arsa", "Tarla ve bağ", "Traktör ve tarım makineleri", "Hayvan", "İkinci el", "Tarım ürünleri", "İş ilanları", "Diğer"],
      kiralik: ["Tümü", "Daire", "Müstakil ev", "Arsa ve tarla", "İşyeri", "Diğer"]
    };
    var METIN = {
      satilik: ["Satılık ilanlar", "Mahallemizdeki ev, daire, arsa, tarla, bağ, tarım makinesi, hayvan ve eşya ilanları. İlanlar muhtarlık kontrolünden sonra yayınlanır; telefon numarası yalnızca ilan sahibinin isteğiyle gösterilir.", "satılık bir ilan"],
      kiralik: ["Kiralık ilanlar", "Mahallemizde kiralık daire, müstakil ev, arsa, tarla ve işyeri ilanları. İlanlar muhtarlık kontrolünden sonra yayınlanır; telefon numarası yalnızca ilan sahibinin isteğiyle gösterilir.", "kiralık bir ilan"]
    };
    var DIS = {
      satilik: "https://www.google.com/search?q=" + encodeURIComponent("site:sahibinden.com satılık Alaşehir Kavaklıdere"),
      kiralik: "https://www.google.com/search?q=" + encodeURIComponent("site:sahibinden.com kiralık Alaşehir Kavaklıdere")
    };
    var ALLI = (D.ilanlar || []).slice().sort(function (a, b) { return ((a.satildi || a.kiralandi ? 1 : 0) - (b.satildi || b.kiralandi ? 1 : 0)) || (a.tarih < b.tarih ? 1 : -1); });
    var tip = "satilik", f = "Tümü", q = "";
    function chips() {
      $("#iFiltre").innerHTML = KATS[tip].map(function (c, i) { return '<button type="button" aria-pressed="' + (c === f) + '">' + c + "</button>"; }).join("");
    }
    function render() {
      var L = ALLI.filter(function (x) { return (x.tip || "satilik") === tip; });
      var r = L.filter(function (x) {
        var s = (x.baslik + " " + x.aciklama + " " + x.kat).toLocaleLowerCase("tr");
        return (f === "Tümü" || x.kat === f) && (!q || s.indexOf(q) >= 0);
      });
      var bitti = function (x) { return x.satildi ? "SATILDI" : x.kiralandi ? "KİRALANDI" : ""; };
      $("#iListe").innerHTML = r.length ? r.map(function (x) {
        var b = bitti(x);
        return '<article class="ilan' + (b ? " satildi" : "") + '">' +
          (x.foto ? '<img src="' + esc(x.foto) + '" alt="" loading="lazy" style="border-radius:10px;aspect-ratio:4/3;object-fit:cover">' : "") +
          '<span class="kat">' + esc(x.kat) + (b ? " · " + b : "") + (x.ornek ? " · Örnek ilan" : "") + "</span>" +
          "<h3>" + esc(x.baslik) + '</h3><div class="fiyat">' + esc(x.fiyat) + (tip === "kiralik" && x.fiyat && !/ay/.test(x.fiyat) ? ' <small style="font-size:15px">/ ay</small>' : "") + "</div><p>" + esc(x.aciklama) + "</p>" +
          '<div class="alt"><span>' + fmtDate(x.tarih) + "</span>" +
          (x.tel && !b ? '<a href="https://wa.me/' + esc(x.tel) + '" target="_blank" rel="noopener">İlan sahibine yaz</a>' : "") + "</div></article>";
      }).join("") : '<div class="empty">' + (L.length ? "Aramanıza uygun ilan yok." : "Şu an yayında " + (tip === "kiralik" ? "kiralık" : "satılık") + " ilan yok.") + " İlan vermek için muhtarlığa WhatsApp'tan yazın.</div>";
    }
    $("#iFiltre").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; f = b.textContent;
      $$("#iFiltre button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render();
    });
    $("#iAra").addEventListener("input", function (e) { q = e.target.value.trim().toLocaleLowerCase("tr"); render(); });
    return function (t) {
      tip = t === "kiralik" ? "kiralik" : "satilik"; f = "Tümü";
      $("#iBaslik").textContent = METIN[tip][0]; $("#iAciklama").textContent = METIN[tip][1];
      $("#segSatilik").setAttribute("aria-selected", String(tip === "satilik"));
      $("#segKiralik").setAttribute("aria-selected", String(tip === "kiralik"));
      $("#ilanVer").href = waLink("Merhaba Muhtarım, mahalle sitesinde yayınlanması için " + METIN[tip][2] + " vermek istiyorum.");
      $("#disLink").href = DIS[tip];
      chips(); render();
    };
  })();
  setIlanTip("satilik");

  /* ---------- Evrak takibi ---------- */
  (function () {
    var E = D.evraklar || [], ADIM = ["alindi", "islemde", "hazir", "teslim"], AD = ["Teslim alındı", "İşlemde", "Hazır", "Teslim edildi"];
    $("#evrakForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var no = $("#evrakNo").value.trim().toUpperCase(), out = $("#evrakSonuc");
      if (!no) { out.textContent = "Lütfen takip numaranızı yazın."; return; }
      var r = E.filter(function (x) { return x.no.toUpperCase() === no; })[0];
      if (!r) { out.innerHTML = "<b>" + esc(no) + "</b> bulunamadı. Numarayı kontrol edin; sorun devam ederse muhtarlığa WhatsApp'tan yazın."; return; }
      var k = ADIM.indexOf(r.durum);
      out.innerHTML = "<div><b>" + esc(r.no) + "</b> · " + esc(r.tur) + '</div><div class="muted" style="font-size:14px">Son güncelleme: ' + fmtDate(r.tarih) + "</div>" +
        '<div class="steps">' + AD.map(function (a, j) { return '<span class="' + (j < k ? "ok" : j === k ? "now" : "") + '">' + a + "</span>"; }).join("") + "</div>";
      $("#bildirimNo").value = r.no; upd();
    });
    function upd() {
      var no = $("#bildirimNo").value.trim().toUpperCase();
      $("#bildirimBtn").href = waLink("Merhaba Muhtarım, " + (no ? no + " numaralı " : "") + "evrakım hazır olduğunda bana WhatsApp'tan haber verebilir misiniz?");
    }
    $("#bildirimNo").addEventListener("input", upd); upd();
  })();

  /* ---------- Videolar ---------- */
  $("#vListe").innerHTML = (D.videolar || []).map(function (v) {
    var href = v.url || "https://www.youtube.com/results?search_query=" + encodeURIComponent(v.ara || v.baslik);
    return '<a class="vid" href="' + esc(href) + '" target="_blank" rel="noopener"><div class="thumb" style="--th:' + esc(v.renk || "") + '"><span class="cat">' + esc(v.kat) +
      '</span><span class="play" aria-hidden="true"></span><span class="dur">' + esc(v.sure || "") + '</span></div><div class="bd"><h3>' + esc(v.baslik) + "</h3></div></a>";
  }).join("");

  /* ---------- Muhtar ve sabit bilgiler ---------- */
  $("#muhtarAd").textContent = M.muhtar || ""; $("#fMuhtar").textContent = M.muhtar || "";
  $("#muhtarWa").textContent = M.whatsappGoster || ""; $("#muhtarWa").href = waLink("");
  $("#waFloat").href = waLink("Merhaba Muhtarım, ");
  $("#svcWa").href = waLink("Merhaba Muhtarım, ");
  $("#svcWaText").textContent = "WhatsApp üzerinden muhtarımız " + (M.muhtar || "") + "'a ulaşın.";
  /* ---------- Teknik destek ---------- */
  (function () {
    var T = D.teknik; if (!T) return;
    var link = "https://wa.me/" + T.whatsapp + "?text=" + encodeURIComponent("Merhaba Özkan Bey, Kavaklıdere sitesi hakkında teknik bir sorum var: ");
    $("#teknikAd").textContent = T.ad; $("#teknikWa").textContent = T.whatsappGoster; $("#teknikWa").href = link; $("#teknikBtn").href = link;
    $("#fTeknikTxt").textContent = T.ad; $("#fTeknik").href = link; $("#fTeknikNo").textContent = "WhatsApp: " + T.whatsappGoster;
    $("#teknikBtnTxt").textContent = T.ad + "'a yaz";
    $("#svcTeknik").href = link; $("#svcTeknikAd").textContent = T.ad;
  })();

  /* ---------- Ziyaretçi sayacı ---------- */
  (function () {
    var S = D.sayac; if (!S || !window.fetch) return;
    var real = /github\.io$|kavaklidere/i.test(location.hostname) && !/localhost|127\.0\.0\.1/.test(location.hostname);
    var nf = new Intl.NumberFormat("tr-TR");
    var day = TODAY.replace(/-/g, "");
    var first = !store.sget("ziyaret-sayildi");
    var op = first && real ? "hit" : "get";
    function call(key, op2) {
      return fetch(S.servis + "/" + op2 + "/" + S.ad + "/" + key).then(function (r) {
        if (r.status === 404) return { value: 0 };
        if (!r.ok) throw new Error(r.status); return r.json();
      });
    }
    function countUp(el, to) {
      if (reduce || to < 20) { el.textContent = nf.format(to); return; }
      var t0 = performance.now(), from = Math.floor(to * 0.85);
      (function step(now) { var p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
        el.textContent = nf.format(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(step); })(t0);
    }
    Promise.all([call("toplam", op), call("gun-" + day, op)]).then(function (v) {
      if (first && real) store.sset("ziyaret-sayildi", "1");
      $("#sayac").hidden = false;
      countUp($("#cToplam"), v[0].value); countUp($("#cBugun"), v[1].value);
      $("#fSayac").textContent = "Toplam " + nf.format(v[0].value) + " ziyaret · Bugün " + nf.format(v[1].value);
    }).catch(function () { /* servis yanıt vermezse sayaç gizli kalır */ });
  })();

  $("#fGuncel").textContent = fmtDate(D.guncelleme, { hour: "2-digit", minute: "2-digit" });
  (function () { var m = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric" }).format(new Date()));
    $$("#takvim tr").forEach(function (tr) { if (tr.dataset.m.split(",").map(Number).indexOf(m) >= 0) { tr.className = "cur"; tr.lastElementChild.insertAdjacentHTML("beforeend", " · <b>şu anki dönem</b>"); } }); })();

  /* ---------- Tema ---------- */
  (function () {
    var root = document.documentElement, btn = $("#temaBtn"), ico = $("#temaIco");
    var SUN = '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    var MOON = '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>';
    function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
    function paint() { var d = isDark(); ico.innerHTML = d ? SUN : MOON; btn.setAttribute("aria-label", d ? "Açık temaya geç" : "Koyu temaya geç"); }
    btn.addEventListener("click", function () { var t = isDark() ? "light" : "dark"; root.setAttribute("data-theme", t); store.set("tema", t); paint(); });
    paint();
  })();

  /* ---------- Mobil menü ---------- */
  var menu = $("#menu"), mBtn = $("#menuBtn");
  function setMenu(open) { menu.classList.toggle("open", open); mBtn.setAttribute("aria-expanded", String(open)); mBtn.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç"); }
  mBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Yönlendirme ---------- */
  var VIEWS = ["", "duyurular", "ilanlar", "kiralik", "evrak", "videolar", "mahallemiz", "hizmetler"];
  function route() {
    var h = (location.hash || "").replace(/^#\/?/, ""), detail = null;
    if (/^d-/.test(h)) { detail = h.slice(2); h = lastRoute !== null ? lastRoute : "duyurular"; }
    if (VIEWS.indexOf(h) < 0) h = "";
    var changed = h !== lastRoute || !document.body.dataset.ready;
    var vw = h === "kiralik" ? "ilanlar" : h;
    if (vw === "ilanlar") setIlanTip(h === "kiralik" ? "kiralik" : "satilik");
    $$(".view").forEach(function (v) { v.hidden = v.dataset.view !== vw; });
    $$("#menu a").forEach(function (a) { if (a.dataset.r === h) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    setMenu(false);
    lastRoute = h; document.body.dataset.ready = "1";
    var t = { "": "Kavaklıdere Cumhuriyet Mahallesi – Alaşehir, Manisa", duyurular: "Duyurular", ilanlar: "Satılık ilanlar", kiralik: "Kiralık ilanlar", evrak: "Evrak takibi", videolar: "Videolar", mahallemiz: "Mahallemiz", hizmetler: "Hizmetler" }[h];
    document.title = h ? t + " – Kavaklıdere Cumhuriyet Mahallesi" : t;
    if (detail) openDetail(detail);
    else { closeDetail(); if (changed) { window.scrollTo(0, 0); if (h) $("#icerik").focus({ preventScroll: true }); } }
  }
  window.addEventListener("hashchange", route);
  route();
})();
