/*
 * Kavaklıdere fiber internet talep sunucusu – Cloudflare Worker + D1
 *
 * Herkese açık uçlar
 *   GET  /api/sokaklar        etkin sokak listesi
 *   POST /api/talep           talep kaydı (aynı sokak + bina + daire tek kayıt)
 *   GET  /api/istatistik      anonim, sokak bazında toplu sonuçlar
 * Yönetici uçları (Authorization: Bearer <ADMIN_PASSWORD>)
 *   GET  /yonetim             yönetici paneli
 *   GET  /api/yonetim/...     talepler, sokaklar, raporlar
 *
 * Gizli değerler (wrangler secret put): ADMIN_PASSWORD, IP_TUZU, isteğe bağlı TURNSTILE_SECRET
 * Ortam değişkenleri (wrangler.toml): IZINLI_KOKEN, ACIK (\"1\" iken kayıt alınır), GIZLEME_ESIGI
 */

const CEVAPLAR = { evet: "Evet", kararsiz: "Kararsız", hayir: "Hayır" };
const MUSTAKIL = "MUSTAKIL";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = corsBasliklari(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    try {
      const yol = url.pathname.replace(/\/+$/, "") || "/";
      if (yol === "/api/sokaklar" && req.method === "GET") return json(await sokaklar(env), 200, cors, 300);
      if (yol === "/api/talep" && req.method === "POST") return json(...(await talepKaydet(req, env)), cors);
      if (yol === "/api/istatistik" && req.method === "GET") return json(await istatistik(env), 200, cors, 60);
      if (yol === "/api/durum" && req.method === "GET") return json({ acik: env.ACIK === "1" }, 200, cors, 60);
      if (yol === "/yonetim") return new Response(YONETIM_HTML, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", ...GUVENLIK } });
      if (yol.startsWith("/api/yonetim/")) {
        if (!(await yoneticiMi(req, env))) return json({ hata: "Yetkisiz. Şifreyi kontrol edin." }, 401, {});
        return await yonetim(req, env, yol.slice("/api/yonetim/".length), url);
      }
      return json({ hata: "Bulunamadı" }, 404, cors);
    } catch (e) {
      console.error(e);
      return json({ hata: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." }, 500, cors);
    }
  }
};

/* ---------------- yardımcılar ---------------- */
const GUVENLIK = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"
};
function json(veri, durum = 200, basliklar = {}, onbellek = 0) {
  return new Response(JSON.stringify(veri), {
    status: durum,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": onbellek ? `public, max-age=${onbellek}` : "no-store", "x-content-type-options": "nosniff", ...basliklar }
  });
}
function corsBasliklari(req, env) {
  const koken = req.headers.get("origin") || "";
  const izinli = (env.IZINLI_KOKEN || "https://kavakliderem.com").split(",").map(s => s.trim());
  if (!izinli.includes(koken)) return {};
  return { "access-control-allow-origin": koken, "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" };
}
const simdi = () => new Date().toISOString();
const trUpper = s => s.toLocaleUpperCase("tr-TR");
// "3", " 03 ", "3a" → "3", "3", "3A" ; yalnızca rakam, harf, / ve - kabul edilir
function normalizeNo(s) {
  let v = trUpper(String(s || "").trim()).replace(/\s+/g, "");
  if (!v || v.length > 10 || !/^[0-9A-ZÇĞİÖŞÜ\/-]+$/.test(v)) return null;
  v = v.replace(/^0+(?=\d)/, "");
  return v;
}
async function ozet(metin) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metin));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function esitMi(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let fark = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) fark |= (x[i] || 0) ^ (y[i] || 0);
  return fark === 0;
}
async function yoneticiMi(req, env) {
  const h = req.headers.get("authorization") || "";
  const sifre = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 12 || !sifre) return false;
  return esitMi(sifre, env.ADMIN_PASSWORD);
}
async function kaydet(env, islem, ayrinti) {
  await env.DB.prepare("INSERT INTO islem_kaydi (tarih, islem, ayrinti) VALUES (?, ?, ?)").bind(simdi(), islem, ayrinti ? JSON.stringify(ayrinti) : null).run();
}
const trSirala = (a, b) => a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" });

/* ---------------- herkese açık ---------------- */
async function sokaklar(env) {
  const { results } = await env.DB.prepare("SELECT id, ad FROM sokaklar WHERE aktif = 1").all();
  return { sokaklar: results.sort((a, b) => trSirala(a.ad, b.ad)) };
}

async function hizSiniri(req, env, sinir = 20) {
  const ip = req.headers.get("cf-connecting-ip") || "yerel";
  const saat = new Date().toISOString().slice(0, 13);
  const anahtar = (await ozet((env.IP_TUZU || "tuz") + "|" + saat.slice(0, 10) + "|" + ip)).slice(0, 32);
  const row = await env.DB.prepare("SELECT sayi, pencere FROM hiz_siniri WHERE anahtar = ?").bind(anahtar).first();
  if (row && row.pencere === saat) {
    if (row.sayi >= sinir) return false;
    await env.DB.prepare("UPDATE hiz_siniri SET sayi = sayi + 1 WHERE anahtar = ?").bind(anahtar).run();
  } else {
    await env.DB.prepare("INSERT INTO hiz_siniri (anahtar, sayi, pencere) VALUES (?, 1, ?) ON CONFLICT(anahtar) DO UPDATE SET sayi = 1, pencere = excluded.pencere").bind(anahtar, saat).run();
  }
  return true;
}

async function talepKaydet(req, env) {
  if (env.ACIK !== "1") return [{ hata: "Başvurular henüz açılmadı." }, 403];
  let g;
  try { g = await req.json(); } catch { return [{ hata: "Geçersiz istek." }, 400]; }
  if (g.web_sitesi) return [{ tamam: true, durum: "yeni" }, 200]; // bot tuzağı: sessizce yok say
  if (g.kvkk !== true) return [{ hata: "Lütfen aydınlatma metnini okuduğunuzu onaylayın." }, 400];
  if (g.acik_riza !== true) return [{ hata: "Başvurunun kaydedilebilmesi için açık rıza gerekir." }, 400];
  const sokakId = Number(g.sokak_id);
  if (!Number.isInteger(sokakId)) return [{ hata: "Lütfen sokağınızı listeden seçin." }, 400];
  const sokak = await env.DB.prepare("SELECT id FROM sokaklar WHERE id = ? AND aktif = 1").bind(sokakId).first();
  if (!sokak) return [{ hata: "Seçilen sokak bulunamadı. Lütfen listeden seçin." }, 400];
  const bina = normalizeNo(g.bina);
  if (!bina) return [{ hata: "Bina / dış kapı numarasını kontrol edin (en fazla 10 karakter; rakam, harf, / veya -)." }, 400];
  let daire;
  if (g.mustakil === true) daire = MUSTAKIL;
  else {
    daire = normalizeNo(g.daire);
    if (!daire) return [{ hata: "Daire / iç kapı numarasını yazın veya “Müstakil ev”i seçin." }, 400];
  }
  if (!CEVAPLAR[g.cevap]) return [{ hata: "Lütfen abonelik tercihinizi seçin." }, 400];
  if (env.TURNSTILE_SECRET) {
    const f = new FormData(); f.append("secret", env.TURNSTILE_SECRET); f.append("response", String(g.dogrulama || ""));
    const r = await (await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: f })).json();
    if (!r.success) return [{ hata: "Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin." }, 400];
  }
  if (!(await hizSiniri(req, env))) return [{ hata: "Çok fazla deneme yapıldı. Lütfen bir saat sonra tekrar deneyin." }, 429];

  const t = simdi();
  const var_ = await env.DB.prepare("SELECT id FROM talepler WHERE sokak_id = ? AND bina = ? AND daire = ?").bind(sokakId, bina, daire).first();
  if (var_) {
    await env.DB.prepare("UPDATE talepler SET cevap = ?, son_tarih = ?, guncelleme_sayisi = guncelleme_sayisi + 1 WHERE id = ?").bind(g.cevap, t, var_.id).run();
    return [{ tamam: true, durum: "guncellendi" }, 200];
  }
  await env.DB.prepare("INSERT INTO talepler (sokak_id, bina, daire, cevap, ilk_tarih, son_tarih) VALUES (?, ?, ?, ?, ?, ?)").bind(sokakId, bina, daire, g.cevap, t, t).run();
  return [{ tamam: true, durum: "yeni" }, 201];
}

async function istatistik(env) {
  const esik = Number(env.GIZLEME_ESIGI || 5);
  const genel = await env.DB.prepare(`SELECT
      SUM(cevap IN ('evet','kararsiz')) AS toplam,
      SUM(cevap = 'evet') AS evet,
      SUM(cevap = 'kararsiz') AS kararsiz,
      COUNT(DISTINCT CASE WHEN cevap IN ('evet','kararsiz') THEN sokak_id END) AS sokak,
      COUNT(DISTINCT CASE WHEN cevap IN ('evet','kararsiz') THEN sokak_id || '|' || bina END) AS bina
    FROM talepler`).first();
  const { results } = await env.DB.prepare(`SELECT s.ad, SUM(t.cevap = 'evet') AS evet, SUM(t.cevap = 'kararsiz') AS kararsiz
      FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id
      WHERE t.cevap IN ('evet','kararsiz') GROUP BY s.id`).all();
  const gorunur = [], diger = { ad: "Diğer sokaklar", evet: 0, kararsiz: 0, sokak: 0 };
  for (const r of results) {
    if (r.evet + r.kararsiz >= esik) gorunur.push({ ad: r.ad, evet: r.evet, kararsiz: r.kararsiz, toplam: r.evet + r.kararsiz });
    else { diger.evet += r.evet; diger.kararsiz += r.kararsiz; diger.sokak++; }
  }
  gorunur.sort((a, b) => b.toplam - a.toplam || trSirala(a.ad, b.ad));
  const n = x => Number(x || 0);
  const toplam = n(genel.toplam);
  // Toplam çok azken genel rakamlar da dolaylı tanımlamaya yol açabilir
  if (toplam < esik) return { esik, yeterli: false, guncelleme: simdi() };
  return {
    esik, yeterli: true, guncelleme: simdi(),
    toplam, evet: n(genel.evet), kararsiz: n(genel.kararsiz), sokak: n(genel.sokak), bina: n(genel.bina),
    sokaklar: gorunur,
    diger: diger.sokak ? { sokak: diger.sokak, toplam: diger.evet + diger.kararsiz } : null
  };
}

/* ---------------- yönetici ---------------- */
async function yonetim(req, env, yol, url) {
  const m = req.method;
  if (yol === "talepler" && m === "GET") {
    const sokak = url.searchParams.get("sokak");
    const q = `SELECT t.id, s.ad AS sokak, t.sokak_id, t.bina, t.daire, t.cevap, t.ilk_tarih, t.son_tarih, t.guncelleme_sayisi
               FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id ${sokak ? "WHERE t.sokak_id = ?" : ""}`;
    const st = env.DB.prepare(q);
    const { results } = await (sokak ? st.bind(Number(sokak)) : st).all();
    results.sort((a, b) => trSirala(a.sokak, b.sokak) || trSirala(a.bina, b.bina) || trSirala(a.daire, b.daire));
    return json({ talepler: results });
  }
  if (yol === "kontrol" && m === "GET") {
    // Aynı binada hem "müstakil" hem daire kaydı olanlar ve tekrar başvurulan adresler
    const { results: karisik } = await env.DB.prepare(`SELECT s.ad AS sokak, t.bina, GROUP_CONCAT(t.daire, ', ') AS daireler, COUNT(*) AS kayit
        FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id GROUP BY t.sokak_id, t.bina
        HAVING SUM(t.daire = 'MUSTAKIL') > 0 AND COUNT(*) > 1`).all();
    const { results: tekrar } = await env.DB.prepare(`SELECT t.id, s.ad AS sokak, t.bina, t.daire, t.cevap, t.guncelleme_sayisi, t.son_tarih
        FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id WHERE t.guncelleme_sayisi > 0 ORDER BY t.guncelleme_sayisi DESC`).all();
    return json({ karisik, tekrar });
  }
  let mm;
  if ((mm = yol.match(/^talepler\/(\d+)$/)) && m === "DELETE") {
    const row = await env.DB.prepare("SELECT t.*, s.ad AS sokak FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id WHERE t.id = ?").bind(Number(mm[1])).first();
    if (!row) return json({ hata: "Kayıt bulunamadı." }, 404);
    await env.DB.prepare("DELETE FROM talepler WHERE id = ?").bind(row.id).run();
    await kaydet(env, "talep_silindi", { id: row.id, sokak: row.sokak, bina: row.bina, daire: row.daire });
    return json({ tamam: true });
  }
  if (yol === "sokaklar" && m === "GET") {
    const { results } = await env.DB.prepare(`SELECT s.id, s.ad, s.aktif, s.dogrulandi, COUNT(t.id) AS talep FROM sokaklar s LEFT JOIN talepler t ON t.sokak_id = s.id GROUP BY s.id`).all();
    return json({ sokaklar: results.sort((a, b) => trSirala(a.ad, b.ad)) });
  }
  if (yol === "sokaklar" && m === "POST") {
    const g = await req.json();
    const ad = String(g.ad || "").trim().replace(/\s+/g, " ");
    if (ad.length < 3 || ad.length > 80) return json({ hata: "Sokak adı 3–80 karakter olmalı." }, 400);
    try { await env.DB.prepare("INSERT INTO sokaklar (ad, dogrulandi) VALUES (?, ?)").bind(ad, g.dogrulandi ? 1 : 0).run(); }
    catch { return json({ hata: "Bu sokak zaten listede." }, 409); }
    await kaydet(env, "sokak_eklendi", { ad });
    return json({ tamam: true }, 201);
  }
  if ((mm = yol.match(/^sokaklar\/(\d+)$/)) && m === "PATCH") {
    const g = await req.json(); const id = Number(mm[1]);
    const eski = await env.DB.prepare("SELECT * FROM sokaklar WHERE id = ?").bind(id).first();
    if (!eski) return json({ hata: "Sokak bulunamadı." }, 404);
    const ad = g.ad != null ? String(g.ad).trim().replace(/\s+/g, " ") : eski.ad;
    if (ad.length < 3 || ad.length > 80) return json({ hata: "Sokak adı 3–80 karakter olmalı." }, 400);
    const aktif = g.aktif != null ? (g.aktif ? 1 : 0) : eski.aktif;
    const dog = g.dogrulandi != null ? (g.dogrulandi ? 1 : 0) : eski.dogrulandi;
    try { await env.DB.prepare("UPDATE sokaklar SET ad = ?, aktif = ?, dogrulandi = ? WHERE id = ?").bind(ad, aktif, dog, id).run(); }
    catch { return json({ hata: "Bu adda başka bir sokak var." }, 409); }
    await kaydet(env, "sokak_duzenlendi", { id, eski: eski.ad, yeni: ad, aktif, dogrulandi: dog });
    return json({ tamam: true });
  }
  if (yol === "rapor.csv" && m === "GET") {
    const { results } = await env.DB.prepare(`SELECT s.ad AS sokak, t.bina, t.daire, t.cevap, t.ilk_tarih FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id`).all();
    results.sort((a, b) => trSirala(a.sokak, b.sokak) || trSirala(a.bina, b.bina) || trSirala(a.daire, b.daire));
    const satirlar = [["Sokak", "Bina No", "Daire No", "Fiber Talebi", "Başvuru Tarihi"]].concat(results.map(r =>
      [r.sokak, r.bina, r.daire === MUSTAKIL ? "Müstakil ev" : r.daire, CEVAPLAR[r.cevap], trTarih(r.ilk_tarih)]));
    await kaydet(env, "rapor_indirildi", { tur: "ayrintili", kayit: results.length });
    return csv(satirlar, "fiber-talepleri-ayrintili.csv");
  }
  if (yol === "toplu.csv" && m === "GET") {
    const { results } = await env.DB.prepare(`SELECT s.ad AS sokak, SUM(t.cevap='evet') AS evet, SUM(t.cevap='kararsiz') AS kararsiz,
        COUNT(DISTINCT CASE WHEN t.cevap IN ('evet','kararsiz') THEN t.bina END) AS bina
        FROM talepler t JOIN sokaklar s ON s.id = t.sokak_id GROUP BY s.id HAVING SUM(t.cevap IN ('evet','kararsiz')) > 0`).all();
    results.sort((a, b) => (b.evet + b.kararsiz) - (a.evet + a.kararsiz) || trSirala(a.sokak, b.sokak));
    const satirlar = [["Sokak / Cadde", "Abonelik isteyen hane", "Kararsız hane", "Toplam talep", "Talep gelen bina sayısı"]]
      .concat(results.map(r => [r.sokak, r.evet, r.kararsiz, r.evet + r.kararsiz, r.bina]));
    await kaydet(env, "rapor_indirildi", { tur: "toplu" });
    return csv(satirlar, "fiber-talepleri-sokak-bazinda.csv");
  }
  if (yol === "kayit" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT tarih, islem, ayrinti FROM islem_kaydi ORDER BY id DESC LIMIT 200").all();
    return json({ kayit: results });
  }
  return json({ hata: "Bulunamadı" }, 404);
}
function trTarih(iso) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function csv(satirlar, ad) {
  // Türkçe Excel için ; ayırıcı ve UTF-8 BOM
  const kac = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const govde = "﻿" + satirlar.map(r => r.map(kac).join(";")).join("\r\n");
  return new Response(govde, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${ad}"`, "cache-control": "no-store" } });
}

/* ---------------- yönetici paneli (tek sayfa) ---------------- */
const YONETIM_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Fiber Talepleri – Yönetim</title>
<style>
:root{--g:#2E6B3E;--gs:#E1EEDC;--bg:#F5F8F2;--ink:#17261B;--mu:#55675A;--ln:#DCE5D6;--red:#B3261E}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink);font-size:15px}
header{background:#fff;border-bottom:1px solid var(--ln);padding:14px max(16px,env(safe-area-inset-left))}header h1{margin:0;font-size:19px}
main{max-width:1100px;margin:0 auto;padding:18px 16px 60px;display:grid;gap:18px}
.card{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:16px 18px}h2{margin:0 0 10px;font-size:17px}
button,.btn{font:inherit;font-weight:700;border:0;border-radius:8px;padding:9px 14px;background:var(--g);color:#fff;cursor:pointer;text-decoration:none;display:inline-block}
button.g{background:var(--gs);color:var(--ink)}button.r{background:var(--red)}input,select{font:inherit;padding:9px 11px;border:1px solid var(--ln);border-radius:8px;background:#fff;min-width:0}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.mu{color:var(--mu)}.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--ln);white-space:nowrap}th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mu)}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.k div{background:var(--gs);border-radius:10px;padding:10px 12px}.k b{display:block;font-size:24px}
.tag{font-size:12px;font-weight:700;padding:2px 7px;border-radius:999px}.evet{background:#DDF0DF;color:#1F5230}.kararsiz{background:#FBEFD3;color:#8A5A06}.hayir{background:#EEE;color:#555}
#giris{max-width:380px;margin:60px auto}.hata{color:var(--red);font-weight:600}
@media print{header,.np{display:none!important}body{background:#fff}.card{border:0;padding:0}main{padding:0}}
</style></head><body>
<header><h1>Kavaklıdere fiber talepleri · Yönetim</h1></header>
<div id="giris" class="card"><h2>Giriş</h2><form id="gf" class="row"><input id="sifre" type="password" placeholder="Yönetici şifresi" autocomplete="current-password" required style="flex:1"><button>Giriş yap</button></form><p id="gh" class="hata"></p></div>
<main id="panel" hidden>
 <section class="card np"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Özet</h2><div class="row"><button class="g" id="yenile">Yenile</button><button class="g" id="cikis">Çıkış</button></div></div><div class="k" id="ozet" style="margin-top:12px"></div></section>
 <section class="card" id="toplu"><div class="row np" style="justify-content:space-between"><h2 style="margin:0">Sokak bazında toplu rapor</h2><div class="row"><button class="g" data-csv="toplu.csv">Excel (CSV)</button><button class="g" id="yazdir">Yazdır / PDF</button></div></div>
  <p class="mu">Türk Telekom'a sunulabilecek, bina ve daire numarası içermeyen rapor. <span id="rtarih"></span></p><div class="tw"><table id="tt"></table></div></section>
 <section class="card np"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Başvurular</h2><div class="row"><select id="fs"><option value="">Tüm sokaklar</option></select><button class="g" data-csv="rapor.csv">Ayrıntılı Excel (CSV)</button></div></div><div class="tw" style="margin-top:10px"><table id="ta"></table></div></section>
 <section class="card np"><h2>Kontrol edilmesi gereken kayıtlar</h2><div id="kt" class="mu">Yükleniyor…</div></section>
 <section class="card np"><h2>Sokak listesi</h2><form id="sf" class="row"><input id="syeni" placeholder="Yeni sokak adı, ör. Lale Sokak" style="flex:1"><button>Ekle</button></form><p class="mu">Vatandaştan gelen sokak ekleme taleplerini, resmî adını doğruladıktan sonra buradan ekleyin.</p><div class="tw"><table id="st"></table></div></section>
 <section class="card np"><h2>İşlem kaydı</h2><div class="tw"><table id="it"></table></div></section>
</main>
<script>
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C={evet:"Evet",kararsiz:"Kararsız",hayir:"Hayır"};let S=sessionStorage.getItem("ys")||"";
const tt=i=>new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",dateStyle:"short",timeStyle:"short"}).format(new Date(i));
async function api(p,o={}){const r=await fetch("/api/yonetim/"+p,{...o,headers:{authorization:"Bearer "+S,"content-type":"application/json",...(o.headers||{})}});if(r.status===401){cikis();throw new Error("yetki")}return r}
function cikis(){S="";sessionStorage.removeItem("ys");$("#panel").hidden=true;$("#giris").hidden=false}
$("#gf").onsubmit=async e=>{e.preventDefault();S=$("#sifre").value;const r=await fetch("/api/yonetim/sokaklar",{headers:{authorization:"Bearer "+S}});if(r.ok){sessionStorage.setItem("ys",S);$("#giris").hidden=true;$("#panel").hidden=false;yukle()}else{$("#gh").textContent="Şifre hatalı."}};
$("#cikis").onclick=cikis;$("#yenile").onclick=()=>yukle();$("#yazdir").onclick=()=>window.print();
document.querySelectorAll("[data-csv]").forEach(b=>b.onclick=async()=>{const r=await api(b.dataset.csv);const bl=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=b.dataset.csv.includes("toplu")?"fiber-sokak-bazinda.csv":"fiber-ayrintili.csv";a.click()});
$("#fs").onchange=()=>talepler();
async function yukle(){const s=await(await api("sokaklar")).json();
 $("#fs").innerHTML='<option value="">Tüm sokaklar</option>'+s.sokaklar.filter(x=>x.talep).map(x=>'<option value="'+x.id+'">'+esc(x.ad)+' ('+x.talep+')</option>').join("");
 $("#st").innerHTML="<tr><th>Sokak</th><th>Talep</th><th>Doğrulandı</th><th>Listede</th><th></th></tr>"+s.sokaklar.map(x=>'<tr><td>'+esc(x.ad)+'</td><td>'+x.talep+'</td><td>'+(x.dogrulandi?"Evet":"<span class=mu>Hayır</span>")+'</td><td>'+(x.aktif?"Görünür":"<span class=mu>Gizli</span>")+'</td><td class=row><button class=g data-ad="'+x.id+'">Adını düzelt</button><button class=g data-dg="'+x.id+'" data-v="'+(x.dogrulandi?0:1)+'">'+(x.dogrulandi?"Doğrulamayı kaldır":"Doğrulandı")+'</button><button class=g data-ak="'+x.id+'" data-v="'+(x.aktif?0:1)+'">'+(x.aktif?"Gizle":"Göster")+'</button></td></tr>').join("");
 await Promise.all([talepler(),ozetVeToplu(),kontrol(),kayit()])}
$("#st").onclick=async e=>{const b=e.target.closest("button");if(!b)return;let body;
 if(b.dataset.ad){const td=b.closest("tr").firstChild;const inp=document.createElement("input");inp.value=td.textContent;td.textContent="";td.appendChild(inp);inp.focus();inp.onkeydown=async ev=>{if(ev.key==="Enter"){const r=await api("sokaklar/"+b.dataset.ad,{method:"PATCH",body:JSON.stringify({ad:inp.value})});if(!r.ok)alert((await r.json()).hata);yukle()}};return}
 if(b.dataset.dg)body={dogrulandi:b.dataset.v==="1"};if(b.dataset.ak)body={aktif:b.dataset.v==="1"};
 const r=await api("sokaklar/"+(b.dataset.dg||b.dataset.ak),{method:"PATCH",body:JSON.stringify(body)});if(!r.ok)alert((await r.json()).hata);yukle()};
$("#sf").onsubmit=async e=>{e.preventDefault();const r=await api("sokaklar",{method:"POST",body:JSON.stringify({ad:$("#syeni").value,dogrulandi:true})});if(!r.ok)alert((await r.json()).hata);else $("#syeni").value="";yukle()};
async function talepler(){const v=$("#fs").value;const d=await(await api("talepler"+(v?"?sokak="+v:""))).json();
 $("#ta").innerHTML="<tr><th>Sokak</th><th>Bina No</th><th>Daire No</th><th>Fiber Talebi</th><th>Başvuru Tarihi</th><th>Tekrar</th><th></th></tr>"+(d.talepler.map(t=>'<tr><td>'+esc(t.sokak)+'</td><td>'+esc(t.bina)+'</td><td>'+(t.daire==="MUSTAKIL"?"Müstakil ev":esc(t.daire))+'</td><td><span class="tag '+t.cevap+'">'+C[t.cevap]+'</span></td><td>'+tt(t.ilk_tarih)+'</td><td>'+(t.guncelleme_sayisi||"")+'</td><td><button class=r data-sil="'+t.id+'">Sil</button></td></tr>').join("")||'<tr><td colspan=7 class=mu>Henüz başvuru yok.</td></tr>')}
$("#ta").onclick=async e=>{const b=e.target.closest("[data-sil]");if(!b)return;if(b.dataset.onay!=="1"){b.dataset.onay="1";b.textContent="Silmeyi onayla";setTimeout(()=>{b.dataset.onay="";b.textContent="Sil"},4000);return}await api("talepler/"+b.dataset.sil,{method:"DELETE"});yukle()};
async function ozetVeToplu(){const d=await(await api("talepler")).json();const T=d.talepler;const ev=T.filter(t=>t.cevap==="evet").length,ka=T.filter(t=>t.cevap==="kararsiz").length,ha=T.length-ev-ka;
 const by={};T.filter(t=>t.cevap!=="hayir").forEach(t=>{(by[t.sokak]=by[t.sokak]||{e:0,k:0,b:new Set()});by[t.sokak][t.cevap==="evet"?"e":"k"]++;by[t.sokak].b.add(t.bina)});
 const bina=Object.values(by).reduce((a,x)=>a+x.b.size,0);
 $("#ozet").innerHTML=[["Toplam talep",ev+ka],["Abonelik isteyen",ev],["Kararsız",ka],["İstemeyen",ha],["Talep gelen sokak",Object.keys(by).length],["Talep gelen bina",bina]].map(x=>"<div><span class=mu>"+x[0]+"</span><b>"+x[1]+"</b></div>").join("");
 const rows=Object.entries(by).sort((a,b)=>(b[1].e+b[1].k)-(a[1].e+a[1].k)||a[0].localeCompare(b[0],"tr"));
 $("#tt").innerHTML="<tr><th>Sokak / Cadde</th><th>Abonelik isteyen hane</th><th>Kararsız hane</th><th>Toplam</th><th>Bina sayısı</th></tr>"+(rows.map(([s,x])=>"<tr><td>"+esc(s)+"</td><td>"+x.e+"</td><td>"+x.k+"</td><td><b>"+(x.e+x.k)+"</b></td><td>"+x.b.size+"</td></tr>").join("")||"<tr><td colspan=5 class=mu>Henüz talep yok.</td></tr>")+(rows.length?"<tr><td><b>Toplam</b></td><td><b>"+ev+"</b></td><td><b>"+ka+"</b></td><td><b>"+(ev+ka)+"</b></td><td><b>"+bina+"</b></td></tr>":"");
 $("#rtarih").textContent="Rapor tarihi: "+tt(new Date().toISOString())+". Kayıtlar kimlik ve telefon doğrulaması içermez; kesin abonelik taahhüdü değildir."}
async function kontrol(){const d=await(await api("kontrol")).json();let h="";
 h+="<p><b>Aynı binada hem müstakil hem daire kaydı</b></p>"+(d.karisik.length?"<table><tr><th>Sokak</th><th>Bina</th><th>Kayıtlar</th></tr>"+d.karisik.map(x=>"<tr><td>"+esc(x.sokak)+"</td><td>"+esc(x.bina)+"</td><td>"+esc(x.daireler.replace("MUSTAKIL","Müstakil"))+"</td></tr>").join("")+"</table>":"<p class=mu>Yok.</p>");
 h+="<p><b>Aynı adresten tekrar başvuru</b> <span class=mu>(tek kayıt olarak sayılır, son cevap geçerlidir)</span></p>"+(d.tekrar.length?"<table><tr><th>Sokak</th><th>Bina</th><th>Daire</th><th>Son cevap</th><th>Tekrar</th></tr>"+d.tekrar.map(x=>"<tr><td>"+esc(x.sokak)+"</td><td>"+esc(x.bina)+"</td><td>"+(x.daire==="MUSTAKIL"?"Müstakil":esc(x.daire))+"</td><td>"+C[x.cevap]+"</td><td>"+x.guncelleme_sayisi+"</td></tr>").join("")+"</table>":"<p class=mu>Yok.</p>");
 $("#kt").innerHTML=h}
async function kayit(){const d=await(await api("kayit")).json();$("#it").innerHTML="<tr><th>Tarih</th><th>İşlem</th><th>Ayrıntı</th></tr>"+(d.kayit.map(k=>"<tr><td>"+tt(k.tarih)+"</td><td>"+esc(k.islem.replace(/_/g," "))+"</td><td class=mu>"+esc(k.ayrinti||"")+"</td></tr>").join("")||"<tr><td colspan=3 class=mu>Kayıt yok.</td></tr>")}
if(S){fetch("/api/yonetim/sokaklar",{headers:{authorization:"Bearer "+S}}).then(r=>{if(r.ok){$("#giris").hidden=true;$("#panel").hidden=false;yukle()}})}
</script></body></html>`;
