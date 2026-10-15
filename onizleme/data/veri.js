/* =====================================================================
   KAVAKLIDERE – SİTE VERİLERİ
   Duyurular, ilanlar, evraklar ve videolar burada güncellenir.
   Kurallar:
   - tarih: yayın tarihi, YYYY-AA-GG biçiminde (en yeni üstte gösterilir)
   - tur: "acil" | "onemli" | "bilgi"
   - sabit: true → listenin başında sabitlenir
   - bitis: bu tarihten sonra duyuru arşive geçer (YYYY-AA-GG)
   - ornek: true → tasarım için yazılmış örnek, gerçek bilgi değildir
   - Evraklara ASLA isim, TC no, telefon gibi kişisel veri yazmayın.
   ===================================================================== */
window.SITE_DATA = {
  guncelleme: "2026-10-15T11:30:00+03:00",

  mahalle: {
    ad: "Kavaklıdere Cumhuriyet Mahallesi",
    ilce: "Alaşehir",
    il: "Manisa",
    konum: { lat: 38.42573, lon: 28.35379 }, // GeoNames / Open-Meteo, Kavaklıdere – Alaşehir
    muhtar: "Salih Taşlıyol",
    whatsapp: "905354350775",
    whatsappGoster: "0535 435 07 75"
  },

  duyurular: [
    { id: "arac-muayenesi", tur: "onemli", kat: "Muhtarlık", sabit: true,
      baslik: "Araç muayenesi – 30 Ekim",
      metin: "30 Ekim 2026 Cuma günü araç muayenesi yapılacaktır. Muayene için önceden randevu alınması gerekmektedir. Randevu, saat ve yer bilgisi için muhtarlığa başvurabilirsiniz.",
      tarih: "2026-10-15", olay: "30 Ekim 2026, Cuma", bitis: "2026-10-30", kaynak: "Muhtarlık" },

    { id: "su-kesintisi", tur: "acil", kat: "Altyapı", ornek: true,
      baslik: "Su kesintisi",
      metin: "16 Ekim Cuma 09:00–14:00 arası tüm mahallede şebeke bakımı yapılacaktır. Lütfen önceden su depolayınız.",
      tarih: "2026-10-15", olay: "16 Ekim, 09:00–14:00", bitis: "2026-10-16", kaynak: "MASKİ / Muhtarlık" },

    { id: "grip-asisi", tur: "onemli", kat: "Sağlık", ornek: true,
      baslik: "Grip aşısı başladı",
      metin: "65 yaş üstü ve kronik hastalığı olan vatandaşlarımız Aile Sağlığı Merkezi'ne kimlikleriyle başvurabilir.",
      tarih: "2026-10-15", olay: "Hafta içi her gün", kaynak: "Aile Sağlığı Merkezi" },

    { id: "cks", tur: "onemli", kat: "Tarım", ornek: true,
      baslik: "ÇKS güncelleme hatırlatması",
      metin: "Kuru üzüm üreticilerimiz Çiftçi Kayıt Sistemi bilgilerini İlçe Tarım Müdürlüğü'nde güncelleyebilir.",
      tarih: "2026-10-14", olay: "Ay sonuna kadar", kaynak: "İlçe Tarım Müdürlüğü" },

    { id: "okul-toplantisi", tur: "bilgi", kat: "Eğitim", ornek: true,
      baslik: "Okul aile birliği toplantısı",
      metin: "Velilerimiz 20 Ekim Salı saat 18:30'da okul salonunda yapılacak toplantıya davetlidir.",
      tarih: "2026-10-13", olay: "20 Ekim, 18:30", bitis: "2026-10-20", kaynak: "Okul Müdürlüğü" },

    { id: "bag-yolu", tur: "bilgi", kat: "Altyapı", ornek: true,
      baslik: "Bağ yolu tamiri",
      metin: "Doğu bağlar yolunda stabilize çalışması yapılacaktır. Traktör geçişlerinde dikkatli olunuz.",
      tarih: "2026-10-12", olay: "22–24 Ekim", bitis: "2026-10-24", kaynak: "Muhtarlık" },

    { id: "hayir-yemegi", tur: "bilgi", kat: "Etkinlik", ornek: true,
      baslik: "Mahalle hayır yemeği",
      metin: "Hasat sonu geleneksel hayır yemeği pazar günü öğle namazından sonra cami avlusunda verilecektir.",
      tarih: "2026-10-11", olay: "18 Ekim, öğle", bitis: "2026-10-18", kaynak: "Mahalle halkı" }
  ],

  ilanlar: [
    { id: "zeytinlik-10ha", kat: "Tarla ve bağ", baslik: "10 hektar zeytinlik", fiyat: "4.999.000 TL",
      aciklama: "Kavaklıdere'de 100 dönüm zeytinlik.", tarih: "2026-10-15", tel: "", satildi: true, ornek: true }
  ],

  evraklar: [
    { no: "KVK-0001", tur: "İkametgâh belgesi (örnek)", durum: "hazir", tarih: "2026-10-15" }
  ],

  videolar: [
    { kat: "Haber", baslik: "Kavaklıdere'de hasat sonu: kuru üzüm sergileri", sure: "4:12", renk: "#6B4A1A", ara: "Alaşehir kuru üzüm hasat" },
    { kat: "Muhtarlık", baslik: "Muhtardan ekim ayı bilgilendirmesi", sure: "6:48", renk: "#2F6B3F", ara: "Alaşehir Kavaklıdere" },
    { kat: "Tarım", baslik: "Bağda kış budaması nasıl yapılır?", sure: "11:05", renk: "#2F5560", ara: "bağ budaması nasıl yapılır" },
    { kat: "Kültür", baslik: "Alaşehir'in tarihi: Philadelphia'dan bugüne", sure: "9:30", renk: "#5A2848", ara: "Alaşehir tarihi Philadelphia" },
    { kat: "Sağlık", baslik: "Grip aşısı hakkında merak edilenler", sure: "3:20", renk: "#7A2F2A", ara: "grip aşısı sağlık bakanlığı" },
    { kat: "Etkinlik", baslik: "Alaşehir Üzüm Festivali'nden görüntüler", sure: "7:54", renk: "#8A6413", ara: "Alaşehir üzüm festivali" }
  ]
};
