/* =====================================================================
   KAVAKLIDERE – SİTE VERİLERİ
   Duyurular, ilanlar, evraklar ve videolar burada güncellenir.
   Kurallar:
   - tarih: yayın tarihi, YYYY-AA-GG biçiminde (en yeni üstte gösterilir)
   - tur: "acil" | "onemli" | "bilgi"
   - sabit: true → listenin başında sabitlenir
   - bitis: bu tarihten sonra duyuru arşive geçer (YYYY-AA-GG)
   - ornek: true → tasarım için yazılmış örnek, gerçek bilgi değildir
   - İlanlar: tip "satilik" | "kiralik"; satilik için satildi:true, kiralik için kiralandi:true
     Kiralık kategoriler: Daire, Müstakil ev, Arsa ve tarla, İşyeri, Diğer
   - Evraklara ASLA isim, TC no, telefon gibi kişisel veri yazmayın.
   ===================================================================== */
window.SITE_DATA = {
  guncelleme: "2026-10-16T12:20:00+03:00",

  mahalle: {
    ad: "Kavaklıdere Cumhuriyet Mahallesi",
    ilce: "Alaşehir",
    il: "Manisa",
    konum: { lat: 38.42573, lon: 28.35379 }, // GeoNames / Open-Meteo, Kavaklıdere – Alaşehir
    muhtar: "Salih Taşlıyol",
    whatsapp: "905354350775",
    whatsappGoster: "0535 435 07 75"
  },

  teknik: { ad: "Teknik Görevli Özkan", whatsapp: "905366668666", whatsappGoster: "0536 666 86 66" },

  // Ziyaretçi sayacı (abacus.jasoncameron.dev, hesap gerektirmez). canli: canlı sayım servisi kurulunca doldurulacak
  sayac: { servis: "https://abacus.jasoncameron.dev", ad: "kavaklidere-cumhuriyet-portal", canli: null },

  duyurular: [
    { id: "meme-kanseri-taramasi", tur: "onemli", kat: "Sağlık", sabit: true,
      baslik: "Meme kanseri taraması için otobüs",
      metin: "Sağlık ocağımızdan duyurulur: Meme kanseri taraması yaptırmak isteyen kadınlar için otobüs kaldırılacaktır. Gitmek isteyenlerin sağlık ocağına giderek isim yazdırması gerekmektedir. Kişi sayısı sınırlıdır.",
      tarih: "2026-10-16", olay: "Kayıt: sağlık ocağında, kontenjan sınırlı", kaynak: "Sağlık Ocağı / Muhtar Salih Taşlıyol" }
  ],

  ilanlar: [
    { id: "zeytinlik-10ha", tip: "satilik", kat: "Tarla ve bağ", baslik: "10 hektar zeytinlik", fiyat: "4.999.000 TL",
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
