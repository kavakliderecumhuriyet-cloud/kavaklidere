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
  guncelleme: "2026-10-29T19:32:00+03:00",

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
    { id: "kayip-kopek-29ekim", tur: "onemli", kat: "Kayıp",
      baslik: "Kayıp Pinscher köpek aranıyor",
      metin: "Siyah-kahverengi renkli Pinscher cinsi köpeğimiz kaybolmuştur. Görenlerin veya bilgisi olanların 0537 207 18 47 numaralı telefondan sahibine ya da muhtarlığa haber vermesi rica olunur.",
      foto: "assets/duyuru-kayip-kopek.jpg", fotoAlt: "Kayıp siyah-kahverengi Pinscher köpek",
      tarih: "2026-10-29", olay: "İletişim: 0537 207 18 47", bitis: "2026-11-12", kaynak: "Muhtar Salih Taşlıyol" },

    { id: "cumhuriyet-bayrami-program-2026", tur: "onemli", kat: "Etkinlik", sabit: true,
      baslik: "29 Ekim Cumhuriyet Bayramı kutlama programı",
      metin: "Cumhuriyetimizin 103. yılını coşkuyla kutluyoruz. 09.30: Kavaklıdere İlkokulu / Şehit Murat Kartal Ortaokulu önünden Belediye Meydanı'na bando eşliğinde yürüyüş. 10.00: Kavaklıdere Atatürk İlk/Ortaokulu bahçesinde resmi tören. 19.00: Kavaklıdere İlkokulu / Şehit Murat Kartal Ortaokulu önünden hareketli fener alayı ve Kavaklıdere Belediye Binası önünde tören. Tüm mahalle halkımız davetlidir.",
      foto: "assets/duyuru-29-ekim-program.jpg", fotoAlt: "29 Ekim Cumhuriyet Bayramı kutlama programı afişi",
      tarih: "2026-10-28", olay: "29 Ekim 2026 · 09.30, 10.00 ve 19.00", bitis: "2026-10-30",
      kaynak: "Kavaklıdere Çok Programlı Anadolu Lisesi ve Kavaklıdere Atatürk İlk/Ortaokulu müdürlükleri" },

    { id: "cumhuriyet-bayrami-2026", tur: "bilgi", kat: "Muhtarlık", sabit: true,
      baslik: "Cumhuriyetimizin 103. yılı kutlu olsun",
      metin: "Cumhuriyetimizin kurucusu Gazi Mustafa Kemal Atatürk'ü ve bu vatan için mücadele eden tüm kahramanlarımızı saygı, minnet ve rahmetle anıyoruz. 29 Ekim Cumhuriyet Bayramımız kutlu olsun!",
      foto: "assets/duyuru-29-ekim-2026.jpg", fotoAlt: "29 Ekim Cumhuriyet Bayramı kutlama görseli, Kavaklıdere Mahalle Muhtarı Salih Taşlıyol",
      tarih: "2026-10-26", olay: "29 Ekim 2026, Perşembe", bitis: "2026-10-31", kaynak: "Muhtar Salih Taşlıyol" },

    { id: "kayip-kimlik-20ekim", tur: "onemli", kat: "Muhtarlık",
      baslik: "Bulunan kimlik ve banka kartı",
      metin: "Eyüp Ç. adına kimlik kartı ve banka kartı bulunmuştur. Kart sahibini tanıyan varsa muhtarlığa yönlendirebilir. Kartlar, kimlik kontrolüyle sahibine teslim edilecektir.",
      tarih: "2026-10-20", olay: "Teslim: Mahalle Muhtarlığı", bitis: "2026-10-27", kaynak: "Muhtar Salih Taşlıyol" },

    { id: "muhtarlar-gunu-2026", tur: "bilgi", kat: "Muhtarlık", sabit: true,
      baslik: "19 Ekim Muhtarlar Günü kutlu olsun",
      metin: "Muhtarlık, gönüllere dokunmak, dertlere ortak olmak ve her zaman halkının yanında olmaktır. Mahallemize hizmet etmenin gururuyla, tüm muhtarlarımızın 19 Ekim Muhtarlar Günü kutlu olsun.",
      foto: "assets/duyuru-muhtarlar-gunu.jpg", fotoAlt: "Muhtar Salih Taşlıyol'un 19 Ekim Muhtarlar Günü kutlama görseli",
      tarih: "2026-10-19", olay: "19 Ekim 2026", bitis: "2026-10-21", kaynak: "Muhtar Salih Taşlıyol" },

    { id: "elektrik-kesintisi-17ekim", tur: "acil", kat: "Altyapı",
      baslik: "Kısmi elektrik kesintisi",
      metin: "Mahallemiz genelinde bazı yerlerde elektrik var, bazı yerlerde yok şeklinde kısmi enerji kesintisi vardır. Arıza kaynaklı olup GDZ Elektrik ekiplerine bildirildi. Bilginize.",
      tarih: "2026-10-17", olay: "17 Ekim 2026 · Arıza bildirimi: 186", bitis: "2026-10-18", kaynak: "Muhtar Salih Taşlıyol" },

    { id: "meme-kanseri-taramasi", tur: "onemli", kat: "Sağlık", sabit: true,
      baslik: "Meme kanseri taraması için otobüs",
      metin: "Sağlık ocağımızdan duyurulur: Meme kanseri taraması yaptırmak isteyen kadınlar için otobüs kaldırılacaktır. Gitmek isteyenlerin sağlık ocağına giderek isim yazdırması gerekmektedir. Kişi sayısı sınırlıdır.",
      tarih: "2026-10-16", olay: "Kayıt: sağlık ocağında, kontenjan sınırlı", kaynak: "Sağlık Ocağı / Muhtar Salih Taşlıyol" }
  ],

  ilanlar: [
    { id: "kavaklidere-sanayi-arsasi-4614", tip: "satilik", kat: "Arsa",
      baslik: "Ana yola cepheli 4.614 m² sanayi arsası",
      fiyat: "16.990.000 TL",
      aciklama: "Kavaklıdere Mahallesi'nde, Kavaklıdere Yolu'na cepheli, sanayi imarlı arsa sahibinden satılıktır. Müstakil tapulu, tapunun tamamı satılık. Su ve kanalizasyon altyapısı mevcut, kadastro yolu açılmış. Bitişikteki aynı sahibe ait yaklaşık 2.000 m² ve 409 m² iki parsel ilan fiyatına dahil değildir, talep halinde ayrıca görüşülür (üçü birlikte yaklaşık 7.023 m²). Emsal, gabari ve yapılaşma koşulları belediyeden teyit edilmelidir.",
      ozellik: ["Ada 399 · Parsel 2", "4.614,47 m²", "Sanayi imarlı", "Müstakil tapu", "Su, kanalizasyon", "Krediye uygun değil", "Takas yok", "Sahibinden"],
      foto: "assets/ilan-kavaklidere-sanayi-arsasi.jpg", fotoAlt: "TKGM parsel sorgu görünümünde 399 ada 2 parsel, Kavaklıdere Yolu kenarında",
      kaynakNo: "Sahibinden.com ilan no 1187454670", tarih: "2026-09-26", tel: "" },
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
