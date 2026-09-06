"use strict";

/* ══════════════════════════════════════════════════════════════════════
   ASTRO - DENEYAP GÖREV TAKİP VE OPERASYON SİSTEMİ
   Veri Modeli, Durum Yönetimi & İş Motorları (data.js)
   ══════════════════════════════════════════════════════════════════════ */

/* ── Demo Simülasyon Tarihi ── */
let TODAY = new Date(2026, 7, 27); // 27 Ağustos 2026

const iso = d => d.toISOString().slice(0, 10);
const D = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayDiff = (a, b) => Math.round((D(a) - D(b)) / 864e5);
const AY = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const AYK = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const fmt = s => { const d = D(s); return d.getDate() + " " + AYK[d.getMonth()]; };
const fmtLong = s => { const d = D(s); return d.getDate() + " " + AY[d.getMonth()] + " " + d.getFullYear(); };
const UP = s => String(s).toLocaleUpperCase("tr-TR");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ── Ülke, Bölge, 81 İl ve Uluslararası DENEYAP Atölyeleri Yapısı ── */
const ULKELER = ["Türkiye","Azerbaycan","Kuzey Kıbrıs (KKTC)","Özbekistan"];

const BOLGE = ["Marmara","Ege","Akdeniz","İç Anadolu","Karadeniz","Doğu Anadolu","Güneydoğu Anadolu","Yurtdışı Operasyonları"];
const IL_BOLGE = {
  "Marmara":["Balıkesir","Bilecik","Bursa","Çanakkale","Edirne","İstanbul","Kırklareli","Kocaeli","Sakarya","Tekirdağ","Yalova"],
  "Ege":["Afyonkarahisar","Aydın","Denizli","İzmir","Kütahya","Manisa","Muğla","Uşak"],
  "Akdeniz":["Adana","Antalya","Burdur","Hatay","Isparta","Kahramanmaraş","Mersin","Osmaniye"],
  "İç Anadolu":["Aksaray","Ankara","Çankırı","Eskişehir","Karaman","Kayseri","Kırıkkale","Kırşehir","Konya","Nevşehir","Niğde","Sivas","Yozgat"],
  "Karadeniz":["Amasya","Artvin","Bartın","Bayburt","Bolu","Çorum","Düzce","Giresun","Gümüşhane","Karabük","Kastamonu","Ordu","Rize","Samsun","Sinop","Tokat","Trabzon","Zonguldak"],
  "Doğu Anadolu":["Ağrı","Ardahan","Bingöl","Bitlis","Elazığ","Erzincan","Erzurum","Hakkâri","Iğdır","Kars","Malatya","Muş","Tunceli","Van"],
  "Güneydoğu Anadolu":["Adıyaman","Batman","Diyarbakır","Gaziantep","Kilis","Mardin","Siirt","Şanlıurfa","Şırnak"],
  "Yurtdışı Operasyonları":["Bakü","Lefkoşa","Taşkent"]
};
const ILLER = [];
BOLGE.forEach(bl => IL_BOLGE[bl].forEach(il => ILLER.push({
  ad: il,
  bolge: bl,
  ulke: (bl === "Yurtdışı Operasyonları" ? (il === "Bakü" ? "Azerbaycan" : il === "Lefkoşa" ? "Kuzey Kıbrıs (KKTC)" : "Özbekistan") : "Türkiye")
})));
ILLER.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
const ilBolge = {}; ILLER.forEach(x => ilBolge[x.ad] = x.bolge);

/* ── DENEYAP Atölyeleri (Birimler) ── */
const BIRIM = [
  { id:"b1",  il:"Şanlıurfa", ad:"DENEYAP Haliliye",  gecmis:6.0, bolge:"Güneydoğu Anadolu", ulke:"Türkiye" },
  { id:"b2",  il:"Van",       ad:"DENEYAP İpekyolu",  gecmis:5.2, bolge:"Doğu Anadolu", ulke:"Türkiye" },
  { id:"b3",  il:"Diyarbakır",ad:"DENEYAP Kayapınar", gecmis:3.1, bolge:"Güneydoğu Anadolu", ulke:"Türkiye" },
  { id:"b4",  il:"Trabzon",   ad:"DENEYAP Ortahisar", gecmis:1.4, bolge:"Karadeniz", ulke:"Türkiye" },
  { id:"b5",  il:"Konya",     ad:"DENEYAP Selçuklu",  gecmis:0.6, bolge:"İç Anadolu", ulke:"Türkiye" },
  { id:"b6",  il:"İstanbul",  ad:"DENEYAP Fatih",     gecmis:2.2, bolge:"Marmara", ulke:"Türkiye" },
  { id:"b7",  il:"Erzurum",   ad:"DENEYAP Yakutiye",  gecmis:4.4, bolge:"Doğu Anadolu", ulke:"Türkiye" },
  { id:"b8",  il:"Gaziantep", ad:"DENEYAP Şahinbey",  gecmis:1.9, bolge:"Güneydoğu Anadolu", ulke:"Türkiye" },
  { id:"b9",  il:"Samsun",    ad:"DENEYAP İlkadım",   gecmis:0.9, bolge:"Karadeniz", ulke:"Türkiye" },
  { id:"b10", il:"Mardin",    ad:"DENEYAP Artuklu",   gecmis:4.8, bolge:"Güneydoğu Anadolu", ulke:"Türkiye" },
  { id:"b11", il:"Ankara",    ad:"DENEYAP Çankaya",   gecmis:1.1, bolge:"İç Anadolu", ulke:"Türkiye" },
  { id:"b12", il:"İzmir",     ad:"DENEYAP Bornova",   gecmis:2.6, bolge:"Ege", ulke:"Türkiye" },
  { id:"b13", il:"Bursa",     ad:"DENEYAP Nilüfer",   gecmis:1.8, bolge:"Marmara", ulke:"Türkiye" },
  { id:"b14", il:"Antalya",   ad:"DENEYAP Muratpaşa", gecmis:2.0, bolge:"Akdeniz", ulke:"Türkiye" },
  { id:"b15", il:"Adana",     ad:"DENEYAP Seyhan",    gecmis:3.0, bolge:"Akdeniz", ulke:"Türkiye" },
  { id:"b16", il:"Bakü",      ad:"DENEYAP Bakü",      gecmis:1.5, bolge:"Yurtdışı Operasyonları", ulke:"Azerbaycan" },
  { id:"b17", il:"Lefkoşa",   ad:"DENEYAP Lefkoşa",   gecmis:2.1, bolge:"Yurtdışı Operasyonları", ulke:"Kuzey Kıbrıs (KKTC)" },
  { id:"b18", il:"Taşkent",   ad:"DENEYAP Taşkent",   gecmis:2.5, bolge:"Yurtdışı Operasyonları", ulke:"Özbekistan" }
];
const bIdx = {}; BIRIM.forEach(b => bIdx[b.id] = b);
const MERKEZ_BIRIM = { id:"b0", il:"Merkez", ad:"Genel Merkez Operasyon", gecmis:0.8, bolge:"İç Anadolu", ulke:"Türkiye" };
bIdx["b0"] = MERKEZ_BIRIM;
const bLabel = id => { const b = bIdx[id]; return b ? b.il + " / " + b.ad : "—"; };
const bBolge = bid => (bIdx[bid] || MERKEZ_BIRIM).bolge;
const atolyeliIller = () => BIRIM.map(b => b.il);

/* ── Roller ve Kullanıcılar ── */
const ROL = {
  merkez: "Merkez Operasyon Ekibi",
  il:     "İl Sorumlusu",
  koord:  "Koordinatör",
  yonetici:"Yetkili Yönetici",
  egitmen:"Eğitmen"
};

const USER = [
  { id:"u1", ad:"M. Enes Kiraz", rol:"merkez",  birim:null },
  { id:"u2", ad:"Burak Şen",    rol:"koord",   birim:null },
  { id:"u3", ad:"Ayşe Korkmaz", rol:"yonetici",birim:null },
  { id:"u4", ad:"Zeynep Aydın", rol:"il", birim:"b1" },
  { id:"u5", ad:"Hakan Demir",  rol:"il", birim:"b2" },
  { id:"u6", ad:"Sema Kaya",    rol:"il", birim:"b3" },
  { id:"u7", ad:"Emre Yıldız",  rol:"il", birim:"b4" },
  { id:"u8", ad:"Murat Arslan", rol:"il", birim:"b5" },
  { id:"u9", ad:"Elif Toprak",  rol:"il", birim:"b6" },
  { id:"u10",ad:"Kadir Öz",     rol:"il", birim:"b7" },
  { id:"u11",ad:"Nihal Bulut",  rol:"il", birim:"b8" },
  { id:"u12",ad:"Onur Tekin",   rol:"il", birim:"b9" },
  { id:"u13",ad:"Rana Acar",    rol:"il", birim:"b10" },
  { id:"u14",ad:"Deniz Kılıç",  rol:"il", birim:"b11" },
  { id:"u15",ad:"Tolga Ersoy",  rol:"il", birim:"b12" },
  { id:"u16",ad:"Cemre Yalçın",  rol:"egitmen", birim:"b2" },
  { id:"u17",ad:"Barış Ateş",    rol:"egitmen", birim:"b1" },
  { id:"u18",ad:"Merve Sarı",    rol:"egitmen", birim:"b3" },
  { id:"u19",ad:"Yusuf Kaplan",  rol:"egitmen", birim:"b6" }
];
const uIdx = {}; USER.forEach(u => uIdx[u.id] = u);
const uOf = bid => USER.find(u => u.birim === bid);

const KAT = ["Atölye Operasyonu","Eğitmen ve Öğrenci İşleri","Etkinlik ve Tanıtım","Raporlama"];
const KOORDINATORLUK = [
  "Bursiyer Koordinatörlüğü",
  "Eğitmen & Müfredat Koordinatörlüğü",
  "Yarışmalar & Projeler Koordinatörlüğü",
  "Kurumsal İletişim & Etkinlik Koordinatörlüğü",
  "Saha & Operasyon Koordinatörlüğü",
  "Lojistik & Envanter Koordinatörlüğü",
  "AR-GE & Teknoloji Koordinatörlüğü"
];
const ONCELIK = ["Kritik","Yüksek","Normal","Düşük"];
const prColor = p => ({ "Kritik":"#E63946","Yüksek":"#F77F00","Normal":"#0284C7","Düşük":"#94A3B8" }[p]);

/* ── Görev Kataloğu (Standart İş Akışları & Checklistler) ── */
const KATALOG = [
  { t:"Atölye envanter sayımı ve eksik malzeme bildirimi", k:0, kw:["envanter","sayım","malzeme","eksik"],
    ad:["Malzeme listesi sistemden çıkarıldı","Fiziki sayım yapıldı","Eksik kalemler işaretlendi","Merkeze bildirim gönderildi"] },
  { t:"Atölye fiziki güvenlik kontrol formunun doldurulması", k:0, kw:["güvenlik","fiziki","kontrol","form"],
    ad:["Yangın tüpü ve ilk yardım kontrolü","Elektrik tesisatı kontrolü","Acil çıkış ve tahliye planı kontrolü","Form imzalanıp yüklendi"] },
  { t:"DENEYAP KART stok teyidi", k:0, kw:["kart","stok","teyit"],
    ad:["Depo sayımı yapıldı","Arızalı kartlar ayrıldı","Stok sisteme girildi"] },
  { t:"Sezon açılışı fiziki hazırlık kontrolü", k:0, kw:["açılış","hazırlık","sezon"],
    ad:["Sınıf düzeni kuruldu","Cihazlar test edildi","İnternet ve elektrik teyit edildi","Açılış tarihi merkeze bildirildi"] },
  { t:"Yeni sezon eğitmen ataması ve sözleşme teslimi", k:1, kw:["eğitmen","atama","sözleşme"],
    ad:["Aday listesi hazırlandı","Mülakatlar tamamlandı","Sözleşmeler imzalandı","Belgeler merkeze iletildi"] },
  { t:"Uygulama sınavı salon ve gözetmen planlaması", k:1, kw:["sınav","gözetmen","salon","uygulama"],
    ad:["Salon kapasitesi belirlendi","Gözetmen listesi oluşturuldu","Oturma planı hazırlandı","Adaylara duyuru yapıldı"] },
  { t:"Öğrenci devamsızlık raporunun aktarılması", k:1, kw:["devamsızlık","öğrenci"],
    ad:["Yoklama kayıtları toplandı","Devamsızlık eşiği aşan öğrenciler listelendi","Velilere bilgi verildi","Rapor merkeze yüklendi"] },
  { t:"Rehberlik bursiyeri haftalık gözlem raporu", k:1, kw:["rehberlik","bursiyer","gözlem"],
    ad:["Sınıf gözlemi yapıldı","Eğitmen görüşmesi tamamlandı","Rapor yazıldı ve yüklendi"] },
  { t:"Veli bilgilendirme toplantısı organizasyonu", k:2, kw:["veli","bilgilendirme","toplantı"],
    ad:["Tarih ve salon belirlendi","Velilere davet gönderildi","Sunum hazırlandı","Toplantı yapıldı ve katılım kaydedildi"] },
  { t:"Okul ziyareti ve atölye tanıtım planı", k:2, kw:["okul","ziyaret","tanıtım"],
    ad:["Ziyaret edilecek okullar belirlendi","Randevular alındı","Tanıtım materyali hazırlandı","Ziyaretler tamamlandı"] },
  { t:"TEKNOFEST takım kayıtlarının tamamlanması", k:2, kw:["teknofest","takım","kayıt"],
    ad:["Takım üyeleri belirlendi","Danışman ataması yapıldı","Başvuru formu dolduruldu","Kayıt onayı alındı"] },
  { t:"Protokol paydaşı ziyareti hazırlığı", k:2, kw:["protokol","paydaş"],
    ad:["Ziyaret programı hazırlandı","Sunum ve rapor dosyası derlendi","Atölye düzeni hazırlandı","Katılımcı listesi teyit edildi"] },
  { t:"Ağustos faaliyet raporunun merkeze iletilmesi", k:3, kw:["faaliyet","rapor","merkez","ağustos"],
    ad:["Ders ve etkinlik verileri toplandı","Yoklama özeti eklendi","Rapor yazıldı","Merkeze yüklendi"] },
  { t:"Sezon sonu başarı belgelerinin basımı ve dağıtımı", k:3, kw:["belge","başarı","basım","dağıtım"],
    ad:["Öğrenci listesi doğrulandı","Belgeler basıldı","Dağıtım yapıldı ve imza alındı"] },
  { t:"Bütçe harcama belgelerinin yüklenmesi", k:3, kw:["bütçe","harcama","belge"],
    ad:["Faturalar tarandı","Harcama kalemleri eşleştirildi","Sisteme yüklendi","Muhasebe onayı alındı"] },
  { t:"Haftalık ders planının sisteme yüklenmesi", k:1, kw:["ders planı","ders","plan"],
    ad:["Kazanımlar seçildi","Etkinlik akışı yazıldı","Materyal listesi eklendi","Plan yüklendi"] },
  { t:"Yoklama kayıtlarının haftalık tamamlanması", k:1, kw:["yoklama","katılım"],
    ad:["1. grup yoklaması alındı","2. grup yoklaması alındı","Devamsızlar not edildi"] },
  { t:"Öğrenci proje değerlendirme formlarının doldurulması", k:1, kw:["proje","değerlendirme","form"],
    ad:["Projeler incelendi","Rubrik puanları girildi","Geri bildirim yazıldı"] },
  { t:"Atölye malzeme ihtiyacının bildirilmesi", k:0, kw:["malzeme ihtiyac","ihtiyaç","talep"],
    ad:["Eksik malzemeler tespit edildi","Miktarlar belirlendi","Talep il sorumlusuna iletildi"] }
];

const GENEL_ADIM = ["Planlandı","Uygulandı ve kanıt toplandı","Merkeze bildirildi"];
function adimlarFor(baslik) {
  const c = KATALOG.find(x => x.t === baslik);
  return (c && c.ad ? c.ad : GENEL_ADIM).map(a => ({ ad:a, tamam:false }));
}

function mkTask(i, k, bi, termin, durum, oncelik, yuzde, sonGun, sorumluId) {
  const c = KATALOG[k], b = BIRIM[bi], u = sorumluId ? uIdx[sorumluId] : uOf(b.id);
  const ad = adimlarFor(c.t);
  const n = Math.round(yuzde / 100 * ad.length);
  ad.forEach((x, j) => x.tamam = j < n);
  return {
    id:"GRV-" + (104201 + i * 7), baslik:c.t, kategori:KAT[c.k], birim:b.id,
    sorumlu:u ? u.id : null, olusturan:"u1", termin, durum, oncelik, yuzde,
    sonGun, kaynak:"manuel", adimlar:ad, ekler:[], yorumlar:[], komisyon:null, altGrup:null,
    olusturma:iso(new Date(D(termin).getTime() - 21 * 864e5)), log:[]
  };
}

/* ── Başlangıç Görev Veri Tohumlaması ── */
const SEED = [
  [4, 1,"2026-08-26","Bekliyor","Kritik",     0, 12],
  [0, 0,"2026-08-24","Devam Ediyor","Yüksek",40,  9],
  [6, 6,"2026-08-25","Bekliyor","Yüksek",    10,  8],
  [1, 9,"2026-08-19","Devam Ediyor","Normal",80, 14],
  [14,6,"2026-08-23","Devam Ediyor","Yüksek",65,  4],
  [5, 2,"2026-08-29","Devam Ediyor","Yüksek",55,  2],
  [4, 1,"2026-09-02","Bekliyor","Kritik",     0, 13],
  [7, 1,"2026-09-01","Bekliyor","Yüksek",     0, 13],
  [6, 1,"2026-09-02","Bekliyor","Yüksek",     0, 12],
  [1, 2,"2026-09-01","Bekliyor","Yüksek",     0, 13],
  [13,2,"2026-09-02","Bekliyor","Kritik",     0, 14],
  [12,9,"2026-09-02","Bekliyor","Yüksek",     0, 12],
  [4, 6,"2026-09-02","Bekliyor","Kritik",     0, 12],
  [8, 3,"2026-09-04","Devam Ediyor","Normal",30,  1],
  [11,5,"2026-09-10","Devam Ediyor","Kritik",35,  1],
  [10,11,"2026-09-12","Bekliyor","Yüksek",    0,  7],
  [5, 10,"2026-09-03","Bekliyor","Yüksek",    0,  9],
  [3, 8,"2026-09-15","Bekliyor","Normal",     0,  5]
];

const SEED_DONE = [
  [2,4,"2026-08-05"],[12,4,"2026-08-08"],[13,4,"2026-08-12"],[9,4,"2026-08-18"],[1,4,"2026-08-14"],
  [0,8,"2026-08-06"],[12,8,"2026-08-10"],[5,8,"2026-08-20"],[9,8,"2026-08-15"],
  [1,10,"2026-08-04"],[12,10,"2026-08-09"],[8,10,"2026-08-17"],[9,10,"2026-08-12"],
  [0,3,"2026-08-07"],[12,3,"2026-08-11"],[2,3,"2026-08-19"],[13,3,"2026-08-15"],
  [1,7,"2026-08-05"],[12,7,"2026-08-13"],[6,7,"2026-08-21"],[13,7,"2026-08-16"],
  [12,5,"2026-08-08"],[1,5,"2026-08-15"],
  [12,11,"2026-08-07"],[0,11,"2026-08-16"],[8,11,"2026-08-13"],
  [12,2,"2026-08-06"],[2,2,"2026-08-14"],
  [12,6,"2026-08-12"],
  [2,9,"2026-08-11"],
  [12,1,"2026-08-10"],
  [12,0,"2026-08-13"],
  [3,4,"2026-08-03"],[6,4,"2026-08-21"],[3,7,"2026-08-04"],[9,7,"2026-08-19"],
  [3,3,"2026-08-05"],[6,3,"2026-08-20"],[3,10,"2026-08-06"],[13,10,"2026-08-18"],
  [3,8,"2026-08-03"],[6,8,"2026-08-17"],[9,11,"2026-08-05"],[13,11,"2026-08-19"]
];

const SEED_EGT = [
  [15,1,"u16","2026-08-28","Devam Ediyor","Yüksek",50,  3],
  [16,1,"u16","2026-08-31","Bekliyor","Kritik",     0,  6],
  [18,1,"u16","2026-09-04","Bekliyor","Yüksek",     0,  5],
  [15,0,"u17","2026-08-25","Devam Ediyor","Yüksek",33,  7],
  [17,0,"u17","2026-09-06","Bekliyor","Normal",     0,  2],
  [16,2,"u18","2026-09-01","Devam Ediyor","Normal",67,  1],
  [15,5,"u19","2026-09-03","Bekliyor","Normal",     0,  4],
  [18,5,"u19","2026-08-22","Devam Ediyor","Yüksek",67,  9],
  [17,2,"u18","2026-08-14","Tamamlandı","Normal",  100, 13],
  [16,0,"u17","2026-08-17","Tamamlandı","Normal",  100, 10]
];

let TASKS = SEED.map((s, i) => mkTask(i, s[0], s[1], s[2], s[3], s[4], s[5], s[6]));
SEED_DONE.forEach((s, j) => {
  TASKS.push(mkTask(SEED.length + j, s[0], s[1], s[2], "Tamamlandı", "Normal", 100,
    Math.max(1, dayDiff(iso(TODAY), s[2]))));
});
SEED_EGT.forEach((s, j) => {
  TASKS.push(mkTask(SEED.length + SEED_DONE.length + j, s[0], s[1], s[3], s[4], s[5], s[6], s[7], s[2]));
});

/* ── Komisyon Yapısı ── */
const KOMISYON = [
  { id:"k1", ad:"Eğitim ve Müfredat Komisyonu",     baskan:"u1", uyeler:["u1","u2","u18","u19"],
    alt:[{ id:"k1a", ad:"Müfredat Güncelleme" }, { id:"k1b", ad:"Eğitmen Yetkinlik" }] },
  { id:"k2", ad:"Ölçme ve Değerlendirme Komisyonu", baskan:"u2", uyeler:["u2","u3","u16","u6"],
    alt:[{ id:"k2a", ad:"Uygulama Sınavı" }, { id:"k2b", ad:"Devamsızlık ve Katılım" }] },
  { id:"k3", ad:"Tanıtım ve İletişim Komisyonu",    baskan:"u1", uyeler:["u1","u9","u14","u15"],
    alt:[{ id:"k3a", ad:"Okul Ziyaretleri" }, { id:"k3b", ad:"Veli İletişimi" }] },
  { id:"k4", ad:"Teknoloji ve Altyapı Komisyonu",   baskan:"u2", uyeler:["u2","u4","u5","u17"],
    alt:[{ id:"k4a", ad:"Atölye Kurulum" }, { id:"k4b", ad:"Envanter Standartları" }] },
  { id:"k5", ad:"Mali İşler ve Satın Alma Komisyonu", baskan:"u3", uyeler:["u3","u1","u11"],
    alt:[{ id:"k5a", ad:"Bütçe Takibi" }, { id:"k5b", ad:"Tedarik" }] }
];
const kIdx = {}; const kaIdx = {};
KOMISYON.forEach(k => { kIdx[k.id] = k; k.alt.forEach(a => { a.komisyon = k.id; kaIdx[a.id] = a; }); });
const komisyonlarim = uid => KOMISYON.filter(k => k.uyeler.includes(uid));
const komAd = t => t.komisyon ? kIdx[t.komisyon].ad + (t.altGrup ? " · " + kaIdx[t.altGrup].ad : "") : "";

/* Komisyon Görev Tohumlaması */
const KOM_GOREV = [
  ["k1","k1a","2. yıl müfredat kazanım haritasının güncellenmesi","Raporlama","u1","2026-09-12","Devam Ediyor","Yüksek",40,2],
  ["k1","k1b","Eğitmen yetkinlik sınavı soru havuzunun hazırlanması","Eğitmen ve Öğrenci İşleri","u18","2026-09-08","Bekliyor","Kritik",0,6],
  ["k2","k2a","Uygulama sınavı değerlendirme rubriğinin onaylanması","Eğitmen ve Öğrenci İşleri","u2","2026-09-03","Devam Ediyor","Kritik",60,1],
  ["k2","k2b","Devamsızlık üst sınırlarının 12 birime duyurulması","Raporlama","u16","2026-08-30","Bekliyor","Yüksek",0,7],
  ["k3","k3a","Eylül okul ziyaret takviminin 12 il için kesinleştirilmesi","Etkinlik ve Tanıtım","u9","2026-09-06","Devam Ediyor","Normal",35,3],
  ["k3","k3b","Veli bilgilendirme sunumunun ortak şablona alınması","Etkinlik ve Tanıtım","u14","2026-09-10","Bekliyor","Normal",0,4],
  ["k4","k4a","Yeni atölye kurulum kontrol listesinin yayımlanması","Atölye Operasyonu","u4","2026-08-28","Devam Ediyor","Yüksek",70,2],
  ["k4","k4b","Asgari stok seviyelerinin faz bazında yeniden belirlenmesi","Atölye Operasyonu","u2","2026-09-02","Bekliyor","Kritik",0,9],
  ["k5","k5a","Ağustos bütçe gerçekleşmesinin komisyona sunulması","Raporlama","u3","2026-08-25","Devam Ediyor","Yüksek",80,5],
  ["k5","k5b","Sarf malzeme çerçeve anlaşmasının yenilenmesi","Atölye Operasyonu","u11","2026-09-18","Bekliyor","Normal",0,3]
];

KOM_GOREV.forEach((g, i) => {
  const t = {
    id:"GRV-K" + (2001 + i * 3), baslik:g[2], kategori:g[3], birim:"b0",
    komisyon:g[0], altGrup:g[1], sorumlu:g[4], olusturan:"u1", termin:g[5], durum:g[6],
    oncelik:g[7], yuzde:g[8], sonGun:g[9], kaynak:"komisyon", olusturma:iso(new Date(D(g[5]).getTime() - 24 * 864e5)),
    adimlar:adimlarFor(g[2]), ekler:[], yorumlar:[],
    log:[{ tarih:iso(new Date(D(g[5]).getTime() - 24 * 864e5)), kim:"u1", tip:"olusturma",
      not:kIdx[g[0]].ad + " · " + kaIdx[g[1]].ad + " çalışma grubuna atandı." }]
  };
  const n = Math.round(t.yuzde / 100 * t.adimlar.length);
  t.adimlar.forEach((x, j) => x.tamam = j < n);
  TASKS.push(t);
});

/* ── Ekler ve Yorumlar Yardımcıları ── */
let EK_SEQ = 0, YORUM_SEQ = 0;
function yorumEkle(t, kim, metin, tip, gunOnce) {
  t.yorumlar.push({ id:"y" + (++YORUM_SEQ), kim, metin, tip:tip || "yorum",
    tarih:iso(new Date(TODAY.getTime() - (gunOnce || 0) * 864e5)), cozuldu:tip !== "revizyon" });
}
function ekEkle(t, kim, ad, tur, boyut, gunOnce) {
  t.ekler.push({ id:"e" + (++EK_SEQ), kim, ad, tur, boyut,
    tarih:iso(new Date(TODAY.getTime() - (gunOnce || 0) * 864e5)), veri:null });
}

/* Örnek Yorum & Eklerin Eklenmesi */
(function tohumEkYorum() {
  const bul = s => TASKS.find(t => t.baslik.indexOf(s) === 0 && t.durum !== "Tamamlandı");
  const a = bul("Atölye envanter sayımı");
  if (a) {
    yorumEkle(a, "u1", "Sayım formunun imzalı tutanağını da ekleyebilir misiniz? Sadece fotoğraf kabul edilmiyor.", "revizyon", 2);
    ekEkle(a, a.sorumlu, "sayim-tutanagi.jpg", "image/jpeg", 1842000, 2);
  }
  const b = bul("Uygulama sınavı değerlendirme");
  if (b) {
    yorumEkle(b, "u3", "Rubrikte 4. kriterin puan ağırlığı fazla gibi duruyor, komisyon toplantısında tekrar ele alalım.", "yorum", 1);
    ekEkle(b, "u2", "rubrik-taslak-v3.pdf", "application/pdf", 486000, 1);
  }
  const c = bul("Atölye fiziki güvenlik");
  if (c) {
    yorumEkle(c, "u2", "Yangın tüpü basınç saati etiket tarihleri net görünmüyor, yakından bir kare daha yükleyin.", "revizyon", 3);
    ekEkle(c, c.sorumlu, "atolye-guvenlik-panosu.jpg", "image/jpeg", 2310000, 3);
  }
  const d = bul("Ağustos bütçe");
  if (d) ekEkle(d, "u3", "agustos-butce-gerceklesme.pdf", "application/pdf", 1120000, 5);
})();

/* Başlangıç Günlük Kayıtları */
TASKS.forEach(t => {
  t.log.push({ tarih:t.olusturma, kim:"u1", tip:"olusturma", not:"Görev oluşturuldu ve " + (t.sorumlu ? uIdx[t.sorumlu].ad : "birime") + " atandı." });
  if (t.durum === "Devam Ediyor" || t.durum === "Tamamlandı") {
    t.log.push({ tarih: iso(new Date(TODAY.getTime() - t.sonGun * 864e5)), kim:t.sorumlu, tip:"durum",
      eski:"Bekliyor", yeni:"Devam Ediyor", yuzde:t.yuzde,
      not:t.yuzde >= 70 ? "Süreç tamamlanmak üzere, son kontroller yapılıyor." : "Çalışmalara başlandı." });
  }
  if (t.durum === "Tamamlandı") {
    t.log.push({ tarih: iso(new Date(TODAY.getTime() - Math.max(0, t.sonGun - 2) * 864e5)), kim:t.sorumlu, tip:"durum",
      eski:"Devam Ediyor", yeni:"Tamamlandı", yuzde:100, not:"Görev tamamlandı, belgeler merkeze sunuldu." });
  }
});

/* ── Öğrenci ve Gruplar ── */
const AD_HAVUZ = ["Ahmet","Ayşe","Berk","Ceren","Deniz","Ela","Furkan","Gizem","Hakan","Irmak","Kaan","Leyla",
  "Mert","Nisa","Onur","Pelin","Selin","Tuna","Umut","Yağmur","Zeynep","Baran","Defne","Emir","Feyza","Hazal"];
const SOY_HAVUZ = ["Yılmaz","Kaya","Demir","Şahin","Çelik","Yıldız","Aydın","Öztürk","Arslan","Doğan",
  "Kılıç","Aslan","Çetin","Kara","Koç","Kurt","Özkan","Şimşek","Polat","Erdem"];
const GRUP_ADI = ["1. Grup · Temel Elektronik", "2. Grup · Robotik ve Kodlama"];
const GRUPLAR = [];
BIRIM.forEach((b, bi) => GRUP_ADI.forEach((g, gi) => {
  const n = 10 + ((bi + gi) % 3), ogr = [];
  for (let i = 0; i < n; i++)
    ogr.push({ id:"O" + bi + gi + i,
      ad:AD_HAVUZ[(bi * 7 + gi * 5 + i * 3) % AD_HAVUZ.length] + " " + SOY_HAVUZ[(bi * 3 + gi * 11 + i * 7) % SOY_HAVUZ.length] });
  GRUPLAR.push({ id:"G-" + bi + "-" + gi, birim:b.id, ad:g, ogr });
}));
const gIdx = {}; GRUPLAR.forEach(g => gIdx[g.id] = g);

/* ── Yoklama ve Devamsızlık Sınırları ── */
const LIMIT = { ogrenci:4, egitmen:2 };
let YOKLAMA = [], yokSeq = 1;
const YOK_DURUM = ["Katıldı","Katılmadı","İzinli"];
const GEREKCE_HAVUZ = ["Sağlık raporu","Aile mazereti","Okul sınavı","Ulaşım sorunu","Gerekçe bildirilmedi"];

GRUPLAR.filter(g => USER.some(u => u.rol === "egitmen" && u.birim === g.birim)).forEach((g, k) => {
  [52, 45, 38, 31, 24, 17, 10, 3].forEach((gun, j) => {
    const kayit = {}, ger = {};
    g.ogr.forEach((o, i) => {
      const cokSorunlu = (i * 5 + k) % 19 === 0;
      const sorunlu = (i * 3 + k) % 11 === 0;
      let d;
      if (cokSorunlu) d = (j % 8) < 5 ? "Katılmadı" : "Katıldı";
      else if (sorunlu) d = (j % 8) < 5 ? ((j % 2) ? "İzinli" : "Katılmadı") : "Katıldı";
      else { const r = (k * 5 + j * 7 + i * 3) % 13; d = r === 0 ? "Katılmadı" : r === 1 ? "İzinli" : "Katıldı"; }
      kayit[o.id] = d;
      const eskiKayit = gun >= 31;
      if (d !== "Katıldı" && !(eskiKayit && (i + j) % 3 === 0))
        ger[o.id] = GEREKCE_HAVUZ[(i * 3 + j) % GEREKCE_HAVUZ.length];
    });
    const egt = USER.find(u => u.rol === "egitmen" && u.birim === g.birim);
    const er = (k * 7 + j * 11) % 17;
    const eDurum = er === 0 ? "Katılmadı" : er === 1 ? "İzinli" : "Katıldı";
    YOKLAMA.push({ id:"YOK-" + (1000 + yokSeq++), grup:g.id,
      tarih:iso(new Date(TODAY.getTime() - gun * 864e5)),
      egitmen:egt.id, kayit, gerekce:ger,
      egitmenDurum:eDurum,
      egitmenGerekce:eDurum === "Katıldı" ? "" : GEREKCE_HAVUZ[(k + j) % 4],
      giren:egt.id });
  });
});
const yokOran = y => {
  const v = Object.values(y.kayit);
  return Math.round(v.filter(x => x === "Katıldı").length / v.length * 100);
};

/* ── Envanter ve 36 Aylık DENEYAP Eğitim Modeli Fazları ── */
const ENV_KAT = ["Elektronik","Robotik","Sarf Malzeme","Donanım","Güvenlik"];
const FAZ = [
  { id:"f0", ad:"Ortak Atölye Altyapısı",  kisa:"Ortak Altyapı",   donem:"Tüm dönem",        ortam:"Atölye" },
  { id:"f1", ad:"Tasarım ve Üretim",       kisa:"Tasarım/Üretim",  donem:"Ders dönemi · 1. yıl", ortam:"Atölye" },
  { id:"f2", ad:"Robotik ve Kodlama",      kisa:"Robotik/Kodlama", donem:"Ders dönemi · 1. yıl", ortam:"Atölye" },
  { id:"f3", ad:"Elektronik Prog. ve Nesnelerin İnterneti", kisa:"Elektronik/IoT", donem:"Ders dönemi · 1. yıl", ortam:"Atölye" },
  { id:"f4", ad:"İleri Robotik",           kisa:"İleri Robotik",   donem:"Ders dönemi · 2. yıl", ortam:"Atölye" },
  { id:"f5", ad:"Havacılık ve Uzay Teknolojileri", kisa:"Havacılık/Uzay", donem:"Ders dönemi · 2. yıl", ortam:"Atölye" },
  { id:"f6", ad:"Enerji Teknolojileri",    kisa:"Enerji",          donem:"Ders dönemi · 2. yıl", ortam:"Atölye" },
  { id:"f7", ad:"Malzeme Bilimi ve Nanoteknoloji", kisa:"Malzeme Bilimi", donem:"Ders dönemi · 2. yıl", ortam:"Atölye" },
  { id:"f8", ad:"Yazılım Teknolojileri",   kisa:"Yazılım",         donem:"Ders dönemi · 2. yıl", ortam:"Hibrit" },
  { id:"f9", ad:"Takımlar Dönemi",         kisa:"Takımlar",        donem:"Takımlar dönemi · 3. yıl", ortam:"Atölye" },
  { id:"f10",ad:"Siber Güvenlik",          kisa:"Siber Güvenlik",  donem:"Ders dönemi · 2. yıl", ortam:"Çevrim içi" },
  { id:"f11",ad:"Mobil Uygulama",          kisa:"Mobil Uygulama",  donem:"Ders dönemi · 2. yıl", ortam:"Çevrim içi" },
  { id:"f12",ad:"Yapay Zekâ",              kisa:"Yapay Zekâ",      donem:"Ders dönemi · 2. yıl", ortam:"Çevrim içi" }
];
const fIdx = {}; FAZ.forEach(f => fIdx[f.id] = f);

const SAYIM_PERIYOT = [15, 30, 60, 90, 180];
let KAT_SEQ = 0;
function mk(ad, kat, faz, min, periyot) {
  KAT_SEQ++;
  return { kod:"MK-" + String(KAT_SEQ).padStart(3, "0"), ad, kat, faz, min, periyot,
           kaynak:"merkez", ekleyen:"u1", eklendi:"2026-06-15" };
}

let ENV_KATALOG = [
  mk("Dizüstü bilgisayar",           "Donanım",      "f0", 12, 90),
  mk("Etkileşimli tahta / projeksiyon","Donanım",    "f0", 1,  180),
  mk("Multimetre",                   "Donanım",      "f0", 6,  90),
  mk("Havya seti",                   "Donanım",      "f0", 8,  90),
  mk("Jumper kablo seti",            "Sarf Malzeme", "f0", 10, 30),
  mk("Lehim teli",                   "Sarf Malzeme", "f0", 4,  30),
  mk("Yangın tüpü",                  "Güvenlik",     "f0", 3,  30),
  mk("İlk yardım çantası",           "Güvenlik",     "f0", 2,  30),
  mk("Koruyucu gözlük",              "Güvenlik",     "f0", 20, 60),
  mk("Antistatik bileklik",          "Güvenlik",     "f0", 8,  90),
  mk("3B yazıcı",                    "Donanım",      "f1", 2,  90),
  mk("3B yazıcı filamenti (PLA)",    "Sarf Malzeme", "f1", 6,  30),
  mk("Lazer kesim kontrplak levha",  "Sarf Malzeme", "f1", 10, 30),
  mk("Dijital kumpas",               "Donanım",      "f1", 4,  90),
  mk("El aleti seti",                "Donanım",      "f1", 4,  90),
  mk("DENEYAP KART",                 "Elektronik",   "f2", 20, 30),
  mk("Servo motor (SG90)",           "Robotik",      "f2", 24, 60),
  mk("DC motor ve sürücü kartı",     "Robotik",      "f2", 16, 60),
  mk("Ultrasonik mesafe sensörü",    "Robotik",      "f2", 20, 60),
  mk("Tekerlek ve şasi seti",        "Robotik",      "f2", 12, 90),
  mk("Çizgi izleyen sensör",         "Robotik",      "f2", 16, 60),
  mk("Arduino Uno seti",             "Elektronik",   "f3", 15, 60),
  mk("Breadboard",                   "Elektronik",   "f3", 20, 60),
  mk("Sensör kiti (9 parça)",        "Elektronik",   "f3", 12, 60),
  mk("Wi-Fi modülü (ESP8266)",       "Elektronik",   "f3", 15, 60),
  mk("OLED ekran modülü",            "Elektronik",   "f3", 12, 60),
  mk("Direnç ve kondansatör seti",   "Sarf Malzeme", "f3", 8,  30),
  mk("6 eksenli robot kol kiti",     "Robotik",      "f4", 2,  90),
  mk("Tek kart bilgisayar (SBC)",    "Elektronik",   "f4", 8,  90),
  mk("IMU / jiroskop sensörü",       "Robotik",      "f4", 10, 60),
  mk("Step motor ve sürücü",         "Robotik",      "f4", 10, 60),
  mk("Eğitim dronu",                 "Robotik",      "f5", 4,  60),
  mk("Drone yedek pervane seti",     "Sarf Malzeme", "f5", 12, 30),
  mk("LiPo batarya ve şarj ünitesi", "Donanım",      "f5", 8,  30),
  mk("Model uydu (CanSat) kiti",     "Robotik",      "f5", 3,  90),
  mk("Güneş paneli eğitim seti",     "Donanım",      "f6", 6,  90),
  mk("Yakıt pili deney seti",        "Donanım",      "f6", 3,  90),
  mk("Enerji ölçüm ünitesi",         "Donanım",      "f6", 4,  90),
  mk("Dijital mikroskop",            "Donanım",      "f7", 3,  90),
  mk("Laboratuvar cam malzeme seti", "Donanım",      "f7", 4,  90),
  mk("Hassas terazi",                "Donanım",      "f7", 2,  180),
  mk("Kimyasal sarf seti",           "Sarf Malzeme", "f7", 5,  30),
  mk("Ağ anahtarı (switch)",         "Donanım",      "f8", 2,  180),
  mk("Harici yedekleme ünitesi",     "Donanım",      "f8", 3,  180),
  mk("Proje prototip sarf kiti",     "Sarf Malzeme", "f9", 4,  30),
  mk("Sunum ve stant malzemesi",     "Sarf Malzeme", "f9", 2,  90)
];

const mIdx = {}; const mReindex = () => { ENV_KATALOG.forEach(m => mIdx[m.kod] = m); };
mReindex();
const fazKatalog = fid => ENV_KATALOG.filter(m => m.faz === fid);
const fazAktif = f => fazKatalog(f.id).length > 0;

let ENVANTER = [];
const ENV_SORUNLU = ["b1","b2","b10"];
BIRIM.forEach((b, bi) => ENV_KATALOG.forEach((m, mi) => {
  const ileri = ["f4","f5","f6","f7","f8","f9"].includes(m.faz);
  if (ileri && (bi * 7 + mi * 3) % 10 < 3) return;
  const h = (bi * 31 + mi * 17) % 100;
  const esik = (ileri ? 24 : 16) + (ENV_SORUNLU.includes(b.id) ? 13 : 0);
  let adet;
  if (h < esik) {
    adet = (m.kat === "Güvenlik" || m.min <= 3) ? Math.max(1, m.min - 1)
         : Math.max(0, m.min - 1 - (h % Math.max(2, Math.ceil(m.min / 2))));
  } else adet = m.min + (h % 7);
  const gecSayim = ENV_SORUNLU.includes(b.id) && (bi * 3 + mi * 7) % 10 < 4;
  const gun = gecSayim ? m.periyot + 3 + ((bi + mi * 3) % 25)
                       : Math.floor(m.periyot * (((bi * 5 + mi * 11) % 65) / 100));
  ENVANTER.push({ id:"ENV-" + bi + "-" + mi, birim:b.id, kod:m.kod, adet,
    sonSayim:iso(new Date(TODAY.getTime() - gun * 864e5)) });
}));
let ENV_SEQ = 900;

const envKat = e => mIdx[e.kod] || { ad:"—", kat:"—", faz:"f0", min:0, periyot:90 };
const envAd  = e => envKat(e).ad;
const envMin = e => envKat(e).min;
const envDurum = e => e.adet === 0 ? "Tükendi" : e.adet < envMin(e) ? "Eksik" : "Yeterli";
const envVade = e => iso(new Date(D(e.sonSayim).getTime() + envKat(e).periyot * 864e5));
const envVadeGun = e => dayDiff(envVade(e), iso(TODAY));

function fazHazir(fid, bid) {
  const kal = fazKatalog(fid);
  if (!kal.length) return null;
  const kay = ENVANTER.filter(e => e.birim === bid && envKat(e).faz === fid);
  const tam = kay.filter(e => envDurum(e) === "Yeterli").length;
  return { toplam:kal.length, kayitli:kay.length, eksikKayit:kal.length - kay.length,
           yeterli:tam, pc:Math.round(tam / kal.length * 100) };
}
const eksikKalemler = bid => ENV_KATALOG.filter(m => !ENVANTER.some(e => e.birim === bid && e.kod === m.kod));
let TALEP = [], tSeq = 0;

/* Fiyatlandırma & Hareket Geçmişi */
const FIYATLAR = [
  32000, 95000, 1200, 2500, 180, 320, 1400, 900, 240, 190,
  42000, 850, 480, 950, 3800,
  1450, 210, 480, 160, 950, 280,
  1150, 140, 1300, 320, 380, 620,
  28000, 6500, 540, 780,
  18500, 420, 3200, 12500,
  8900, 15500, 6200,
  7800, 4300, 11500, 2100,
  3400, 5600,
  4500, 2800
];
ENV_KATALOG.forEach((m, i) => m.fiyat = FIYATLAR[i] || 500);

const HAREKET_SEBEP = ["Sarf tüketimi","Kayıp","Arıza / kırılma","Temin","Sayım düzeltmesi"];
const SEBEP_RENK = { "Sarf tüketimi":"var(--astro-blue)", "Kayıp":"var(--astro-red)",
  "Arıza / kırılma":"var(--astro-orange)", "Temin":"#16A34A", "Sayım düzeltmesi":"var(--ink-400)" };
let HAREKET = [], hSeq = 0;
const AY_ANAHTAR = d => d.slice(0, 7);

function hareket(birim, kod, delta, sebep, tarih, kim, not) {
  const m = mIdx[kod];
  HAREKET.push({ id:"H" + (++hSeq), birim, kod, delta, sebep, tarih, kim: kim || null,
    tutar: Math.abs(delta) * (m ? m.fiyat : 0), not: not || "" });
}

BIRIM.forEach((b, bi) => {
  for (let ay = 5; ay >= 0; ay--) {
    const ayBasi = new Date(TODAY.getFullYear(), TODAY.getMonth() - ay, 1);
    ENV_KATALOG.forEach((m, mi) => {
      if (!ENVANTER.some(e => e.birim === b.id && e.kod === m.kod)) return;
      const h = (bi * 17 + mi * 29 + ay * 7) % 100;
      const sarfMi = m.kat === "Sarf Malzeme";
      const pahali = m.fiyat > 10000;
      if (!sarfMi && h > (pahali ? 3 : 20)) return;
      if (sarfMi && h > 78) return;
      const gun = 2 + (h % 24);
      const tarih = iso(new Date(ayBasi.getFullYear(), ayBasi.getMonth(), Math.min(gun, 27)));
      if (D(tarih) > TODAY) return;
      let sebep = "Sarf tüketimi";
      if (!sarfMi) sebep = h % 3 === 0 ? "Arıza / kırılma" : h % 3 === 1 ? "Kayıp" : "Sayım düzeltmesi";
      const adet = sarfMi ? 1 + (h % Math.max(2, Math.ceil(m.min / 3))) : (pahali ? 1 : 1 + (h % 2));
      hareket(b.id, m.kod, -adet, sebep, tarih, uOf(b.id) ? uOf(b.id).id : null);
      if (sarfMi && h % 5 === 0)
        hareket(b.id, m.kod, adet + 2, "Temin", iso(new Date(D(tarih).getTime() + 4 * 864e5)), "u1");
    });
  }
});
HAREKET.sort((a, b) => a.tarih.localeCompare(b.tarih));

/* ── Malzeme Talepleri (İl -> Merkez Tedarik İstekleri) ── */
let tlpSeq = 203;
let MALZEME_TALEPLERI = [
  {
    id: "TLP-201",
    birim: "b1",
    malzeme: "3D Yazıcı Filament (PLA 1.75mm)",
    kod: "m1",
    adet: 15,
    oncelik: "Yüksek",
    gerekce: "Atölyedeki tüm filament stokları tükendi, öğrenci projesi için acil ihtiyaç.",
    talepEden: "u4",
    tarih: iso(new Date(TODAY.getTime() - 2 * 864e5)),
    durum: "Bekliyor",
    not: "Merkez tedarik onayı bekliyor."
  },
  {
    id: "TLP-202",
    birim: "b2",
    malzeme: "Arduino Uno R3 Geliştirme Kartı",
    kod: "m2",
    adet: 20,
    oncelik: "Kritik",
    gerekce: "Robotik kodlama dersi öncesi asgari stok seviyesi altına düşüldü.",
    talepEden: "u5",
    tarih: iso(new Date(TODAY.getTime() - 4 * 864e5)),
    durum: "Onaylandı (Sevkiyatta)",
    not: "Merkez depodan kargoya verildi. Takip no: T3-77491"
  }
];

/* ── Duyurular ── */
const DUYURU_TIP = ["Resmî tatil","Belge teslimi","Eğitim takvimi","Sistem duyurusu","Etkinlik"];
let DUYURU = [], dSeq = 0;
function duyuruOlustur(baslik, metin, tip, hedef, yayinlayan, gunOnce, onemli) {
  const d = { id:"DYR-" + (101 + dSeq++), baslik, metin, tip, hedef, yayinlayan,
    tarih:iso(new Date(TODAY.getTime() - (gunOnce || 0) * 864e5)), onemli: !!onemli, okuyan:[] };
  DUYURU.push(d);
  return d;
}
duyuruOlustur("30 Ağustos Zafer Bayramı — atölyeler kapalı",
  "30 Ağustos Cumartesi günü tüm DENEYAP atölyelerinde eğitim yapılmayacaktır. O güne planlanmış dersler telafi olarak alınacaktır. Yoklama kaydı girilmesine gerek yoktur.",
  "Resmî tatil", { kapsam:"tumu" }, "u1", 6, true);
duyuruOlustur("Eğitmen sözleşmelerinin teslimi — son gün 8 Eylül",
  "Yeni sezonda görev alacak eğitmenlerin imzalı sözleşmeleri ve güncel adli sicil belgeleri en geç 8 Eylül Pazartesi gününe kadar merkeze iletilmelidir.",
  "Belge teslimi", { kapsam:"rol", rol:"il" }, "u1", 4, true);
duyuruOlustur("2026–2027 sezon açılışı 15 Eylül",
  "Ders dönemi 15 Eylül Pazartesi başlıyor. Açılış haftasında yoklama, envanter sayımı ve atölye güvenlik formu birlikte tamamlanacak.",
  "Eğitim takvimi", { kapsam:"tumu" }, "u1", 3, false);
duyuruOlustur("Yoklama modülünde gerekçe alanı zorunlu hâle geldi",
  "Bir öğrenci veya eğitmen katılmadı ya da izinli olarak işaretlendiğinde mazeret gerekçesi yazılması zorunludur.",
  "Sistem duyurusu", { kapsam:"rol", rol:"egitmen" }, "u2", 2, false);
duyuruOlustur("Güneydoğu Anadolu bölgesi atölyelerinde sayım denetimi",
  "Şanlıurfa, Diyarbakır, Gaziantep ve Mardin atölyelerinde sayım periyodu dolmuş kalem sayısı yükseldiği için 10–12 Eylül arasında bölge denetimi yapılacaktır.",
  "Sistem duyurusu", { kapsam:"bolge", bolge:"Güneydoğu Anadolu" }, "u2", 0, true);

function duyuruBana(uid) {
  const u = uIdx[uid];
  if (!u) return [];
  return DUYURU.filter(d => {
    const h = d.hedef;
    if (h.kapsam === "tumu") return true;
    if (h.kapsam === "rol") return u.rol === h.rol || u.rol === "merkez" || u.rol === "koord";
    if (h.kapsam === "bolge") return u.birim ? bBolge(u.birim) === h.bolge : true;
    if (h.kapsam === "il") return u.birim ? bIdx[u.birim].il === h.il : true;
    if (h.kapsam === "birim") return u.birim === h.birim || !u.birim;
    if (h.kapsam === "komisyon") return komisyonlarim(uid).some(k => k.id === h.komisyon) || !u.birim;
    return false;
  }).sort((a, b) => b.tarih.localeCompare(a.tarih));
}

const hedefAd = h => h.kapsam === "tumu" ? "81 il · tüm kullanıcılar"
  : h.kapsam === "rol" ? ROL[h.rol] + " (tümü)"
  : h.kapsam === "bolge" ? h.bolge + " bölgesi"
  : h.kapsam === "il" ? h.il + " ili"
  : h.kapsam === "birim" ? bLabel(h.birim)
  : h.kapsam === "komisyon" ? kIdx[h.komisyon].ad : "—";
const okunmamisDuyuru = uid => duyuruBana(uid).filter(d => !d.okuyan.includes(uid)).length;

/* ── Bildirimler ve Risk Motoru (PRD Kriterleri) ── */
let NOTIF = [];
let nSeq = 1;

function risk(t) {
  if (t.durum === "Tamamlandı") return { skor:0, sebep:[], aksiyon:null };
  const kalan = dayDiff(t.termin, iso(TODAY));
  const b = bIdx[t.birim];
  const sebep = [];

  // 1) Termin baskısı
  let baski = 0;
  if (kalan < 0) { baski = 100; sebep.push({ w:100, s:"Termin " + (-kalan) + " gün önce geçti ve görev hâlâ açık." }); }
  else if (kalan <= 2) { baski = 78; sebep.push({ w:78, s:"Termine " + kalan + " gün kaldı." }); }
  else if (kalan <= 6) { baski = 48; sebep.push({ w:48, s:"Termine " + kalan + " gün kaldı." }); }
  else if (kalan <= 14) baski = 22;
  else baski = 8;

  // 2) Birim geçmişi
  let gecmis = Math.min(100, b.gecmis * 15);
  if (b.gecmis >= 4) sebep.push({ w:gecmis, s:"Bu birim son üç görevi ortalama " + b.gecmis.toFixed(1).replace(".", ",") + " gün gecikmeli kapattı." });

  // 3) Durgunluk
  let durgun = Math.min(100, t.sonGun * 9);
  if (t.sonGun >= 7) sebep.push({ w:durgun, s:t.sonGun + " gündür hiçbir güncelleme yapılmadı." });

  // 4) İlerleme açığı
  const toplam = Math.max(1, dayDiff(t.termin, t.olusturma));
  const gecen = Math.max(0, Math.min(toplam, dayDiff(iso(TODAY), t.olusturma)));
  const beklenen = Math.round(gecen / toplam * 100);
  let acik = Math.max(0, beklenen - t.yuzde);
  if (acik >= 25) sebep.push({ w:acik, s:"Sürenin %" + beklenen + "'i tükendi ancak ilerleme %" + t.yuzde + "." });

  // 5) Öncelik katsayısı
  const carp = { "Kritik":1.12, "Yüksek":1.06, "Normal":1, "Düşük":0.9 }[t.oncelik];

  let skor = Math.round((baski * 0.42 + gecmis * 0.2 + durgun * 0.2 + acik * 0.18) * carp);
  skor = Math.max(0, Math.min(100, skor));

  sebep.sort((a, b2) => b2.w - a.w);
  let aksiyon = null;
  if (skor >= 66) aksiyon = kalan < 0
    ? "Sorumluyu bugün arayın ve yeni bir termin belirleyin; gecikme koordinatör eskalasyon raporuna yansıdı."
    : "Sorumluyu bugün arayın; gerekiyorsa termini 3 gün öteleyin.";
  else if (skor >= 36) aksiyon = "Bu hafta içinde sorumlu kişiden ilerleme güncellemesi talep edin.";
  return { skor, sebep:sebep.slice(0, 3), aksiyon, kalan, beklenen };
}

const riskColor = s => s >= 66 ? "var(--astro-red)" : s >= 36 ? "var(--astro-orange)" : "#16A34A";

/* ── Otomatik Termin & Bildirim Tarayıcı (MVP Madde 06) ── */
function terminTara(sessiz) {
  let yeni = 0;
  TASKS.forEach(t => {
    if (t.durum === "Tamamlandı") { t.yaklasan = false; return; }
    const kalan = dayDiff(t.termin, iso(TODAY));
    if (kalan < 0 && t.durum !== "Gecikti") {
      const eski = t.durum;
      t.durum = "Gecikti";
      t.log.push({ tarih:iso(TODAY), kim:"sistem", tip:"otomatik", eski, yeni:"Gecikti",
        not:"Termin geçtiği için durum sistem tarafından Gecikti olarak işaretlendi." });
      bildir(t.sorumlu, t.id, "gecen", "Termin geçti: " + t.baslik);
      bildir("u1", t.id, "gecen", bIdx[t.birim].il + " — termin geçti: " + t.baslik);
      bildir("u2", t.id, "gecen", bIdx[t.birim].il + " — termin geçti: " + t.baslik);
      yeni++;
    } else if (kalan >= 0 && kalan <= 3) {
      if (!t.yaklasan) {
        t.yaklasan = true;
        bildir(t.sorumlu, t.id, "yaklasan", "Termine " + kalan + " gün: " + t.baslik);
        bildir("u1", t.id, "yaklasan", bIdx[t.birim].il + " — termine " + kalan + " gün: " + t.baslik);
        yeni++;
      }
    } else t.yaklasan = false;
  });
  TASKS.forEach(t => {
    if (t.durum !== "Tamamlandı" && risk(t).skor >= 80 && !t.riskUyarildi) {
      t.riskUyarildi = true;
      bildir("u2", t.id, "risk", "Yüksek risk (" + risk(t).skor + "): " + t.baslik);
      bildir("u1", t.id, "risk", bIdx[t.birim].il + " — yüksek risk (" + risk(t).skor + "): " + t.baslik);
      yeni++;
    }
  });
  return yeni;
}

function bildir(uid, gid, tip, metin) {
  if (!uid) return;
  NOTIF.unshift({ id:"n" + (nSeq++), user:uid, gorev:gid, tip, metin, tarih:iso(TODAY), okundu:false });
}

/* ── Periyodik Sayım Motoru ── */
let sayimAcik = {};
function sayimTara() {
  let yeni = 0;
  BIRIM.forEach(b => {
    const gec = ENVANTER.filter(e => e.birim === b.id && envVadeGun(e) < 0);
    if (gec.length < 3) { sayimAcik[b.id] = null; return; }
    const mevcut = sayimAcik[b.id] && TASKS.find(t => t.id === sayimAcik[b.id] && t.durum !== "Tamamlandı");
    if (mevcut) return;
    const il = uOf(b.id);
    const baslik = "Atölye envanter sayımı ve eksik malzeme bildirimi";
    const t = {
      id:"GRV-" + (108000 + TASKS.length * 7), baslik, kategori:"Atölye Operasyonu", birim:b.id,
      sorumlu:il ? il.id : null, olusturan:"u1",
      termin:iso(new Date(TODAY.getTime() + 5 * 864e5)), durum:"Bekliyor",
      oncelik:gec.length >= 8 ? "Yüksek" : "Normal", yuzde:0, sonGun:0,
      kaynak:"sayim", olusturma:iso(TODAY), adimlar:adimlarFor(baslik), ekler:[], yorumlar:[],
      komisyon:null, altGrup:null,
      log:[{ tarih:iso(TODAY), kim:"sistem", tip:"otomatik",
        not:gec.length + " kalemin sayım periyodu doldu (eşik: 3 kalem). Sayım görevi sistem tarafından açıldı." }]
    };
    TASKS.push(t);
    sayimAcik[b.id] = t.id;
    bildir(t.sorumlu, t.id, "sayim", gec.length + " kalemin sayım periyodu doldu — sayım görevi açıldı");
    bildir("u1", t.id, "sayim", b.il + " · " + gec.length + " kalemde sayım vadesi geçti");
    yeni++;
  });
  return yeni;
}

/* ── Küresel Uygulama Durumu (State) ── */
let S = {
  userId: null,
  view: "pano",
  gorevId: null,
  filt: { ulke:"", bolge:"", il:"", birim:"", komisyon:"", koord:"", durum:"", oncelik:"", kat:"", q:"" },
  sekme: "yuksek",
  sor: false,
  sorGecmis: [],
  bildirimAcik: false,
  yokGrup: "", yokTarih: "", yokTaslak: null,
  envFilt: { bolge:"", il:"", birim:"", kat:"", faz:"", sadeceEksik:false, sadeceVade:false },
  envEkleAcik: false, envTalepFormAcik: false, envEkleKod: "", envEkleAdet: "",
  istisna: { ad:"", kat:"Elektronik", faz:"f0", adet:"", gerekce:"" },
  katFaz: "", katYeniAcik: false,
  katYeni: { ad:"", kat:"Elektronik", faz:"f0", min:"", periyot:"60" },
  ayrisSonuc: null, ayrisMod: "metin", ayrisDosya: null, sesKayitAktif: false,
  ayar: { oneriler:true, ipuclari:true, yogunTablo:false },
  gelismis: false,
  duyuruYeniAcik: false, duyuruKapsam: "tumu",
  komId: "", profilId: "", yokDenetimBirim: "", yokDenetimGrup: "",
  envSekme: "liste",
  yokSekme: "kayit", yokDetay: "", yokFilt: { ulke:"", bolge:"", il:"", birim:"", grup:"", bas:"", bit:"" },
  riskDetay: null,
  eksikSebep: null,
  aktarim: null,
  toast: null
};

const me = () => uIdx[S.userId];
const rolum = () => me() ? me().rol : null;
const ILK = { merkez:"pano", il:"benim", egitmen:"benim", koord:"gecikme", yonetici:"rapor" };
const yazabilir = () => ["il","egitmen","merkez"].includes(rolum());
const okunmamis = () => NOTIF.filter(n => n.user === S.userId && !n.okundu).length;

function gorunur() {
  const u = me();
  if (!u) return [];
  if (u.rol === "il") return TASKS.filter(t => t.birim === u.birim || t.birim === "__TUM__" || (t.ortakIller && t.ortakIller.includes(u.birim)));
  if (u.rol === "egitmen") return TASKS.filter(t => t.sorumlu === u.id || (t.ortakIller && t.ortakIller.includes(u.birim)));
  return TASKS.slice();
}
