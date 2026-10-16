# Kavaklıdere Cumhuriyet Mahallesi

Alaşehir / Manisa – dijital mahalle portalı: https://kavakliderem.com

- İçerik (duyurular, ilanlar, evraklar, videolar): `data/veri.js`
- Tasarım: `assets/site.css`, kod: `assets/app.js`
- Yenileme planı: `docs/YENILEME-PLANI.md`
- Eski sürümün yedeği: `yedek-2026-10-15` dalı

## Uygulama (PWA)
- `sw.js`: servis çalışanı. Tasarım/kod dosyaları (assets/) değişince `SURUM` değerini artırın (kvk-v2, kvk-v3…), yoksa bazı telefonlar eski sürümü bir ziyaret daha gösterir.
- `data/veri.js` her zaman önce internetten yüklenir.
