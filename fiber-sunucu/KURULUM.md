# Fiber talep sunucusu – kurulum

Başvuru verileri GitHub'a veya tarayıcıya yazılmaz; Cloudflare D1 veritabanında saklanır.
Ücretsiz Cloudflare planı yeterlidir (günde 100.000 istek, 5 GB veritabanı).

## 1. Hazırlık (bir kez)
1. https://dash.cloudflare.com adresinden ücretsiz hesap açın.
2. Bilgisayarda bu klasörde: `npm install` ve `npx wrangler login`
3. Veritabanı: `npx wrangler d1 create kavaklidere-fiber` → çıkan `database_id` değerini `wrangler.toml` dosyasına yazın.
4. Tablolar ve sokak listesi: `npm run sema`
5. Gizli değerler:
   - `npx wrangler secret put ADMIN_PASSWORD` (en az 12 karakter, güçlü bir şifre)
   - `npx wrangler secret put IP_TUZU` (rastgele uzun bir metin)
6. Yayın: `npm run yayinla` → adres örn. `https://kavaklidere-fiber.HESAP.workers.dev`

## 2. Siteye bağlama
`data/fiber-ayar.js` içinde `api` alanına Worker adresini yazın. Sokak ekleme WhatsApp numarası onaylanınca `whatsapp` alanına `90...` biçiminde yazın.

## 3. Başvuruları açma
Aydınlatma metni (`fiber-kvkk.html`) tamamlanıp onaylandıktan sonra `wrangler.toml` içinde `ACIK = "1"` yapıp `npm run yayinla`.

## 4. Yönetici paneli
`https://<worker-adresi>/yonetim` – yönetici şifresiyle giriş.
Ek güvenlik için önerilir: Cloudflare Zero Trust → Access ile `/yonetim*` ve `/api/yonetim/*` yollarını yalnızca muhtarlık e-posta adreslerine açın.

## Test
`schema.sql` içindeki sokaklar başlangıç listesidir (`dogrulandi = 0`). Resmî adlar doğrulandıkça yönetici panelinden “Doğrulandı” olarak işaretleyin.
