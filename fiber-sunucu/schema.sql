-- Kavaklıdere fiber talep veritabanı (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS sokaklar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL UNIQUE,
  aktif INTEGER NOT NULL DEFAULT 1,
  dogrulandi INTEGER NOT NULL DEFAULT 0   -- 0: başlangıç listesinden, resmî adı henüz doğrulanmadı
);

-- Her bağımsız bölüm (bina + daire) için tek kayıt. Müstakil evlerde daire = 'MUSTAKIL'.
CREATE TABLE IF NOT EXISTS talepler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sokak_id INTEGER NOT NULL REFERENCES sokaklar(id),
  bina TEXT NOT NULL,
  daire TEXT NOT NULL,
  cevap TEXT NOT NULL CHECK (cevap IN ('evet','kararsiz','hayir')),
  ilk_tarih TEXT NOT NULL,
  son_tarih TEXT NOT NULL,
  guncelleme_sayisi INTEGER NOT NULL DEFAULT 0,  -- aynı adresten tekrar gelen başvuru sayısı
  UNIQUE (sokak_id, bina, daire)
);

-- Yönetici işlemleri kaydı
CREATE TABLE IF NOT EXISTS islem_kaydi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tarih TEXT NOT NULL,
  islem TEXT NOT NULL,
  ayrinti TEXT
);

-- Kötüye kullanım sınırı (IP adresi saklanmaz; günlük değişen tuzla özetlenir)
CREATE TABLE IF NOT EXISTS hiz_siniri (
  anahtar TEXT PRIMARY KEY,
  sayi INTEGER NOT NULL,
  pencere TEXT NOT NULL
);

INSERT OR IGNORE INTO sokaklar (ad, aktif, dogrulandi) VALUES ('1. Ara Sokak', 1, 1), ('2.Ara Sokak', 1, 1), ('3.Ara Sokak', 1, 1), ('5 Eylül. Sokak', 1, 1), ('Abdi İpekçi Caddesi', 1, 1), ('Akasya 1 Sokak', 1, 1), ('Akbaş Sokak', 1, 1), ('Alaşehir Caddesi', 1, 1), ('Alper Sokak', 1, 1), ('Armut Sokak', 1, 1), ('Asma Sokak', 1, 1), ('Ata Sokak', 1, 1), ('Atabey Sokak', 1, 1), ('Atatürk. Bulvarı', 1, 1), ('Ay_1 Sokak', 1, 1), ('Badem Sokak', 1, 1), ('Bağcı Sokak', 1, 1), ('Bağlar Bulvarı', 1, 1), ('Bahar Sokak', 1, 1), ('Bahçe_1 Sokak', 1, 1), ('Bal Sokak', 1, 1), ('Barbaros_1 Sokak', 1, 1), ('Barış Bulvarı', 1, 1), ('Belge Sokak', 1, 1), ('Beyler_1 Sokak', 1, 1), ('Birim Sokak', 1, 1), ('Bozdağ_1 Sokak', 1, 1), ('Buket Sokak', 1, 1), ('Bulut Sokak', 1, 1), ('Bülbül Sokak', 1, 1), ('Cami_1 Sokak', 1, 1), ('Can Sokak', 1, 1), ('Cebeci Sokak', 1, 1), ('Cengiz Topel_1 Caddesi', 1, 1), ('Ceren Sokak', 1, 1), ('Ceviz Sokak', 1, 1), ('Cevizli_2 Caddesi', 1, 1), ('Çakıl Sokak', 1, 1), ('Çallılar Sokak', 1, 1), ('Çeşme Sokak', 1, 1), ('Çeşmeli_1 Sokak', 1, 1), ('Çınar_1 Sokak', 1, 1), ('Çiçek Sokak', 1, 1), ('Çilek Sokak', 1, 1), ('Çimen (Ünlü) Sokak', 1, 1), ('Defne Sokak', 1, 1), ('Değirmen_2 Caddesi', 1, 1), ('Demet Sokak', 1, 1), ('Dere 1 Sokak', 1, 1), ('Doğu Sokak', 1, 1), ('Durak Sokak', 1, 1), ('Dut Sokak', 1, 1), ('Dündar Sokak', 1, 1), ('Efes Sokak', 1, 1), ('Elmas Sokak', 1, 1), ('Ertuğrul Gazi Sokak', 1, 1), ('Etiler Sokak', 1, 1), ('Fatih_1 Caddesi', 1, 1), ('Fevzi Çakmak_1 Caddesi', 1, 1), ('Fuzuli_1 Caddesi', 1, 1), ('Gazi_1 Sokak', 1, 1), ('Gökalp (I. Kısım) Caddesi', 1, 1), ('Gökalp (II. Kısım) Caddesi', 1, 1), ('Gökçe Sokak', 1, 1), ('Gökkuşağı Caddesi', 1, 1), ('Gül_1 Sokak', 1, 1), ('Gün_1 Sokak', 1, 1), ('Güneş_1 Sokak', 1, 1), ('Gürsel Sokak', 1, 1), ('Hakan Sokak', 1, 1), ('Halk Caddesi', 1, 1), ('Harzen Caddesi', 1, 1), ('Havuzlu Bahçe Caddesi', 1, 1), ('Hilal_2 Sokak', 1, 1), ('Horasan_1 Caddesi', 1, 1), ('Hürriyet_3 Meydanı', 1, 1), ('Ihlamur_1 Sokak', 1, 1), ('Irmak Sokak', 1, 1), ('Işık (Kırgız) Küme Evleri', 1, 1), ('Işık_2 Sokak', 1, 1), ('İleri Sokak', 1, 1), ('İlim Sokak', 1, 1), ('İnci_1 Sokak', 1, 1), ('İncir Sokak', 1, 1), ('İpek Sokak', 1, 1), ('İskender Sokak', 1, 1), ('İstasyon_1 Meydanı', 1, 1), ('İstiklal_1 Caddesi', 1, 1), ('İzmir7 Sokak', 1, 1), ('Karşıyaka (Horzum) Küme Evleri', 1, 1), ('Karşıyaka Sokak', 1, 1), ('Kaya Sokak', 1, 1), ('Kestane Sokak', 1, 1), ('Kıbrıs_1 Sokak', 1, 1), ('Kışla_1 Sokak', 1, 1), ('Kiraz_1 Sokak', 1, 1), ('Kocayusuf Sokak', 1, 1), ('Koşucu Sokak', 1, 1), ('Köroğlu_1 Sokak', 1, 1), ('Kubilay Caddesi', 1, 1), ('Kurtdereli Sokak', 1, 1), ('Kurtuluş_1 Caddesi', 1, 1), ('Lale_2 Sokak', 1, 1), ('Mehmet Akif_1 Caddesi', 1, 1), ('Mehmetcik Caddesi', 1, 1), ('Menekşe Sokak', 1, 1), ('Mert_1 Sokak', 1, 1), ('Mesir_1 Sokak', 1, 1), ('Mevlana_1 Caddesi', 1, 1), ('Mezba Sokak', 1, 1), ('Mihrap Sokak', 1, 1), ('Mimar Sinan_1 Caddesi', 1, 1), ('Mithat Paşa_1 Caddesi', 1, 1), ('Mutki Sokak', 1, 1), ('Mutlu Sokak', 1, 1), ('Müren Sokak', 1, 1), ('Namık Kemal_2 Caddesi', 1, 1), ('Nane Sokak', 1, 1), ('Nar Sokak', 1, 1), ('Narenciye Sokak', 1, 1), ('Nato Yolu Küme Evleri', 1, 1), ('Nedim Sokak', 1, 1), ('Nergis Sokak', 1, 1), ('Odak Sokak', 1, 1), ('Orhanveli Caddesi', 1, 1), ('Osmanlı Deresi Küme Evleri', 1, 1), ('Önürme Sokak', 1, 1), ('Paris Sokak', 1, 1), ('Park_1 Sokak', 1, 1), ('Pazar Yeri Meydanı', 1, 1), ('Pınar_2 Sokak', 1, 1), ('Rüzgarlı Sokak', 1, 1), ('Sağlık Sokak', 1, 1), ('Sakarya_1 Sokak', 1, 1), ('Sakız Sokak', 1, 1), ('Sakız(1)- Sokak', 1, 1), ('Salihli Sokak', 1, 1), ('Salihli Yolu (İnönü) Caddesi', 1, 1), ('Salihli Yolu (Kırgız) Caddesi', 1, 1), ('Salihli Yolu Küme Evleri', 1, 1), ('Salkım_1 Sokak', 1, 1), ('Sanayi Caddesi', 1, 1), ('Seçkin Sokak', 1, 1), ('Selanik Sokak', 1, 1), ('Sencer Ünlü Küme Evleri', 1, 1), ('Serçe Sokak', 1, 1), ('Seren Sokak', 1, 1), ('Setboyu (Ünlü) Caddesi', 1, 1), ('Setboyu Caddesi', 1, 1), ('Sevinç Sokak', 1, 1), ('Soğuk Sokak', 1, 1), ('Söğüt Sokak', 1, 1), ('Sümbül_1 Sokak', 1, 1), ('Şafak Sokak', 1, 1), ('Şahbaz Sokak', 1, 1), ('Şahin_2 Sokak', 1, 1), ('Şelale Sokak', 1, 1), ('Şüheda Caddesi', 1, 1), ('Tariş_1 Sokak', 1, 1), ('Tevfik Kış Caddesi', 1, 1), ('Tombak Sokak', 1, 1), ('Tuna_1 Sokak', 1, 1), ('Turan_2 Sokak', 1, 1), ('Ufuk_1 Sokak', 1, 1), ('Uygar Sokak', 1, 1), ('Üzümlü_2 Sokak', 1, 1), ('Vatan_1 Bulvarı', 1, 1), ('Yağmur Sokak', 1, 1), ('Yaprak Sokak', 1, 1), ('Yasemin_1 Sokak', 1, 1), ('Yasin Sokak', 1, 1), ('Yaşar Doğu_1 Caddesi', 1, 1), ('Yaşar Doğu(1) Sokak', 1, 1), ('Yaşar Doğu(2) Sokak', 1, 1), ('Yavuz Selim_1 Sokak', 1, 1), ('Yayla_3 Sokak', 1, 1), ('Yeşil Bağlar Sokak', 1, 1), ('Yıldız_2 Sokak', 1, 1), ('Yılmaz Caddesi', 1, 1), ('Yonca_1 Sokak', 1, 1), ('Yükseliş Caddesi', 1, 1), ('Zafer_3 Sokak', 1, 1), ('Zakkum Sokak', 1, 1), ('Zeytin_1 Sokak', 1, 1), ('Zeytinli Caddesi', 1, 1), ('Zümrüt Sokak', 1, 1);
