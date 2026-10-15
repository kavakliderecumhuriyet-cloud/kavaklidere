# Kavaklıdere Dijital Mahalle Portalı – Yenileme Planı

Hazırlanma: 15 Ekim 2026 · Durum: Aşama 1 (ana sayfa) önizlemede

---

## 1. Mevcut sitenin analizi

**Teknoloji:** Tek dosya (`index.html`, ~36 KB). Saf HTML/CSS/JavaScript, framework yok, derleme adımı yok. İçerik (anonslar, videolar, ilanlar, evraklar) dosyanın içindeki `SITE_DATA` bloğunda tutuluyor. GitHub Pages'te `main` dalından yayınlanıyor. Bu yaklaşım hızlı ve bakımı kolay; sıfırdan bir framework'e geçmeye gerek yok.

**Sayfalar ve işlevler (korunacak):**

| Bölüm | Ne yapıyor |
|---|---|
| Acil şerit | En üstte kayan acil duyuru |
| Anons paneli ("Şimdi yayında") | Duyuruları 8 sn'de bir döndürür, duraklat/ileri/geri |
| Duyurular | Tüm duyurular, Acil/Önemli/Bilgi filtresi |
| İlanlar | Satış ilanları, "SATILDI" gösterimi, WhatsApp ile ilan verme |
| Evrak takibi | Takip no ile durum sorgulama, WhatsApp ile bildirim isteme |
| Videolar | YouTube'a giden video kartları |
| Köyümüz | Nüfus, kısa tanıtım, bağ takvimi |
| Hizmetler | Acil numaralar, muhtarlık, ASM, ulaşım, tarım |
| Arka plan videoları | Üzüm, cennet elması, zeytin (Pexels) |
| WhatsApp butonu | Muhtar Salih Taşlıyol'a doğrudan mesaj |

**Tespit edilen sorunlar:**

*İçerik doğruluğu (en önemli)*
- Altı duyurudan beşi tasarım için yazılmış **örnek** metin (su kesintisi, grip aşısı, ÇKS, okul toplantısı, bağ yolu, hayır yemeği). Gerçek duyuru gibi görünüyor.
- Doğrulanmamış bilgiler: "Muhtardan" kutusundaki mesaj muhtara ait değil; "Alaşehir'e dolmuş her saat başı", "Muhtarlık 09:00–17:00" doğrulanmadı.
- Video kartları gerçek videolar değil, YouTube aramasına gidiyor.
- Resmi kaynaklarda mahalle adı "Kavaklıdere Mahallesi" olarak geçiyor; "Cumhuriyet" eki doğrulanamadı (sizin isteğinizle başlıkta kullanılıyor).

*Teknik*
- Arka plan videoları Pexels'ten 2560 px çözünürlükte doğrudan çekiliyor: mobilde ağır, Pexels bağlantıyı değiştirirse kırılır.
- SEO yok: Open Graph, sitemap.xml, robots.txt, yapılandırılmış veri, favicon eksik.
- PWA yok: manifest, uygulama simgesi, çevrimdışı çalışma yok.
- Mobil menü yatay kayıyor, hamburger menü yok. Açık/koyu tema sadece sistem ayarına bağlı, elle seçilemiyor.
- İçerik ve kod aynı dosyada; içerik güncellemesi kodu bozma riski taşıyor.

*Güvenlik ve gizlilik*
- Evrak takibi herkese açık bir dosyada. Şu an sadece numara/tür/durum var, kişisel veri yok. Ancak takip numarası tahmin edilebilir (KVK-0001, 0002…). Kişisel veri **asla** bu dosyaya eklenmemeli.
- Muhtarın telefon numarası açık yayında. Muhtarın onayı alınmış olmalı.
- Gizlilik politikası / KVKK aydınlatma metni yok.

---

## 2. Önerilen mimari

**İlke:** GitHub Pages statik site olarak kalır. Sadece gerçekten sunucu gerektiren işler için küçük, ücretsiz katmanlı servisler eklenir.

```
                ┌───────────────────────────┐
 Ziyaretçi ───► │ GitHub Pages (statik site)│ ◄── İçerik: data/*.js / *.json
                └─────────────┬─────────────┘       │
                              │                     ├── Pages CMS (yönetici paneli, GitHub girişi)
                              │                     └── Claude (sohbetten güncelleme)
                              ▼
                ┌───────────────────────────┐
                │ Cloudflare Worker (API)   │  formlar, ilan/anı/etkinlik gönderme,
                │ + D1 veritabanı + R2 dosya│  evrak talepleri, yapay zekâ asistanı,
                │ + Turnstile (spam)        │  web push bildirimleri
                │ + Access (yönetici girişi)│
                └───────────────────────────┘
 Doğrudan tarayıcıdan: Open-Meteo (hava durumu, anahtar gerekmez)
```

### Servis karşılaştırması

| | Cloudflare (Workers + D1 + R2) | Supabase | Firebase |
|---|---|---|---|
| Ücretsiz katman | Workers: günde 100.000 istek. D1: 5 GB, günde 100.000 satır yazma | 500 MB veritabanı, 1 GB dosya, 50.000 aktif kullanıcı | Firestore: günde 50.000 okuma / 20.000 yazma |
| Uyku/durdurma | Yok | **1 hafta hareketsizlikte proje duraklatılır** | Yok |
| Yedekleme | D1 zaman yolculuğu (geri alma) | Ücretsizde otomatik yedek yok | Ücretli |
| Yönetici girişi | Cloudflare Access (e-posta kodu), kod yazmadan | Supabase Auth | Firebase Auth |
| Ücretli plan | 5 $/ay'dan | 25 $/ay'dan | Kullandıkça öde |
| Değerlendirme | **Önerilen.** Uyumaz, ucuz, anahtarlar sunucuda kalır | İyi ama küçük sitede uyku riski | İyi ama kota aşılınca ay sonuna kadar kapanır |

### İçerik yönetimi (yönetici paneli)

- **Pages CMS** (ücretsiz, açık kaynak): GitHub hesabıyla giriş, form ekranlarıyla duyuru/ilan/etkinlik ekleme, fotoğraf yükleme. Her değişiklik GitHub'a kayıt olarak düşer, yani **yönetici işlemleri otomatik kayıt altında** ve geri alınabilir. Sunucu gerekmez.
- **Claude ile sohbet**: Bugünkü gibi sesli/yazılı talimatla güncelleme devam eder.
- Kullanıcı gönderilerinin (ilan, anı, etkinlik önerisi) onayı: Worker'daki küçük bir onay ekranı (Cloudflare Access korumalı). Onaylanan içerik GitHub'a yazılır.

### Bildirimler (maliyet açıklaması)

- **WhatsApp Kanalı:** ücretsiz, muhtar elle paylaşır. İlk adım için önerilen.
- **Otomatik WhatsApp mesajı:** sadece resmi WhatsApp Business Platform ile. Temmuz 2025'ten beri **mesaj başına ücretlendirme** var. Kullanıcı son 24 saatte yazmadıysa "utility" (bilgilendirme) şablonları **ücretli**. Fiyat ülkeye göre değişir, Meta işletme doğrulaması gerekir. Ücretsiz ve sınırsız değildir.
- **Web push:** ücretsiz (Worker + tarayıcı izni). iPhone'da yalnızca site ana ekrana eklendiyse çalışır.
- **E-posta:** ücretsiz katmanlı bir e-posta servisiyle (ör. aylık birkaç bin e-postaya kadar).

### Yapay zekâ asistanı

API anahtarı tarayıcıya veya GitHub'a **konulamaz**. Anahtar Cloudflare Worker'da gizli değişken olarak durur, site Worker'a soru gönderir. Asistan sadece sitedeki doğrulanmış içeriği (duyurular, hizmetler, tarih) bağlam olarak kullanır, bilmediğinde "bilmiyorum, muhtarlığa danışın" der. Maliyet kullanım başına (soru başına küçük bir ücret); aylık limit konulmalı.

### Evrak takibi güvenliği

- Kişisel veri GitHub'a **hiçbir zaman** yazılmaz.
- Yeni sistemde: rastgele, tahmin edilemeyen takip kodu (ör. `K7Q-4MX9-TP`) + telefonun son 4 hanesi ile doğrulama. Veriler D1'de, yetki kontrolü Worker'da.
- KVKK aydınlatma metni ve açık rıza kutusu formlara eklenecek.

---

## 3. Aşamalar

| Aşama | İçerik | Gerekli dış erişim | Durum |
|---|---|---|---|
| 1 | Yeni tasarım + ana sayfa (hero, canlı hava, duyuru/haber alanı, tema, mobil menü), mevcut bölümlerin taşınması, SEO temelleri, PWA manifest | Yok | **Önizlemede** |
| 2 | İçeriği ayrı veri dosyalarına taşıma, Pages CMS kurulumu, sitemap/robots, gizlilik politikası, servis çalışanı (çevrimdışı) | GitHub (var) | Sırada |
| 3 | Tarih müzesi, tarım merkezi, etkinlik takvimi, gurbetçiler (statik kısımlar), Leaflet haritası | Doğrulanmış içerik ve fotoğraflar sizden | Bekliyor |
| 4 | Cloudflare Worker: formlar, gönderi onayı, güvenli evrak takibi, spam koruması | Cloudflare hesabı (ücretsiz) | Bekliyor |
| 5 | Web push, e-posta bildirimi, yapay zekâ asistanı | Cloudflare + API anahtarı | Bekliyor |

## 4. Sizden gerekenler

1. Gerçek Kavaklıdere fotoğrafları (hero, tarih müzesi). Uydurma veya yapay görsel kullanılmayacak.
2. Muhtarlık çalışma saatleri, telefonu, adresi.
3. Örnek duyuruların ne zaman kaldırılacağı.
4. Muhtarın numarasının yayınlanmasına onayı.
5. Aşama 4 için ücretsiz bir Cloudflare hesabı.

## Kaynaklar

- Konum: Open-Meteo / GeoNames – Kavaklıdere, Alaşehir, Manisa: 38.42573 K, 28.35379 D
- Supabase fiyatlandırma: supabase.com/pricing
- Firebase planları: firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Cloudflare Workers fiyatlandırma: developers.cloudflare.com/workers/platform/pricing
- WhatsApp Business Platform fiyatlandırma: developers.facebook.com/docs/whatsapp/pricing
- Pages CMS: pagescms.org
