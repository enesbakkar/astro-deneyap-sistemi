"use strict";

/* ══════════════════════════════════════════════════════════════════════
   ASTRO - DENEYAP GÖREV TAKİP VE OPERASYON SİSTEMİ
   Arayüz Bileşenleri, Görünümler & Olaylar (app.js)
   ══════════════════════════════════════════════════════════════════════ */

/* ── Menü Yapısı (Rol Bazlı) ── */
const MENU = {
  merkez:[
    ["OPERASYON", [["pano","Pano","i-grid"],["gorevler","Görevler","i-list"],
                   ["olustur","Görev oluştur","i-plus"],["ayristirici","Görev ayrıştırıcı","i-wand"]]],
    ["SAHA",      [["envanter","Envanter","i-box"],["yoklama","Yoklama","i-check"],
                   ["duyuru","Duyurular","i-mega"]]],
    ["YÖNETİM",   [["katalog","Malzeme kataloğu","i-file"],["komisyon","Komisyonlar","i-user"],
                   ["riskpano","Risk analizi","i-alert"],["rapor","Raporlar","i-chart"]]],
    ["",          [["bildirim","Bildirimler","i-bell"],["ayarlar","Ayarlar","i-gear"]]]
  ],
  il:[
    ["OPERASYON", [["benim","Görevlerim","i-list"]]],
    ["SAHA",      [["envanter","Envanter","i-box"],["yoklama","Yoklama","i-check"],
                   ["duyuru","Duyurular","i-mega"]]],
    ["YÖNETİM",   [["komisyon","Komisyonlarım","i-user"]]],
    ["",          [["bildirim","Bildirimler","i-bell"],["ayarlar","Ayarlar","i-gear"]]]
  ],
  egitmen:[
    ["OPERASYON", [["benim","Görevlerim","i-list"]]],
    ["SAHA",      [["yoklama","Yoklama","i-check"],["envanter","Envanter","i-box"],
                   ["duyuru","Duyurular","i-mega"]]],
    ["",          [["profil","Profilim","i-user"],["bildirim","Bildirimler","i-bell"],
                   ["ayarlar","Ayarlar","i-gear"]]]
  ],
  koord:[
    ["OPERASYON", [["pano","Pano","i-grid"],["gecikme","Gecikme paneli","i-clock"],
                   ["gorevler","Görevler","i-list"]]],
    ["SAHA",      [["envanter","Envanter","i-box"],["yoklama","Yoklama denetimi","i-check"],
                   ["duyuru","Duyurular","i-mega"]]],
    ["YÖNETİM",   [["komisyon","Komisyonlar","i-user"],["riskpano","Risk analizi","i-alert"],
                   ["rapor","Raporlar","i-chart"]]],
    ["",          [["bildirim","Bildirimler","i-bell"],["ayarlar","Ayarlar","i-gear"]]]
  ],
  yonetici:[
    ["YÖNETİM",   [["riskpano","Risk analizi","i-alert"],["rapor","Sezon raporu","i-chart"],
                   ["pano","Pano","i-grid"]]],
    ["SAHA",      [["envanter","Envanter","i-box"],["duyuru","Duyurular","i-mega"]]],
    ["",          [["ayarlar","Ayarlar","i-gear"]]]
  ]
};

const oneriAcik = () => S.ayar.oneriler;
const oneri = html => S.ayar.oneriler ? html : "";
const ipucu = (metin, ek) => S.ayar.ipuclari
  ? '<p class="note"' + (ek ? ' style="' + ek + '"' : '') + '>' + metin + '</p>' : '';

const ic = (n, cls) => '<svg class="' + (cls || '') + '"><use href="#' + n + '"/></svg>';

function stPill(d) {
  const c = { "Bekliyor":"bekliyor","Devam Ediyor":"devam","Tamamlandı":"tamam","Gecikti":"gecikti" }[d] || "bekliyor";
  const icon = d === "Tamamlandı" ? "i-check" : d === "Gecikti" ? "i-alert" : d === "Devam Ediyor" ? "i-clock" : "i-list";
  return '<span class="status-pill ' + c + '">' + ic(icon) + UP(d) + '</span>';
}

const prPill = p => '<span class="priority-pill"><i style="background:' + prColor(p) + '"></i>' + p + '</span>';

function riskCell(t) {
  const r = risk(t);
  if (t.durum === "Tamamlandı") return '<span class="risk-meter"><span class="risk-score" style="color:var(--ink-400)">—</span></span>';
  return '<span class="risk-meter"><span class="risk-track"><span class="risk-fill" style="width:' + Math.max(4, r.skor) +
    '%;background:' + riskColor(r.skor) + '"></span></span><span class="risk-score" style="color:' + riskColor(r.skor) + '">' +
    String(r.skor).padStart(2, '0') + '</span></span>';
}

function terminCell(t) {
  const kalan = dayDiff(t.termin, iso(TODAY));
  let ek = '';
  if (t.durum !== "Tamamlandı") {
    if (kalan < 0) ek = '<span class="soon-pill danger">[GECİKTİ] ' + (-kalan) + ' gün geçti</span>';
    else if (kalan <= 3) ek = '<span class="soon-pill">[KRİTİK] ' + kalan + ' gün kaldı</span>';
  }
  return '<td class="tabular-date">' + fmt(t.termin) + ek + '</td>';
}

function taskRows(list, opts) {
  opts = opts || {};
  if (!list.length) return '<tr><td colspan="9"><div style="padding:40px 20px;text-align:center;color:var(--ink-400)"><b>Kayıt bulunmuyor</b><p style="margin-top:4px">Filtreleri gevşetip yeniden deneyin.</p></div></td></tr>';
  return list.map(t => {
    const u = t.sorumlu ? uIdx[t.sorumlu].ad : "Atanmamış";
    let yer = t.komisyon ? (kIdx[t.komisyon] || {}).ad : (t.birim === "__TUM__" ? "Tüm İller / Genel" : (bIdx[t.birim] || {}).il || "Genel");
    if (t.ortakGorev && t.ortakIller && t.ortakIller.length > 1) {
      const ilAdlari = t.ortakIller.map(bid => (bIdx[bid] || {}).il || bid.replace("il_", "")).join(" + ");
      yer = "Ortak Görev (" + ilAdlari + ")";
    }
    const koordTag = t.koordinatorluk ? ' · <span style="color:var(--astro-blue);font-weight:600">' + esc(t.koordinatorluk) + '</span>' : '';
    const ortakTag = t.ortakGorev ? ' · <span style="color:#4F46E5;font-weight:600">Ortak Görev</span>' : '';
    const tumTag = t.birim === "__TUM__" ? ' · <span style="color:#16A34A;font-weight:600">Tüm İller / Genel</span>' : '';

    return '<tr class="clickable" data-git="' + t.id + '">' +
      '<td class="task-title">' + esc(t.baslik) +
        '<small><b>' + esc(t.kategori) + '</b>' + koordTag + ortakTag + tumTag + ' · ' + esc(u) +
        ((t.ekler || []).length ? ' · ' + t.ekler.length + ' ek' : '') +
        ((t.yorumlar || []).some(y => y.tip === 'revizyon' && !y.cozuldu) ? ' · <span style="color:var(--astro-red);font-weight:600">Revizyon</span>' : '') +
        '</small></td>' +
      '<td class="tabular-date" style="font-size:12px">' + esc(yer) + '</td>' +
      terminCell(t) +
      (opts.oncelik === false ? '' : '<td>' + prPill(t.oncelik) + '</td>') +
      (opts.risk === false || rolum() === "egitmen" ? '' : '<td>' + riskCell(t) + '</td>') +
      '<td>' + stPill(t.durum) + '</td></tr>';
  }).join('');
}

function kpi(v, l, c) {
  return '<div class="kpi-card"><span class="kpi-card-value"' + (c ? ' style="color:' + c + '"' : '') + '>' + v +
    '</span><span class="kpi-card-label">' + l + '</span><span class="kpi-bar"><span style="background:' +
    (c || 'var(--astro-gradient)') + ';width:100%"></span></span></div>';
}

/* ══════════════════════════════════════════════════════════════════════
   GÖRÜNÜMLER (VIEWS)
   ══════════════════════════════════════════════════════════════════════ */

/* ── 1. GİRİŞ EKRANI ── */
function vGiris() {
  return '<div class="login-view">' +
    '<div class="login-card">' +
      '<img src="astro_logo.png" alt="ASTRO" class="login-logo">' +
      '<div class="login-tag">🚀 T3 VAKFI · DENEYAP KOORDİNATÖRLÜĞÜ</div>' +
      '<h1>DENEYAP Görev Takip ve Operasyon Sistemi</h1>' +
      '<p class="subtext">İl sorumlularına verilen görevleri tek merkezden izleyen, termin risklerini görünür kılan ve yapay zekâ ile desteklenen bütünleşik operasyon platformu.</p>' +
      '<div class="roles-grid">' +
      [["u1","01","Merkez Operasyon","Tüm Türkiye atölyelerine görev oluşturur, atar ve terminleri merkezden izler."],
       ["u4","02","İl Sorumlusu","Yalnızca kendi il ve atölyesini görür, ilerleme ve belgeleri merkeze sunar."],
       ["u16","03","Eğitmen","Kendi derslerini yürütür, haftalık yoklama alır ve malzeme talebi bildirir."],
       ["u2","04","Koordinatör","Geciken ve yüksek riskli görevleri izler, önceliklendirir ve eskalasyon yapar."],
       ["u3","05","Yetkili Yönetici","Tamamlanma oranlarını, bölgesel hazırlığı ve sezon raporlarını izler."]]
        .map(r => '<button class="role-card" data-login="' + r[0] + '">' +
          '<span class="role-badge">ROL ' + r[1] + '</span>' +
          '<span class="role-title">' + r[2] + '</span>' +
          '<span class="role-desc">' + r[3] + '</span></button>').join('') +
      '</div>' +
      '<div class="login-footer">' +
        '<span>Firnas Technologies tarafından T3 Vakfı Yapay Zekâ Creathonu için geliştirildi.</span>' +
      '</div>' +
    '</div></div>';
}

/* ── 2. PANO (DASHBOARD) ── */
function vPano() {
  const list = gorunur().filter(t => t.durum !== "Tamamlandı");
  const hepsi = gorunur();
  const gecikmis = hepsi.filter(t => t.durum === "Gecikti");
  const buHafta = list.filter(t => { const k = dayDiff(t.termin, iso(TODAY)); return k >= 0 && k <= 7; });
  const tamam = hepsi.filter(t => t.durum === "Tamamlandı");
  const oran = hepsi.length ? Math.round(tamam.length / hepsi.length * 100) : 0;
  const riskli = list.slice().sort((a, b) => risk(b).skor - risk(a).skor).slice(0, 7);

  const perf = BIRIM.map(b => {
    const g = hepsi.filter(t => t.birim === b.id);
    const c = g.filter(t => t.durum === "Tamamlandı").length;
    return { ad:b.il, pc:g.length ? Math.round(c / g.length * 100) : 0, n:g.length };
  }).filter(x => x.n).sort((a, b) => a.pc - b.pc).slice(0, 7);

  const u = me();
  const uAd = u ? u.ad.split(' ')[0] : "Kullanıcı";

  return page("Operasyon Yönetimi", "Operasyon Panosu",
    (rolum() === "merkez" ? '<button class="btn" data-go="olustur">' + ic("i-plus") + 'Görev oluştur</button>' : '') +
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Yapay Zekâya Sor</button>',
    '<div class="t3-welcome-banner">' +
      '<div>' +
        '<h2>Merhaba, ' + esc(uAd) + '</h2>' +
        '<p>' + fmtLong(iso(TODAY)) + ' · DENEYAP Operasyon & Görev Takip Panosu</p>' +
      '</div>' +
    '</div>' +
    '<div class="kpi-grid">' +
      kpi(hepsi.length, "Toplam Görev") +
      kpi(list.length, "Açık Görev", "var(--astro-blue)") +
      kpi(gecikmis.length, "Geciken Görev", "var(--astro-red)") +
      kpi(buHafta.length, "7 Gün İçinde Termin", "var(--astro-orange)") +
      kpi("%" + oran, "Tamamlanma Oranı", "#16A34A") +
    '</div>' +
    '<div class="grid g-2-1">' +
      '<div class="panel">' +
        '<div class="panel-header"><span>' + ic("i-alert") + ' Risk Sırasına Göre Öncelikli Görevler</span>' +
          '<span class="badge-count">' + list.length + ' kayıttan ilk ' + riskli.length + '\'i</span></div>' +
        '<div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>ATÖLYE</th><th>TERMİN</th><th>ÖNCELİK</th><th>RİSK</th><th>DURUM</th></tr></thead><tbody>' +
        taskRows(riskli) + '</tbody></table></div>' +
        '<div class="panel-footer"><span>Risk skoru; termin baskısı, atölye geçmişi, durgunluk ve ilerleme açığından hesaplanır.</span>' +
        '<a href="#" data-go="gorevler">Tümünü gör →</a></div></div>' +
      '<div class="panel">' +
        '<div class="panel-header"><span>' + ic("i-chart") + ' En Düşük Tamamlanma Oranı (Atölyeler)</span></div>' +
        '<div class="panel-body"><div class="bars-list">' +
        perf.map(p => '<div class="bar-item"><div><div class="bar-name">' + esc(p.ad) +
          '</div><div class="bar-track"><div class="bar-fill" style="width:' + p.pc + '%;background:' +
          (p.pc < 35 ? 'var(--astro-red)' : p.pc < 60 ? 'var(--astro-orange)' : '#16A34A') +
          '"></div></div></div><div class="bar-percent">%' + p.pc + '</div></div>').join('') +
        '</div></div></div>' +
    '</div>' +
    panoAltSira());
}

/* ── 3. GÖREVLER (TASK DIRECTORY & FILTERS) ── */
function filtrele(list) {
  const f = S.filt;
  return list.filter(t =>
    (!f.ulke || (bIdx[t.birim] || {}).ulke === f.ulke) &&
    (!f.bolge || bBolge(t.birim) === f.bolge) &&
    (!f.il || (bIdx[t.birim] || {}).il === f.il || (t.ortakIller && t.ortakIller.some(bid => (bIdx[bid] || {}).il === f.il))) &&
    (!f.birim || t.birim === f.birim || (t.ortakIller && t.ortakIller.includes(f.birim))) &&
    (!f.komisyon || t.komisyon === f.komisyon) &&
    (!f.koord || t.koordinatorluk === f.koord) &&
    (!f.durum || t.durum === f.durum) &&
    (!f.oncelik || t.oncelik === f.oncelik) &&
    (!f.kat || t.kategori === f.kat) &&
    (!f.q || (t.baslik + " " + (bIdx[t.birim] || {}).il + " " + (t.koordinatorluk || "") + " " + t.id).toLowerCase().includes(f.q.toLowerCase()))
  );
}

const gelismisSayac = () => ["ulke","bolge","il","birim","komisyon","koord"].filter(k => S.filt[k]).length;

function katSerit(kapsam) {
  const acik = kapsam.filter(t => t.durum !== "Tamamlandı");
  const say = k => acik.filter(t => t.kategori === k).length;
  const gec = k => acik.filter(t => t.kategori === k && t.durum === "Gecikti").length;
  return '<div class="tab-pills">' +
    '<button class="tab-pill' + (S.filt.kat ? "" : " on") + '" data-katf="">Tüm Kategoriler <b>' + acik.length + '</b></button>' +
    KAT.map(k => '<button class="tab-pill' + (S.filt.kat === k ? " on" : "") + '" data-katf="' + esc(k) + '">' +
      esc(k) + ' <b' + (gec(k) ? ' style="background:var(--astro-red);color:#fff"' : '') + '>' + say(k) +
      '</b></button>').join('') + '</div>';
}

function filtreBar(opts) {
  opts = opts || {};
  const f = S.filt;
  const sec = (v, x, ad) => '<option value="' + esc(x) + '"' + (x === v ? " selected" : "") + '>' + esc(ad || x) + '</option>';
  const opt = (arr, v) => '<option value="">Tümü</option>' + arr.map(x => sec(v, x)).join('');
  const atolyeli = atolyeliIller();
  const ilListe = f.bolge ? ILLER.filter(x => x.bolge === f.bolge) : ILLER;
  const ilVar = ilListe.filter(x => atolyeli.includes(x.ad));
  const ilYok = ilListe.filter(x => !atolyeli.includes(x.ad));
  const birimListe = BIRIM.filter(b => (!f.ulke || b.ulke === f.ulke) && (!f.bolge || b.bolge === f.bolge) && (!f.il || b.il === f.il));

  return '<div class="filter-bar">' +
    '<div class="form-group"><label>DURUM</label><select data-f="durum">' +
      opt(["Bekliyor","Devam Ediyor","Tamamlandı","Gecikti"], f.durum) + '</select></div>' +
    '<div class="form-group"><label>ÖNCELİK</label><select data-f="oncelik">' + opt(ONCELIK, f.oncelik) + '</select></div>' +
    '<div class="form-group" style="min-width:200px"><label>KOORDİNATÖRLÜK</label><select data-f="koord">' +
      opt(KOORDINATORLUK, f.koord) + '</select></div>' +
    '<div class="form-group" style="flex:1;min-width:180px"><label>ARAMA</label><input type="text" data-f="q" value="' +
      esc(f.q) + '" placeholder="Görev adı, il veya kod ara..."></div>' +
    '<button class="btn ghost sm" data-gelismis="1">' + ic("i-list") + 'Gelişmiş Filtreler' +
      (gelismisSayac() ? " (" + gelismisSayac() + ")" : "") + '</button>' +
    '<button class="btn ghost sm" data-clear="1">Temizle</button>' +
    (opts.aktar === false ? '' : '<button class="btn ghost sm" data-aktar="gorev">' + ic("i-down") + 'Excel / PDF</button>') +
    (S.gelismis || gelismisSayac() ?
      '<div style="display:flex;width:100%;gap:10px;flex-wrap:wrap;padding:12px 14px;background:#FFFFFF;border:1px dashed var(--card-border);border-radius:var(--radius-sm);margin-top:6px">' +
        '<div class="form-group" style="min-width:140px"><label>ÜLKE</label><select data-f="ulke">' + opt(ULKELER, f.ulke) + '</select></div>' +
        '<div class="form-group"><label>BÖLGE</label><select data-f="bolge">' + opt(BOLGE, f.bolge) + '</select></div>' +
        '<div class="form-group" style="min-width:160px"><label>İL (81 İL & ULUSLARARASI)</label><select data-f="il">' +
          '<option value="">Tümü</option>' +
          (ilVar.length ? '<optgroup label="Atölyesi Olan İller">' + ilVar.map(x => sec(f.il, x.ad)).join('') + '</optgroup>' : '') +
          (ilYok.length ? '<optgroup label="Planlanan İller">' + ilYok.map(x => sec(f.il, x.ad)).join('') + '</optgroup>' : '') +
        '</select></div>' +
        '<div class="form-group" style="min-width:210px"><label>ATÖLYE</label><select data-f="birim">' +
          '<option value="">Tümü</option>' +
          birimListe.map(b => sec(f.birim, b.id, b.il + " / " + b.ad)).join('') + '</select></div>' +
        '<div class="form-group" style="min-width:220px"><label>KOORDİNATÖRLÜK</label><select data-f="koord">' +
          opt(KOORDINATORLUK, f.koord) + '</select></div>' +
        '<div class="form-group" style="min-width:220px"><label>KOMİSYON</label><select data-f="komisyon">' +
          '<option value="">Tümü</option>' +
          KOMISYON.map(k => sec(f.komisyon, k.id, k.ad)).join('') + '</select></div>' +
      '</div>' : '') +
    '</div>';
}

function vGorevler() {
  const list = filtrele(gorunur()).sort((a, b) => risk(b).skor - risk(a).skor);
  return page("Operasyon", "Tüm Görevler",
    (rolum() === "merkez" ? '<button class="btn" data-go="olustur">' + ic("i-plus") + 'Görev oluştur</button>' : '') +
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    katSerit(gorunur()) +
    filtreBar() +
    '<div class="panel"><div class="panel-header"><span>Görev Listesi</span><span class="badge-count">' +
      list.length + ' kayıt</span></div>' +
      '<div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>ATÖLYE / KOMİSYON</th><th>TERMİN</th><th>ÖNCELİK</th><th>RİSK</th><th>DURUM</th></tr></thead><tbody>' +
      taskRows(list) + '</tbody></table></div>' +
      '<div class="panel-footer"><span>Toplam ' + gorunur().length + ' kayıttan ' + list.length +
      ' tanesi listeleniyor.</span><span>Bir satıra tıklayarak detay ve kontrol listesini açabilirsiniz.</span></div></div>');
}

/* ── 4. GECİKME VE ESKALASYON PANELİ ── */
function vGecikme() {
  const acik = gorunur().filter(t => t.durum !== "Tamamlandı");
  const setler = {
    tumu:{ ad:"Tümü", l:acik },
    gecikmis:{ ad:"Gecikenler", l:acik.filter(t => t.durum === "Gecikti") },
    yuksek:{ ad:"Yüksek Risk (>=66)", l:acik.filter(t => risk(t).skor >= 66) },
    hafta:{ ad:"7 Gün İçinde Termin", l:acik.filter(t => { const k = dayDiff(t.termin, iso(TODAY)); return k >= 0 && k <= 7; }) }
  };
  const aktif = setler[S.sekme] ? S.sekme : "yuksek";
  const list = setler[aktif].l.slice().sort((a, b) => risk(b).skor - risk(a).skor);
  const sec = S.gorevId ? TASKS.find(t => t.id === S.gorevId) : list[0];

  return page("Eskalasyon Radarı", "Gecikme & Risk Paneli",
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Yapay Zekâya Sor</button>',
    '<div class="tab-pills">' + Object.keys(setler).map(k =>
      '<button class="tab-pill' + (k === aktif ? " on" : "") + '" data-sekme="' + k + '">' +
      setler[k].ad + ' <b>' + setler[k].l.length + '</b></button>').join('') + '</div>' +
    katSerit(acik) +
    filtreBar() +
    '<div class="grid g-2-1">' +
      '<div class="panel"><div class="panel-header"><span>Gecikme & Risk Sıralı Liste</span><span class="badge-count">' + list.length + ' kayıt</span></div>' +
        '<div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>BİRİM</th><th>TERMİN</th><th>ÖNCELİK</th><th>RİSK</th><th>DURUM</th></tr></thead><tbody>' +
        taskRows(filtrele(list)) + '</tbody></table></div>' +
        '<div class="panel-footer"><span>Bir satıra tıklayarak sağ panelde yapay zekâ analizini ve aksiyon önerilerini inceleyin.</span></div></div>' +
      '<div>' + (sec ? riskKart(sec) : '<div class="panel"><div class="panel-body" style="text-align:center;color:var(--ink-400)"><b>Görev seçilmedi</b></div></div>') + '</div>' +
    '</div>');
}

function riskKart(t) {
  const r = risk(t);
  return '<div class="panel"><div class="panel-header"><span>' + ic("i-wand") + ' Risk Analizi ve Gerekçesi</span><span class="badge-count">' + t.id + '</span></div>' +
    '<div class="panel-body">' +
    '<div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink-900);line-height:1.3;margin-bottom:4px">' + esc(t.baslik) + '</div>' +
    '<div style="font-size:12px;color:var(--ink-500);margin-bottom:14px">' + esc(bLabel(t.birim)) +
      (t.sorumlu ? " · " + esc(uIdx[t.sorumlu].ad) : "") + '</div>' +
    '<div class="ai-card">' +
      oneri('<span class="ai-tag">' + ic("i-wand") + 'YAPAY ZEKÂ RİSK DEĞERLENDİRMESİ</span>') +
      '<div style="display:flex;align-items:flex-end;gap:8px">' +
        '<span class="ai-score-big" style="color:' + riskColor(r.skor) + '">' + r.skor + '</span>' +
        '<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500);padding-bottom:6px">/ 100 Risk Skoru</span></div>' +
      (r.sebep.length ? '<p>' + r.sebep.map(s => esc(s.s)).join(' ') + '</p>'
        : '<p>Belirgin bir risk sinyali tespit edilmedi; görev planına uygun ilerliyor.</p>') +
      oneri(r.aksiyon ? '<div class="ai-rec-box"><h5>Önerilen Aksiyon</h5><p style="margin:0;font-size:12.5px">' + esc(r.aksiyon) + '</p></div>' : '') +
      '<div class="ai-card-actions">' +
        '<button class="btn sm" data-hatirlat="' + t.id + '">' + ic("i-bell") + 'Hatırlatma Gönder</button>' +
        '<button class="btn ghost sm" data-otele="' + t.id + '">' + ic("i-clock") + 'Termini 3 Gün Ötele</button>' +
        '<button class="btn ghost sm" data-git="' + t.id + '">Görevi Aç</button>' +
      '</div></div>' +
    '<dl style="display:grid;grid-template-columns:110px 1fr;gap:8px 12px;font-size:12.5px;margin-top:16px">' +
      '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">DURUM</dt><dd>' + stPill(t.durum) + '</dd>' +
      '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">TERMİN</dt><dd class="tabular-date">' + fmtLong(t.termin) + (r.kalan < 0 ? ' · ' + (-r.kalan) + ' gün geçti' : ' · ' + r.kalan + ' gün kaldı') + '</dd>' +
      '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">İLERLEME</dt><dd>%' + t.yuzde + ' (Beklenen %' + r.beklenen + ')</dd>' +
      '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">GÜNCELLEME</dt><dd>' + t.sonGun + ' gün önce</dd>' +
      '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">ATÖLYE GEÇMİŞİ</dt><dd>Ortalama ' + bIdx[t.birim].gecmis.toFixed(1).replace('.', ',') + ' gün gecikme</dd>' +
    '</dl></div></div>';
}

/* ── 5. BENİM GÖREVLERİM ── */
function vBenim() {
  const u = me();
  const rolAd = u.rol === "egitmen" ? "Eğitmen Görevlerim" : "Haftalık Sorumluluklarım";
  const list = gorunur().filter(t => t.durum !== "Tamamlandı")
    .sort((a, b) => D(a.termin) - D(b.termin));
  const tamam = gorunur().filter(t => t.durum === "Tamamlandı");

  return page(bIdx[u.birim].il + " / " + bIdx[u.birim].ad + (u.rol === "egitmen" ? " · EĞİTMEN" : " · İL SORUMLUSU"), rolAd,
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    ipucu(u.rol === "egitmen"
      ? "Yalnızca size atanan görevleri görüyorsunuz. Kontrol listesindeki adımları işaretledikçe ilerleme kendiliğinden hesaplanır."
      : "Yalnızca kendi biriminize atanan görevleri görüyorsunuz. Termine göre sıralıdır; en üstteki görev en acil olanıdır.") +
    '<div style="max-width:1120px">' +
    (list.length ? list.map(t => {
      const kalan = dayDiff(t.termin, iso(TODAY));
      const gecti = kalan < 0;
      const renk = gecti ? "var(--astro-red)" : kalan <= 3 ? "var(--astro-orange)" : t.durum === "Devam Ediyor" ? "var(--astro-blue)" : "#CBD5E1";
      return '<div class="panel" style="margin-bottom:12px"><div class="panel-body" style="display:flex;gap:14px;align-items:flex-start">' +
        '<i style="width:5px;align-self:stretch;border-radius:3px;background:' + renk + ';flex-shrink:0"></i>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink-900);line-height:1.3">' + esc(t.baslik) + '</div>' +
          '<div style="font-size:12px;color:var(--ink-500);margin-top:3px">' + esc(t.kategori) + ' · ' + t.id +
            ' · Termin ' + fmtLong(t.termin) +
            (gecti ? ' · <span style="color:var(--astro-red);font-weight:600">🔥 ' + (-kalan) + ' gün gecikti</span>'
                   : kalan <= 3 ? ' · <span style="color:var(--astro-orange);font-weight:600">⚠️ ' + kalan + ' gün kaldı</span>' : '') +
          '</div>' +
          '<div style="margin-top:10px;display:flex;gap:9px;align-items:center;flex-wrap:wrap">' + stPill(t.durum) +
            '<span class="priority-pill" style="font-size:11px">İlerleme %' + adimYuzde(t) + '</span>' +
            '<span class="priority-pill" style="font-size:11px">' + ic("i-check") + ' ' +
              (t.adimlar || []).filter(a => a.tamam).length + ' / ' + (t.adimlar || []).length + ' adım</span></div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:7px;align-items:flex-end;flex-shrink:0">' +
          '<select data-durum="' + t.id + '" style="width:auto;min-width:138px">' +
            ["Bekliyor","Devam Ediyor","Tamamlandı"].map(d =>
              '<option' + (d === t.durum ? " selected" : "") + '>' + d + '</option>').join('') + '</select>' +
          '<button class="btn ghost sm" data-git="' + t.id + '">Kontrol Listesi & Ekler</button>' +
          '<button class="btn ghost sm" data-not="' + t.id + '">Not Ekle</button>' +
        '</div></div></div>';
    }).join('')
      : '<div class="panel"><div class="panel-body" style="text-align:center;padding:40px 20px;color:var(--ink-500)"><b>Tebrikler! Tüm görevler tamamlandı.</b></div></div>') +
    '</div>' +
    (tamam.length ? '<div class="panel" style="margin-top:20px"><div class="panel-header"><span>Tamamlanan Görevler</span><span class="badge-count">' +
      tamam.length + '</span></div><div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>BİRİM</th><th>TERMİN</th>' + (rolum() === "egitmen" ? '' : '<th>RİSK</th>') + '<th>DURUM</th></tr></thead><tbody>' +
      taskRows(tamam, { oncelik:false }) + '</tbody></table></div></div>' : ''));
}

/* ── 6. GÖREV DETAY ── */
function vGorev() {
  const t = TASKS.find(x => x.id === S.gorevId);
  if (!t) return page("Operasyon", "Görev Bulunamadı", "", "");
  const kimAd = k => k === "sistem" ? "ASTRO" : (uIdx[k] ? uIdx[k].ad : "—");

  return page(t.id, t.baslik,
    '<button class="btn ghost" data-go="' + (rolum() === "il" ? "benim" : rolum() === "koord" ? "gecikme" : "gorevler") + '">← Listeye dön</button>',
    '<div class="grid g-2-1">' +
      '<div>' +
        '<div class="panel"><div class="panel-header"><span>Görev Bilgileri</span>' + stPill(t.durum) + '</div><div class="panel-body">' +
          '<dl style="display:grid;grid-template-columns:120px 1fr;gap:8px 12px;font-size:13px">' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">BİRİM</dt><dd>' + esc(bLabel(t.birim)) + '</dd>' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">SORUMLU</dt><dd>' + (t.sorumlu ? esc(uIdx[t.sorumlu].ad) : "—") + '</dd>' +
            (t.koordinatorluk ? '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">KOORDİNATÖRLÜK</dt><dd><span style="color:var(--astro-blue);font-weight:600">' + esc(t.koordinatorluk) + '</span></dd>' : '') +
            (t.ortakGorev && t.ortakIller ? '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">ORTAK İLLER</dt><dd><span style="color:#4F46E5;font-weight:600">🤝 Ortak Görev: ' + t.ortakIller.map(bid => (bIdx[bid] || {}).il || bid).join(" & ") + '</span></dd>' : '') +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">KATEGORİ</dt><dd>' + esc(t.kategori) + '</dd>' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">ÖNCELİK</dt><dd>' + prPill(t.oncelik) + '</dd>' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">TERMİN</dt><dd class="tabular-date">' + fmtLong(t.termin) + '</dd>' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">OLUŞTURULMA</dt><dd>' + fmtLong(t.olusturma) + ' · ' + esc(uIdx[t.olusturan].ad) + '</dd>' +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">İLERLEME</dt><dd>%' + t.yuzde + '</dd>' +
            (t.komisyon ? '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">KOMİSYON</dt><dd>' + esc(komAd(t)) + '</dd>' : '') +
            '<dt style="font-family:var(--font-mono);font-size:10px;color:var(--ink-500)">KAYNAK</dt><dd>' + ({ ai:"Görev Ayrıştırıcı (AI)", envanter:"Envanter Modülü (Otomatik)",
              sayim:"Periyodik Sayım Motoru", fazanaliz:"Faz Hazırlık Analizi (AI)",
              komisyon:"Komisyon Planı" }[t.kaynak] || "Manuel Oluşturma") + '</dd>' +
          '</dl></div></div>' +
        adimPanel(t).replace('<div class="panel">', '<div class="panel" style="margin-top:16px">') +
        '<div class="panel" style="margin-top:16px"><div class="panel-header"><span>' + ic("i-clock") + ' Güncelleme Geçmişi</span><span class="badge-count">' +
          t.log.length + ' kayıt</span></div><div class="panel-body">' +
          '<div style="display:flex;flex-direction:column;gap:12px">' +
          t.log.slice().reverse().map(l => {
            const isLate = l.yeni === "Gecikti";
            const isDone = l.yeni === "Tamamlandı";
            return '<div style="display:flex;gap:10px;align-items:flex-start">' +
              '<span style="width:8px;height:8px;border-radius:50%;margin-top:5px;background:' + (isLate ? 'var(--astro-red)' : isDone ? '#16A34A' : 'var(--astro-blue)') + '"></span>' +
              '<div><div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ink-500)">' + fmtLong(l.tarih) + ' · ' + esc(kimAd(l.kim)) + '</div>' +
              '<div style="font-weight:600;font-size:13px;color:var(--ink-900)">' +
                (l.tip === "olusturma" ? "Görev oluşturuldu"
                 : l.tip === "not" ? "İlerleme notu eklendi"
                 : l.tip === "otele" ? "Termin ötelendi"
                 : esc(l.eski) + " → " + esc(l.yeni)) + '</div>' +
              (l.not ? '<div style="font-size:12.5px;color:var(--ink-600);margin-top:2px">' + esc(l.not) + '</div>' : '') +
              '</div></div>';
          }).join('') + '</div>' +
          (rolum() === "il" || rolum() === "merkez"
            ? '<div style="margin-top:16px;display:flex;gap:8px"><input type="text" id="notInp" placeholder="Bu göreve ilerleme notu ekleyin...">' +
              '<button class="btn sm" data-notekle="' + t.id + '">Ekle</button></div>' : '') +
          '</div></div>' +
      '</div>' +
      '<div>' + (rolum() === "egitmen" ? "" : riskKart(t)) + ekPanel(t) + yorumPanel(t) + '</div>' +
    '</div>');
}

/* ── 7. YENİ GÖREV OLUŞTURMA & KADEMELİ LOKASYON FİLTRESİ ── */
window.guncelleKademeliFiltre = function(tip) {
  const selU = document.getElementById("c_ulke");
  const selI = document.getElementById("c_il_sec");
  const selB = document.getElementById("c_b");
  if (!selU || !selI || !selB) return;

  const uVal = selU.value;
  const iVal = selI.value;

  if (tip === 'ulke') {
    let ilHtml = '<option value="__TUM__">' + (uVal ? '[' + esc(uVal) + '\'deki Tüm İller / Genel Kapsam]' : '[Tüm İller / Genel Kapsam]') + '</option>';
    const ilList = uVal ? ILLER.filter(x => x.ulke === uVal) : ILLER;
    ilHtml += ilList.map(x => '<option value="' + esc(x.ad) + '">' + esc(x.ad) + (uVal ? '' : ' (' + esc(x.ulke) + ')') + '</option>').join('');
    selI.innerHTML = ilHtml;
    selI.value = "__TUM__";

    guncelleKademeliFiltre('il');
  } else if (tip === 'il') {
    let bHtml = '';
    let bList = BIRIM;
    if (iVal && iVal !== "__TUM__") {
      bList = BIRIM.filter(b => b.il === iVal);
      bHtml += '<option value="__TUM_IL__">[' + esc(iVal) + '\'deki Tüm Atölyeler (' + bList.length + ' Atölye)]</option>';
    } else if (uVal) {
      bList = BIRIM.filter(b => b.ulke === uVal);
      bHtml += '<option value="__TUM__">[' + esc(uVal) + '\'deki Tüm Atölyelere Atansın (' + bList.length + ' Atölye)]</option>';
    } else {
      bHtml += '<option value="__TUM__">[Tüm Atölyelere Atansın (' + BIRIM.length + ' Atölye)]</option>';
    }

    bHtml += bList.map(b => '<option value="' + b.id + '">' + esc(b.il) + ' / ' + esc(b.ad) + '</option>').join('');
    selB.innerHTML = bHtml;
    selB.value = (iVal && iVal !== "__TUM__") ? "__TUM_IL__" : "__TUM__";
  }
};

function vOlustur() {
  return page("Operasyon", "Yeni Görev Oluştur",
    '<button class="btn ghost" data-go="ayristirici">' + ic("i-wand") + 'Metinden Otomatik Ayrıştır (AI)</button>',
    ipucu("Görev oluşturulduğunda ilgili il sorumlularına, koordinatörlüklere ve operasyon ekibine anlık bildirim iletilir.") +
    '<div class="g-create">' +
      '<div>' +
        '<div class="panel">' +
          '<div class="panel-header"><span>' + ic("i-plus") + ' Görev Tanımlama ve Kapsam Bilgileri</span></div>' +
          '<div class="panel-body">' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">' +
              '<div class="form-group wide"><label>' + ic("i-list") + ' GÖREV BAŞLIĞI</label><input type="text" id="c_t" placeholder="Örn. Atölye envanter sayımı ve eksik malzeme bildirimi"></div>' +
              '<div class="form-group wide"><label>' + ic("i-file") + ' AÇIKLAMA VEYA GÖREV TALİMATI</label><textarea id="c_d" placeholder="Görev kapsamı, detaylı uygulama talimatları ve beklenen çıktılar..."></textarea></div>' +
              
              '<div class="form-group"><label>' + ic("i-user") + ' 1. ÜLKE SEÇİMİ</label>' +
                '<select id="c_ulke" onchange="guncelleKademeliFiltre(\'ulke\')">' +
                  '<option value="">Tüm Ülkeler (Uluslararası Kapsam)</option>' +
                  ULKELER.map(u => '<option value="' + esc(u) + '">' + esc(u) + '</option>').join('') +
                '</select>' +
              '</div>' +

              '<div class="form-group"><label>' + ic("i-user") + ' 2. İL KAPSAMI SEÇİMİ</label>' +
                '<select id="c_il_sec" onchange="guncelleKademeliFiltre(\'il\')">' +
                  '<option value="__TUM__">[Tüm İller / Genel Kapsam]</option>' +
                  '<optgroup label="Türkiye (81 İl)">' +
                    ILLER.filter(x => x.ulke === "Türkiye").map(x => '<option value="' + esc(x.ad) + '">' + esc(x.ad) + '</option>').join('') +
                  '</optgroup>' +
                  '<optgroup label="Uluslararası İller / Merkezler">' +
                    ILLER.filter(x => x.ulke !== "Türkiye").map(x => '<option value="' + esc(x.ad) + '">' + esc(x.ad) + ' (' + esc(x.ulke) + ')</option>').join('') +
                  '</optgroup>' +
                '</select>' +
              '</div>' +

              '<div class="form-group"><label>' + ic("i-box") + ' 3. DENEYAP ATÖLYESİ (BİRİM)</label>' +
                '<select id="c_b">' +
                  '<option value="__TUM__">[Tüm Atölyelere Atansın (' + BIRIM.length + ' Atölye)]</option>' +
                  BIRIM.map(b => '<option value="' + b.id + '">' + esc(b.il) + ' / ' + esc(b.ad) + '</option>').join('') +
                '</select>' +
              '</div>' +

              '<div class="form-group"><label>' + ic("i-user") + ' KOORDİNATÖRLÜK</label>' +
                '<select id="c_koord">' +
                  '<option value="">— Genel Operasyon —</option>' +
                  KOORDINATORLUK.map(k => '<option value="' + esc(k) + '">' + esc(k) + '</option>').join('') +
                '</select>' +
              '</div>' +

              '<div class="form-group"><label>' + ic("i-grid") + ' KATEGORİ</label>' +
                '<select id="c_k">' + KAT.map(k => '<option value="' + esc(k) + '">' + esc(k) + '</option>').join('') + '</select>' +
              '</div>' +

              '<div class="form-group"><label>' + ic("i-alert") + ' ÖNCELİK SEVİYESİ</label>' +
                '<select id="c_o">' + ONCELIK.map(o => '<option' + (o === "Normal" ? " selected" : "") + ' value="' + esc(o) + '">' + esc(o) + '</option>').join('') + '</select>' +
              '</div>' +

              '<div class="form-group wide"><label>' + ic("i-clock") + ' TERMİN TARİHİ</label><input type="date" id="c_v" value="' +
                iso(new Date(TODAY.getTime() + 10 * 864e5)) + '" style="max-width:280px"></div>' +

              '<!-- Doküman ve Harici Bağlantı Ekleme Paneli -->' +
              '<div class="form-group wide" style="background:#F8FAFC;padding:18px;border:1.5px solid #CBD5E1;border-radius:var(--radius-sm);margin-top:6px">' +
                '<label style="font-weight:800;color:#0F172A;font-size:13.5px;display:inline-flex;align-items:center;gap:8px;margin-bottom:12px">' +
                  ic("i-file") + ' DOKÜMAN & REHBER BAĞLANTISI EKLE (OPSİYONEL)' +
                '</label>' +
                '<div style="display:grid;grid-template-columns:1.2fr 140px 1.5fr;gap:12px">' +
                  '<div>' +
                    '<label style="font-size:11.5px;color:#475569;font-weight:700">DOKÜMAN / BAĞLANTI BAŞLIĞI</label>' +
                    '<input type="text" id="c_ek_ad" placeholder="Örn. Sınav Uygulama Rehberi PDF">' +
                  '</div>' +
                  '<div>' +
                    '<label style="font-size:11.5px;color:#475569;font-weight:700">FORMAT / TÜR</label>' +
                    '<select id="c_ek_tur">' +
                      '<option value="pdf">PDF Dokümanı</option>' +
                      '<option value="gorsel">Görsel (PNG/JPG)</option>' +
                      '<option value="link">Harici Web URL</option>' +
                      '<option value="tablo">Excel / Tablo</option>' +
                    '</select>' +
                  '</div>' +
                  '<div>' +
                    '<label style="font-size:11.5px;color:#475569;font-weight:700">DOSYA YOLU VEYA HARİCİ URL LINK</label>' +
                    '<input type="text" id="c_ek_url" placeholder="https://deneyapturkiye.org/docs/rehber.pdf">' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- Ortak Görev Bölümü -->' +
              '<div class="form-group wide" style="background:#F8FAFC;padding:18px;border:1.5px solid #CBD5E1;border-radius:var(--radius-sm);margin-top:6px">' +
                '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-weight:800;color:#0F172A;font-size:13.5px">' +
                  '<input type="checkbox" id="c_ortak_check" style="width:18px;height:18px" onchange="document.getElementById(\'ortak_alan\').style.display=this.checked?\'block\':\'none\'">' +
                  ic("i-user") + ' Ortak Görev Tanımla (Çoklu İl / Atölye Sorumluluğu)' +
                '</label>' +
                '<div id="ortak_alan" style="display:none;margin-top:12px">' +
                  '<p style="font-size:12.5px;color:#475569;margin-bottom:10px;font-weight:600">Bu görevi birlikte tamamlayacak 2. ve 3. DENEYAP Atölyesini seçin:</p>' +
                  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                    '<div><label style="font-size:11.5px;color:#475569;font-weight:700">2. ORTAK ATÖLYE</label><select id="c_ortak_b1">' +
                      '<option value="">— Ortak Atölye Seçin —</option>' +
                      BIRIM.map(b => '<option value="' + b.id + '">' + esc(b.il) + ' / ' + esc(b.ad) + ' (' + esc(b.ulke) + ')</option>').join('') +
                    '</select></div>' +
                    '<div><label style="font-size:11.5px;color:#475569;font-weight:700">3. ORTAK ATÖLYE (OPSİYONEL)</label><select id="c_ortak_b2">' +
                      '<option value="">— Yok —</option>' +
                      BIRIM.map(b => '<option value="' + b.id + '">' + esc(b.il) + ' / ' + esc(b.ad) + ' (' + esc(b.ulke) + ')</option>').join('') +
                    '</select></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div class="form-group wide" style="flex-direction:row;gap:12px;margin-top:12px">' +
                '<button class="btn" data-create="1">' + ic("i-plus") + 'Görevi Kaydet ve Yayınla</button>' +
                '<button class="btn ghost" data-go="gorevler">İptal</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div>' +
        '<!-- Standart Görev Şablonları -->' +
        '<div class="panel" style="margin-bottom:18px">' +
          '<div class="panel-header"><span>' + ic("i-wand") + ' Standart Şablonlar</span></div>' +
          '<div class="panel-body" style="padding:16px">' +
            '<p style="font-size:12px;color:#475569;margin-bottom:12px;font-weight:600">Formu otomatik doldurun:</p>' +
            '<div style="display:flex;flex-direction:column;gap:8px">' +
              '<button class="btn ghost sm" style="justify-content:flex-start;text-align:left;padding:8px 12px;font-weight:700;font-size:11.5px" data-sablon="envanter">' +
                ic("i-box") + ' Atölye Envanter Sayımı' +
              '</button>' +
              '<button class="btn ghost sm" style="justify-content:flex-start;text-align:left;padding:8px 12px;font-weight:700;font-size:11.5px" data-sablon="guvenlik">' +
                ic("i-alert") + ' Fiziki Güvenlik Kontrolü' +
              '</button>' +
              '<button class="btn ghost sm" style="justify-content:flex-start;text-align:left;padding:8px 12px;font-weight:700;font-size:11.5px" data-sablon="sinav">' +
                ic("i-check") + ' Sınav Hazırlığı & Gözetmen' +
              '</button>' +
              '<button class="btn ghost sm" style="justify-content:flex-start;text-align:left;padding:8px 12px;font-weight:700;font-size:11.5px" data-sablon="sezon">' +
                ic("i-grid") + ' Sezon Açılışı & Müfredat' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- AI Asistan Hızlı Kısayol -->' +
        '<div class="panel" style="background:linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);border:1px solid #7DD3FC">' +
          '<div class="panel-body" style="display:flex;flex-direction:column;gap:8px;text-align:center;align-items:center;padding:16px">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:#0284C7;color:#fff;display:grid;place-items:center;box-shadow:0 3px 8px rgba(2,132,199,0.25)">' +
              ic("i-wand") +
            '</div>' +
            '<div style="font-weight:800;font-size:13.5px;color:#0369A1">Serbest Metinden Üretin</div>' +
            '<p style="font-size:11.5px;color:#0369A1;margin:0;line-height:1.4">Toplantı notu yapıştırarak görevi otomatik oluşturun.</p>' +
            '<button class="btn sm" data-go="ayristirici" style="background:#0284C7;margin-top:2px;font-size:11.5px">' + ic("i-wand") + 'Metin Ayrıştırıcı' + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>');
}

/* ── 8. YAPAY ZEKÂ GÖREV AYRIŞTIRICI ── */
const ORNEK = `Bugünkü koordinasyon toplantısı notları:
– Şanlıurfa ve Van'da envanter sayımı bu hafta kapanmalı, en geç cuma.
– Diyarbakır'da uygulama sınavı için gözetmen listesi eksik, Sema'dan bekliyoruz, 29'una kadar.
– Trabzon veli toplantısını eylülün ilk haftasına aldı, salon teyidi lazım.
– Konya KART stoğunu teyit etti, kapatabiliriz.
– Yeni eğitmen sözleşmelerinin taranıp yüklenmesi acil, 2 Eylül son gün.
– Bütün birimlerde ağustos faaliyet raporu 5 Eylül'e kadar merkeze gelecek.`;

function trLower(s) { return s.toLocaleLowerCase("tr-TR"); }

function tarihBul(satir) {
  const s = trLower(satir);
  const gunler = { pazartesi:1, salı:2, çarşamba:3, perşembe:4, cuma:5, cumartesi:6, pazar:0 };
  const aylar = { ocak:0, şubat:1, mart:2, nisan:3, mayıs:4, haziran:5, temmuz:6, ağustos:7, eylül:8, ekim:9, kasım:10, aralık:11 };

  let m = s.match(/(\d{1,2})\s*(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/);
  if (m) {
    const y = TODAY.getFullYear() + (aylar[m[2]] < TODAY.getMonth() ? 1 : 0);
    return { d:iso(new Date(y, aylar[m[2]], +m[1])), kesin:true };
  }
  m = s.match(/(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)[a-zçğıöşü']*\s+(ilk|ikinci|son)\s+haft/);
  if (m) {
    const ay = aylar[m[1]], y = TODAY.getFullYear() + (ay < TODAY.getMonth() ? 1 : 0);
    const gun = m[2] === "ilk" ? 4 : m[2] === "ikinci" ? 11 : 25;
    return { d:iso(new Date(y, ay, gun)), kesin:false };
  }
  m = s.match(/(\d{1,2})['’]?\s*(?:una|üne|ine|ına|nda|nde)?\s*kadar/);
  if (m) {
    const g = +m[1];
    let ay = TODAY.getMonth(), y = TODAY.getFullYear();
    if (g < TODAY.getDate()) { ay++; if (ay > 11) { ay = 0; y++; } }
    return { d:iso(new Date(y, ay, g)), kesin:true };
  }
  for (const g in gunler) {
    if (s.includes(g)) {
      const hedef = gunler[g], bugun = TODAY.getDay();
      let ek = (hedef - bugun + 7) % 7; if (ek === 0) ek = 7;
      return { d:iso(new Date(TODAY.getTime() + ek * 864e5)), kesin:true };
    }
  }
  if (/bu hafta/.test(s)) {
    let ek = (5 - TODAY.getDay() + 7) % 7; if (ek === 0) ek = 7;
    return { d:iso(new Date(TODAY.getTime() + ek * 864e5)), kesin:false };
  }
  return { d:iso(new Date(TODAY.getTime() + 7 * 864e5)), kesin:false };
}

function ayristir(metin) {
  const satirlar = metin.split(/\n+/).map(x => x.trim())
    .filter(x => x.length > 12 && (/^[–\-•*·]|^\d+[.)]/.test(x) || (x.length > 18 && !/notları:?$/i.test(x))));
  const cikan = [];
  satirlar.forEach(raw => {
    const satir = raw.replace(/^[–\-•*·]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
    const s = trLower(satir);
    if (/notları:?$/.test(s) || s.length < 12) return;
    if (/(kapatabiliriz|tamamland|teyit etti|bitti|hallettik)/.test(s)) return;

    const bulunan = BIRIM.filter(b => s.includes(trLower(b.il)));
    const tumu = /(bütün|tüm)\s+(birim|il|atölye)/.test(s);

    let en = null, enSkor = 0;
    KATALOG.forEach(c => {
      let sk = 0;
      c.kw.forEach(k => { if (s.includes(k)) sk++; });
      if (sk > enSkor) { enSkor = sk; en = c; }
    });
    const baslik = enSkor >= 1 ? en.t : satir.charAt(0).toLocaleUpperCase("tr-TR") + satir.slice(1);
    const kategori = enSkor >= 1 ? KAT[en.k] : "Atölye Operasyonu";

    const tr = tarihBul(satir);
    const oncelik = /(acil|kritik|en geç|son gün|gecik)/.test(s) ? "Yüksek" : "Normal";

    const hedefler = tumu ? BIRIM.map(b => b.id) : bulunan.map(b => b.id);
    if (!hedefler.length) {
      cikan.push({ baslik, kategori, birim:"", oncelik, termin:tr.d, kesin:tr.kesin, tumu:false, kaynakSatir:satir, belirsiz:true });
    } else if (tumu) {
      cikan.push({ baslik, kategori, birim:"__TUM__", oncelik, termin:tr.d, kesin:tr.kesin, tumu:true, kaynakSatir:satir, belirsiz:false });
    } else {
      hedefler.forEach(bid =>
        cikan.push({ baslik, kategori, birim:bid, oncelik, termin:tr.d, kesin:tr.kesin, tumu:false, kaynakSatir:satir, belirsiz:false }));
    }
  });
  return cikan;
}

const MOCK_METIN_SES = `[AI SES TRANSKRİPTİ — Toplantı Ses Kaydı (Koord_Toplantisi_0826.mp3 — 12:45 dk)]
– Şanlıurfa ve Van'da envanter sayımı bu hafta kapanmalı, en geç cuma.
– Diyarbakır'da uygulama sınavı için gözetmen listesi eksik, Sema'dan bekliyoruz, 29'una kadar.
– Trabzon veli toplantısını eylülün ilk haftasına aldı, salon teyidi lazım.
– Konya KART stoğunu teyit etti, kapatabiliriz.
– Yeni eğitmen sözleşmelerinin taranıp yüklenmesi acil, 2 Eylül son gün.
– Bütün birimlerde ağustos faaliyet raporu 5 Eylül'e kadar merkeze gelecek.`;

const MOCK_METIN_PDF = `[AI DOKÜMAN AYRIŞTIRICI — PDF Toplantı Tutanağı (Kurul_Kararlari_Operasyon.pdf)]
– Şanlıurfa ve Van'da envanter sayımı bu hafta kapanmalı, en geç cuma.
– Diyarbakır'da uygulama sınavı için gözetmen listesi eksik, Sema'dan bekliyoruz, 29'una kadar.
– Trabzon veli toplantısını eylülün ilk haftasına aldı, salon teyidi lazım.
– Konya KART stoğunu teyit etti, kapatabiliriz.
– Yeni eğitmen sözleşmelerinin taranıp yüklenmesi acil, 2 Eylül son gün.
– Bütün birimlerde ağustos faaliyet raporu 5 Eylül'e kadar merkeze gelecek.`;

const MOCK_METIN_EXCEL = `[AI TABLO AYRIŞTIRICI — Excel Dosyası (Toplu_Operasyon_Gorevleri.xlsx)]
– Şanlıurfa ve Van'da envanter sayımı bu hafta kapanmalı, en geç cuma.
– Diyarbakır'da uygulama sınavı için gözetmen listesi eksik, Sema'dan bekliyoruz, 29'una kadar.
– Trabzon veli toplantısını eylülün ilk haftasına aldı, salon teyidi lazım.
– Konya KART stoğunu teyit etti, kapatabiliriz.
– Yeni eğitmen sözleşmelerinin taranıp yüklenmesi acil, 2 Eylül son gün.
– Bütün birimlerde ağustos faaliyet raporu 5 Eylül'e kadar merkeze gelecek.`;

function vAyristirici() {
  const r = S.ayrisSonuc;
  const mod = S.ayrisMod || "metin";

  const modSekme = (m, etiket, icon) => 
    '<button class="tab-pill' + (mod === m ? " on" : "") + '" data-ayrismod="' + m + '">' +
      ic(icon) + etiket +
    '</button>';

  let girisHtml = '';
  if (mod === "metin") {
    girisHtml = '<div class="form-group wide"><label>' + ic("i-file") + ' SERBEST TOPLANTI NOTU VEYA E-POSTA METNİ</label>' +
      '<textarea class="mono" id="ay_t" style="min-height:140px" placeholder="Toplantı notlarını veya e-posta metnini buraya yapıştırın...">' + esc(r ? r.metin : ORNEK) + '</textarea></div>' +
      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn" data-ayris="1">' + ic("i-wand") + 'Görevleri Analiz Et & Çıkar</button>' +
        '<button class="btn ghost" data-ornek="1">Örnek Metni Yükle</button>' +
      '</div>';
  } else if (mod === "ses") {
    girisHtml = '<div style="background:#F0F9FF;border:1.5px dashed #0284C7;border-radius:8px;padding:24px;text-align:center;margin-bottom:14px">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#0284C7;color:#fff;display:grid;place-items:center;margin:0 auto 12px;box-shadow:0 4px 12px rgba(2,132,199,0.25)">' +
        ic("i-wand") +
      '</div>' +
      '<h4 style="margin:0 0 6px;color:#0369A1;font-weight:800;font-size:15px">Toplantı Ses Kaydı Yükleyin veya Canlı Konuşun</h4>' +
      '<p style="margin:0 0 16px;color:#0284C7;font-size:12.5px">Toplantı ses kaydını (.mp3, .wav, .m4a) veya mikrofon konuşmasını yapay zekâ otomatik metne dönüştürür ve görevleri çıkarır.</p>' +
      '<div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">' +
        '<label class="btn" style="cursor:pointer;background:#0284C7">' + ic("i-plus") + ' Ses Kaydı Dosyası Yükle (.mp3 / .wav)' +
          '<input type="file" accept="audio/*" data-ayrissesyukle="1" style="display:none"></label>' +
        '<button class="btn ghost" data-ayrissescanli="1" style="border-color:#0284C7;color:#0284C7">' + ic("i-bell") + (S.sesKayitAktif ? ' 🔴 Ses Dinleniyor... (Durdur)' : ' Canlı Ses Kaydı Başlat (AI Whisper)') + '</button>' +
        '<button class="btn ghost" data-ayrissesornek="1">' + ic("i-wand") + 'Örnek Ses Kaydını Analiz Et</button>' +
      '</div>' +
      (S.sesKayitAktif ? '<div style="margin-top:14px;padding:10px;background:#E0F2FE;border-radius:6px;color:#0369A1;font-weight:700;font-size:12px">🎙️ Yapay zekâ sesinizi dinliyor ve konuşmaları görev adımlarına dönüştürüyor...</div>' : '') +
    '</div>' +
    '<div class="form-group wide"><label>' + ic("i-file") + ' SES TRANSKRİPTİ VE ÇIKARILAN METİN</label>' +
      '<textarea class="mono" id="ay_t" style="min-height:100px" placeholder="Ses kaydı yüklendiğinde transkript buraya aktarılır...">' + esc(r ? r.metin : MOCK_METIN_SES) + '</textarea></div>' +
    '<div style="margin-top:10px"><button class="btn" data-ayris="1" style="background:#0284C7">' + ic("i-wand") + 'Transkriptten Görevleri Çıkar</button></div>';
  } else if (mod === "pdf") {
    girisHtml = '<div style="background:#F8FAFC;border:1.5px dashed #64748B;border-radius:8px;padding:24px;text-align:center;margin-bottom:14px">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#475569;color:#fff;display:grid;place-items:center;margin:0 auto 12px">' +
        ic("i-file") +
      '</div>' +
      '<h4 style="margin:0 0 6px;color:#0F172A;font-weight:800;font-size:15px">Toplantı Tutanağı veya PDF Dokümanı Yükleyin</h4>' +
      '<p style="margin:0 0 16px;color:#475569;font-size:12.5px">PDF veya Word (.pdf, .docx) formatındaki imzalı tutanak metinleri otomatik taranır ve görev maddeleri ayrıştırılır.</p>' +
      '<div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">' +
        '<label class="btn" style="cursor:pointer;background:#475569">' + ic("i-file") + ' PDF / Word Tutanağı Seç' +
          '<input type="file" accept=".pdf,.docx,.doc" data-ayrispdfyukle="1" style="display:none"></label>' +
        '<button class="btn ghost" data-ayrispdfornek="1">' + ic("i-wand") + 'Örnek PDF Tutanağını Analiz Et</button>' +
      '</div>' +
    '</div>' +
    '<div class="form-group wide"><label>' + ic("i-file") + ' DOKÜMANDAN OKUNAN İÇERİK METNİ</label>' +
      '<textarea class="mono" id="ay_t" style="min-height:100px" placeholder="PDF dokümanı yüklendiğinde metin buraya aktarılır...">' + esc(r ? r.metin : MOCK_METIN_PDF) + '</textarea></div>' +
    '<div style="margin-top:10px"><button class="btn" data-ayris="1" style="background:#475569">' + ic("i-wand") + 'Dokümandan Görevleri Ayrıştır</button></div>';
  } else if (mod === "excel") {
    girisHtml = '<div style="background:#F0FDF4;border:1.5px dashed #16A34A;border-radius:8px;padding:24px;text-align:center;margin-bottom:14px">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#16A34A;color:#fff;display:grid;place-items:center;margin:0 auto 12px">' +
        ic("i-down") +
      '</div>' +
      '<h4 style="margin:0 0 6px;color:#14532D;font-weight:800;font-size:15px">Excel veya CSV Toplu Görev Listesi Yükleyin</h4>' +
      '<p style="margin:0 0 16px;color:#15803D;font-size:12.5px">Toplu atama yapmak istediğiniz Excel çalışma sayfasını (.xlsx, .csv) seçin, sütunlar otomatik eşleştirilsin.</p>' +
      '<div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">' +
        '<label class="btn" style="background:#16A34A;cursor:pointer">' + ic("i-down") + ' Excel / CSV Tablosu Seç' +
          '<input type="file" accept=".xlsx,.xls,.csv" data-ayrisexcelyukle="1" style="display:none"></label>' +
        '<button class="btn ghost" data-ayrisexcelornek="1" style="border-color:#16A34A;color:#16A34A">' + ic("i-wand") + 'Örnek Excel Listesini Yükle</button>' +
      '</div>' +
    '</div>' +
    '<div class="form-group wide"><label>' + ic("i-file") + ' TABLO İÇERİK VERİSİ METNİ</label>' +
      '<textarea class="mono" id="ay_t" style="min-height:100px" placeholder="Excel tablosu yüklendiğinde veriler buraya işlenir...">' + esc(r ? r.metin : MOCK_METIN_EXCEL) + '</textarea></div>' +
    '<div style="margin-top:10px"><button class="btn" data-ayris="1" style="background:#16A34A">' + ic("i-wand") + 'Excel Verisini Görevlere Dönüştür</button></div>';
  }

  return page("Yapay Zekâ Motoru", "Çoklu Kaynaklı Görev Ayrıştırıcı (AI Multi-Input)",
    '<button class="btn ghost" data-go="olustur">' + ic("i-plus") + 'Elle Oluştur</button>',
    ipucu("Toplantı ses kayıtları, PDF tutanakları, Excel tabloları veya serbest metinlerden yapay zekâ ile otomatik görev çıkarın. <strong>Siz onaylamadan hiçbir görev yayınlanmaz.</strong>") +
    '<div class="tab-pills" style="margin-bottom:14px">' +
      modSekme("metin", "Metin & Toplantı Notu", "i-file") +
      modSekme("ses", "Toplantı Ses Kaydı (AI Voice)", "i-wand") +
      modSekme("pdf", "PDF & Word Tutanağı", "i-file") +
      modSekme("excel", "Excel / CSV Görev Tablosu", "i-down") +
    '</div>' +
    '<div class="panel"><div class="panel-body">' +
      girisHtml +
    '</div></div>' +
    (r ? ayrisSonucPanel(r) : ''));
}

function ayrisSonucPanel(r) {
  const belirsiz = r.liste.filter(x => x.belirsiz).length;
  return '<div class="panel" style="margin-top:18px">' +
    '<div class="panel-header"><span>' + ic("i-wand") + ' Ayrıştırma ve Doğrulama Tablosu</span><span class="badge-count">' + r.liste.length + ' görev tespit edildi</span></div>' +
    '<div class="panel-body">' +
      '<div class="ai-card" style="margin-bottom:16px"><span class="ai-tag">' + ic("i-wand") + 'YAPAY ZEKÂ ANALİZ SONUCU</span>' +
      '<p><strong>' + r.liste.length + ' adet operasyon görevi çıkarıldı.</strong> ' +
      (belirsiz ? belirsiz + ' tanesinde il/atölye net anlaşılamadı; onaylamadan önce lütfen atölyeyi seçin. ' : '') +
      'Görevler otomatik olarak DENEYAP kontrol listeleriyle eşleştirildi.</p></div>' +
      '<div class="table-wrapper"><table><thead><tr><th>GÖREV BAŞLIĞI</th><th>HEDEF BİRİM</th><th>KATEGORİ</th><th>ÖNCELİK</th><th>TERMİN</th><th>İŞLEM</th></tr></thead><tbody>' +
      r.liste.map((x, i) =>
        '<tr>' +
        '<td><input type="text" data-ay="' + i + '" data-k="baslik" value="' + esc(x.baslik) + '" style="min-width:240px"></td>' +
        '<td>' + (x.tumu
          ? '<span class="status-pill devam">12 Atölyeye Dağıtılacak</span>'
          : '<select data-ay="' + i + '" data-k="birim"><option value=""' + (x.birim ? "" : " selected") + '>— Atölye Seçin —</option>' +
            BIRIM.map(b => '<option value="' + b.id + '"' + (b.id === x.birim ? " selected" : "") + '>' + b.il + '</option>').join('') + '</select>' +
            (x.belirsiz ? '<div style="color:var(--astro-orange);font-size:10.5px;font-weight:600;margin-top:2px">⚠️ ATÖLYE SEÇİLMELİ</div>' : '')) + '</td>' +
        '<td><select data-ay="' + i + '" data-k="kategori">' + KAT.map(k =>
          '<option' + (k === x.kategori ? " selected" : "") + '>' + k + '</option>').join('') + '</select></td>' +
        '<td><select data-ay="' + i + '" data-k="oncelik">' + ONCELIK.map(o =>
          '<option' + (o === x.oncelik ? " selected" : "") + '>' + o + '</option>').join('') + '</select></td>' +
        '<td><input type="date" data-ay="' + i + '" data-k="termin" value="' + x.termin + '">' +
          (x.kesin ? '' : '<div style="color:var(--ink-400);font-size:10px;font-family:var(--font-mono)">TAHMİNİ</div>') + '</td>' +
        '<td><button class="btn ghost sm" data-aysil="' + i + '">Çıkar</button></td></tr>').join('') +
      '</tbody></table></div>' +
      '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<button class="btn" data-onayla="1"' + (belirsiz ? " disabled" : "") + '>' + ic("i-check") + 'Tümünü Onayla ve Görevleri Oluştur</button>' +
        '<button class="btn ghost" data-iptal="1">Vazgeç</button>' +
        (belirsiz ? '<span style="color:var(--astro-orange);font-size:12px;font-weight:500">Lütfen ' + belirsiz + ' satır için hedef atölyeyi seçin.</span>' : '') +
      '</div></div></div>';
}

/* ── 9. SEZON RAPORU ── */
function vRapor() {
  const hepsi = TASKS;
  const tamam = hepsi.filter(t => t.durum === "Tamamlandı");
  const gecik = hepsi.filter(t => t.durum === "Gecikti");
  const oran = Math.round(tamam.length / hepsi.length * 100);

  const satir = BIRIM.map(b => {
    const g = hepsi.filter(t => t.birim === b.id);
    const c = g.filter(t => t.durum === "Tamamlandı").length;
    const gc = g.filter(t => t.durum === "Gecikti").length;
    return { b, n:g.length, c, gc, pc:g.length ? Math.round(c / g.length * 100) : 0 };
  }).filter(x => x.n).sort((a, b) => a.pc - b.pc);

  const bolgeSatir = BOLGE.map(bl => {
    const g = BIRIM.filter(b => b.bolge === bl);
    if (!g.length) return null;
    const t = hepsi.filter(x => g.some(b => b.id === x.birim));
    const c = t.filter(x => x.durum === "Tamamlandı").length;
    const gc = t.filter(x => x.durum === "Gecikti").length;
    return { bl, atolye:g.length, n:t.length, c, gc, pc:t.length ? Math.round(c / t.length * 100) : 0 };
  }).filter(Boolean).sort((a, b) => a.pc - b.pc);

  return page("Protokol ve Raporlama", "Sezon Performans Raporu",
    '<button class="btn ghost" data-aktar="gorev">' + ic("i-down") + 'Excel Aktar</button>' +
    '<button class="btn ghost" onclick="window.print()">' + ic("i-file") + 'Yazdır / PDF</button>' +
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    '<div class="report-doc">' +
      '<div class="report-header"><div>' +
        '<div class="title">DENEYAP Sezon Operasyon Raporu</div>' +
        '<div class="meta">2026–2027 SEZONU · 12 ATÖLYE · RAPOR TARİHİ: ' + fmtLong(iso(TODAY)) + '</div></div>' +
        '<div class="inst">T3 VAKFI DENEYAP KOORDİNATÖRLÜĞÜ<br>PROTOKOL PAYDAŞLARI VE YÖNETİM İÇİN</div></div>' +
      '<div class="kpi-grid" style="margin:20px 0">' +
        kpi(hepsi.length, "Toplam Görev") +
        kpi(tamam.length, "Tamamlanan", "#16A34A") +
        kpi(gecik.length, "Geciken", "var(--astro-red)") +
        kpi("%" + oran, "Genel Tamamlanma", "var(--astro-blue)") +
      '</div>' +
      '<!-- Yönetici Sezon Infografik Kartları -->' +
      '<div style="background:linear-gradient(135deg, #1C2033 0%, #0F172A 100%);padding:20px;border-radius:12px;color:#fff;margin:20px 0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px">' +
          '<div style="font-weight:800;font-size:15px;color:#F8FAFC;display:flex;align-items:center;gap:8px">' +
            ic("i-chart") + ' SEZON OPERASYONEL İNFOGRAFİK VE STRATEJİK DEĞERLENDİRME' +
          '</div>' +
          '<span style="font-size:11.5px;color:#94A3B8">T3 Vakfı Sezon Sonu Protokol Analizi</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px">' +
          '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:3.5px solid #3B82F6">' +
            '<div style="font-size:11px;color:#94A3B8;font-weight:700">EN YÜKSEK PERFORMANSLI BÖLGE</div>' +
            '<div style="font-size:16px;font-weight:800;color:#60A5FA;margin-top:3px">' + (bolgeSatir.length ? esc(bolgeSatir[bolgeSatir.length - 1].bl) + ' (%' + bolgeSatir[bolgeSatir.length - 1].pc + ')' : "—") + '</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:3.5px solid #EF4444">' +
            '<div style="font-size:11px;color:#94A3B8;font-weight:700">GECİKME ORANI EN YÜKSEK ATÖLYE</div>' +
            '<div style="font-size:16px;font-weight:800;color:#F87171;margin-top:3px">' + (satir.length ? esc(satir[0].b.il) + ' (%' + satir[0].pc + ' Başarı)' : "—") + '</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:3.5px solid #10B981">' +
            '<div style="font-size:11px;color:#94A3B8;font-weight:700">PROTOKOL UYUM ENDEKSİ</div>' +
            '<div style="font-size:16px;font-weight:800;color:#34D399;margin-top:3px">%' + oran + ' Tamamlanma</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<h4 style="font-family:var(--font-display);font-size:14px;margin:22px 0 10px;font-weight:700">Bölgesel Gerçekleşme</h4>' +
      '<div class="table-wrapper"><table><thead><tr><th>BÖLGE</th><th>ATÖLYE</th><th>GÖREV</th><th>TAMAMLANAN</th><th>GECİKEN</th><th>TAMAMLANMA %</th></tr></thead><tbody>' +
      bolgeSatir.map(x => '<tr><td>' + esc(x.bl) + '</td><td class="tabular-date">' + x.atolye +
        '</td><td class="tabular-date">' + x.n + '</td><td class="tabular-date">' + x.c +
        '</td><td class="tabular-date"' + (x.gc ? ' style="color:var(--astro-red);font-weight:700"' : '') + '>' + x.gc + '</td>' +
        '<td><span class="risk-meter"><span class="risk-track" style="width:70px"><span class="risk-fill" style="width:' + x.pc +
        '%;background:' + (x.pc < 35 ? 'var(--astro-red)' : x.pc < 60 ? 'var(--astro-orange)' : '#16A34A') +
        '"></span></span><span class="risk-score">%' + x.pc + '</span></span></td></tr>').join('') +
      '</tbody></table></div>' +
      '<h4 style="font-family:var(--font-display);font-size:14px;margin:28px 0 10px;font-weight:700">Atölye Bazında Başarı ve Gecikme</h4>' +
      '<div class="table-wrapper"><table><thead><tr><th>İL / ATÖLYE</th><th>TOPLAM GÖREV</th><th>TAMAMLANAN</th><th>GECİKEN</th><th>ORT. GECİKME</th><th>TAMAMLANMA</th></tr></thead><tbody>' +
      satir.map(x =>
        '<tr><td>' + esc(x.b.il + " / " + x.b.ad) + '</td><td class="tabular-date">' + x.n + '</td><td class="tabular-date">' + x.c +
        '</td><td class="tabular-date"' + (x.gc ? ' style="color:var(--astro-red);font-weight:700"' : '') + '>' + x.gc +
        '</td><td class="tabular-date">' + x.b.gecmis.toFixed(1).replace('.', ',') + ' gün</td>' +
        '<td><span class="risk-meter"><span class="risk-track" style="width:70px"><span class="risk-fill" style="width:' + x.pc +
        '%;background:' + (x.pc < 35 ? 'var(--astro-red)' : x.pc < 60 ? 'var(--astro-orange)' : '#16A34A') +
        '"></span></span><span class="risk-score">%' + x.pc + '</span></span></td></tr>').join('') +
      '</tbody></table></div>' +
      '<div style="margin-top:28px;padding-top:14px;border-top:1px solid var(--card-border);display:flex;justify-content:space-between;align-items:center">' +
        '<span style="font-size:12px;color:var(--ink-500)">ASTRO Operasyon ve Takip Sistemi · Firnas Technologies</span>' +
        '<span class="report-strip"><i style="background:var(--astro-red)"></i><i style="background:var(--astro-orange)"></i><i style="background:var(--astro-yellow)"></i><i style="background:var(--astro-cyan)"></i></span>' +
      '</div>' +
    '</div>');
}

/* ── 10. YOKLAMA VE DEVAMSIZLIK ── */
function yokGruplari() {
  const u = me();
  return (u.rol === "egitmen" || u.rol === "il") ? GRUPLAR.filter(g => g.birim === u.birim) : GRUPLAR;
}
function yokFiltrele(list) {
  const f = S.yokFilt;
  return list.filter(y => {
    const g = gIdx[y.grup];
    if (!g) return false;
    const b = bIdx[g.birim];
    if (!b) return false;

    const bolgeMatch = !f.bolge || bBolge(g.birim) === f.bolge;
    const ilMatch = !f.il || b.il === f.il;
    const birimMatch = !f.birim || g.birim === f.birim;
    const grupMatch = !f.grup || y.grup === f.grup;
    const basMatch = !f.bas || y.tarih >= f.bas;
    const bitMatch = !f.bit || y.tarih <= f.bit;
    return bolgeMatch && ilMatch && birimMatch && grupMatch && basMatch && bitMatch;
  });
}
const gerekcesizSayi = y => Object.keys(y.kayit)
  .filter(k => y.kayit[k] !== "Katıldı" && !(y.gerekce || {})[k]).length;

function egtPill(d) {
  return d === "Katıldı" ? '<span class="status-pill tamam">KATILDI</span>'
    : d === "İzinli" ? '<span class="status-pill bekliyor">İZİNLİ</span>'
    : d === "Katılmadı" ? '<span class="status-pill gecikti">KATILMADI</span>'
    : '<span class="status-pill bekliyor">KAYIT YOK</span>';
}

function yoklamaAnaliz(kapsam) {
  if (!kapsam || !kapsam.length) return null;
  const ilMap = {};
  let topOran = 0;
  let egtKatildi = 0;
  let mazeretsiz = 0;

  kapsam.forEach(y => {
    const g = gIdx[y.grup];
    if (!g) return;
    const b = bIdx[g.birim];
    if (!b) return;

    const o = yokOran(y);
    topOran += o;
    if (y.egitmenDurum === "Katıldı") egtKatildi++;
    mazeretsiz += gerekcesizSayi(y);

    if (!ilMap[b.il]) {
      ilMap[b.il] = { il: b.il, bolge: bBolge(b.id), toplamOran: 0, sayi: 0, atolyeler: new Set() };
    }
    ilMap[b.il].toplamOran += o;
    ilMap[b.il].sayi++;
    ilMap[b.il].atolyeler.add(b.ad);
  });

  const ilSiralama = Object.values(ilMap).map(x => ({
    il: x.il,
    bolge: x.bolge,
    oran: Math.round(x.toplamOran / Math.max(1, x.sayi)),
    oturum: x.sayi,
    atolyeSayisi: x.atolyeler.size
  })).sort((a, b) => b.oran - a.oran);

  return {
    genelOrt: Math.round(topOran / Math.max(1, kapsam.length)),
    egtOrt: Math.round(egtKatildi / Math.max(1, kapsam.length) * 100),
    mazeretsiz,
    enYuksek: ilSiralama[0] || { il: "—", oran: 0 },
    enDusuk: ilSiralama[ilSiralama.length - 1] || { il: "—", oran: 0 },
    ilSiralama,
    toplamOturum: kapsam.length
  };
}

function yoklamaInfografikPaneli(an) {
  if (!an) return '';
  return '<div class="panel" style="margin-bottom:20px;background:linear-gradient(135deg, #1C2033 0%, #0F172A 100%);color:#FFFFFF;padding:20px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 10px 25px -5px rgba(0,0,0,0.2)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<span style="background:rgba(211,47,47,0.2);color:#EF4444;padding:8px;border-radius:8px;display:inline-flex">' + ic("i-chart") + '</span>' +
        '<div><h4 style="margin:0;font-size:16px;font-weight:700;color:#F8FAFC">TÜRKİYE GENELİ ATÖLYE KATILIM İNFOGRAFİĞİ</h4>' +
        '<span style="font-size:12px;color:#94A3B8">Katılım performansı, il ve atölye bazlı canlı devam analizi</span></div>' +
      '</div>' +
      '<span class="badge" style="background:rgba(16,185,129,0.15);color:#10B981;border:1px solid rgba(16,185,129,0.3);font-weight:700">' + an.toplamOturum + ' İşlenen Oturum</span>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:20px">' +
      '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:4px solid #10B981">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">EN YÜKSEK KATILIMLI İL</div>' +
        '<div style="font-size:18px;font-weight:800;color:#34D399;margin:4px 0">' + esc(an.enYuksek.il) + ' (%' + an.enYuksek.oran + ')</div>' +
        '<div style="font-size:11px;color:#CBD5E1">Lider İl Katılım Performansı</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:4px solid #EF4444">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">DESTEK GEREKEN (EN DÜŞÜK) İL</div>' +
        '<div style="font-size:18px;font-weight:800;color:#F87171;margin:4px 0">' + esc(an.enDusuk.il) + ' (%' + an.enDusuk.oran + ')</div>' +
        '<div style="font-size:11px;color:#CBD5E1">Saha Denetimi Önerilir</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:4px solid #3B82F6">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">GENEL KATILIM ORANI</div>' +
        '<div style="font-size:18px;font-weight:800;color:#60A5FA;margin:4px 0">%' + an.genelOrt + '</div>' +
        '<div style="font-size:11px;color:#CBD5E1">Tüm Türkiye Katılım Ortalaması</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;border-left:4px solid #F59E0B">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">EĞİTMEN DERSE KATILIMI</div>' +
        '<div style="font-size:18px;font-weight:800;color:#FBBF24;margin:4px 0">%' + an.egtOrt + '</div>' +
        '<div style="font-size:11px;color:#CBD5E1">Eğitmen Yoklama Disiplini</div>' +
      '</div>' +
    '</div>' +

    '<div>' +
      '<div style="font-size:12px;font-weight:700;color:#94A3B8;margin-bottom:10px">İLLER BAZINDA KATILIM MİZANI (İNFOGRAFİK KARŞILAŞTIRMA)</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">' +
        an.ilSiralama.slice(0, 6).map((item, idx) => {
          const cls = item.oran >= 85 ? "#10B981" : item.oran >= 75 ? "#F59E0B" : "#EF4444";
          return '<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:6px">' +
              '<span style="font-weight:700;color:#F1F5F9">#' + (idx + 1) + ' ' + esc(item.il) + '</span>' +
              '<span style="font-weight:800;color:' + cls + '">%' + item.oran + '</span>' +
            '</div>' +
            '<div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">' +
              '<div style="width:' + item.oran + '%;height:100%;background:' + cls + ';border-radius:3px"></div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +
  '</div>';
}

function vYoklama() {
  const u = me();
  const gruplar = yokGruplari();
  const gid = gruplar.some(g => g.id === S.yokGrup) ? S.yokGrup : (gruplar[0] ? gruplar[0].id : "");
  const tarih = S.yokTarih || iso(TODAY);
  const kapsam = YOKLAMA.filter(y => gruplar.some(g => g.id === y.grup));
  const varOlan = YOKLAMA.find(y => y.grup === gid && y.tarih === tarih);
  const alabilir = u.rol === "egitmen";

  const an = yoklamaAnaliz(kapsam);
  const ort = an ? an.genelOrt : 0;
  const gerekcesiz = kapsam.filter(y => gerekcesizSayi(y) > 0).length;

  const sekmeler = (alabilir ? [["al","Yoklama Al"]] : [])
    .concat([["kayit","Kayıtlar & Denetim"],["devamsizlik","Devamsızlık Takibi"]]);
  const sk = sekmeler.some(x => x[0] === S.yokSekme) ? S.yokSekme : sekmeler[0][0];

  return page(["il","egitmen"].includes(u.rol) ? bIdx[u.birim].il + " / " + bIdx[u.birim].ad : "Eğitim ve Katılım",
    u.rol === "koord" ? "Yoklama Denetim Paneli" : "Öğrenci & Eğitmen Yoklaması",
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    yoklamaInfografikPaneli(an) +
    '<div class="kpi-grid">' +
      kpi(kapsam.length, "Yoklama Oturumu") +
      kpi("%" + ort, "Ortalama Sınıf Katılımı", ort >= 85 ? "#16A34A" : ort >= 70 ? "var(--astro-orange)" : "var(--astro-red)") +
      kpi(kapsam.filter(y => y.egitmenDurum && y.egitmenDurum !== "Katıldı").length, "Eğitmen Devamsızlığı", "var(--astro-orange)") +
      kpi(gerekcesiz, "Mazeretsiz Devamsızlık", gerekcesiz ? "var(--astro-red)" : "#16A34A") +
    '</div>' +
    '<div class="tab-pills">' + sekmeler.map(x =>
      '<button class="tab-pill' + (x[0] === sk ? " on" : "") + '" data-yoksekme="' + x[0] + '">' + x[1] +
      '</button>').join('') + '</div>' +
    (sk === "al" ? yokAlPanel(gruplar, gid, tarih, varOlan)
      : sk === "kayit" ? yokKayitPanel(kapsam)
      : yokDevamsizlikPanel(u.birim)) +
    (S.yokDetay ? yokDetayModal(S.yokDetay) : ''));
}

function yokDetayModal(id) {
  const y = YOKLAMA.find(x => x.id === id);
  if (!y) return '';
  const g = gIdx[y.grup];
  const b = g ? bIdx[g.birim] : null;
  const egt = uIdx[y.egitmen];
  const o = yokOran(y);
  const sayim = YOK_DURUM.map(d => Object.values(y.kayit).filter(x => x === d).length);
  const gz = gerekcesizSayi(y);

  return '<div class="modal-backdrop" data-yokdetaykapat="1">' +
    '<div class="modal-card" style="max-width:780px" onclick="event.stopPropagation()">' +
      '<div class="modal-header">' +
        '<div>' +
          '<h3 style="margin:0;font-size:17px;font-weight:700;color:var(--ink-900)">' + ic("i-check") + ' Yoklama Oturumu Detayı (' + esc(y.id) + ')</h3>' +
          '<div style="font-size:12.5px;color:var(--ink-500);margin-top:3px">' +
            esc(g ? g.ad : "") + ' · ' + esc(b ? b.il + " / " + b.ad : "") + ' · ' + fmtLong(y.tarih) +
          '</div>' +
        '</div>' +
        '<button class="modal-close" data-yokdetaykapat="1">✕</button>' +
      '</div>' +

      '<div class="modal-body">' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;margin-bottom:18px;background:var(--bg-wash);padding:14px;border-radius:10px;border:1px solid var(--card-border)">' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">SINIF KATILIMI</div><div style="font-size:20px;font-weight:800;color:' + (o >= 85 ? '#16A34A' : 'var(--astro-orange)') + '">%' + o + '</div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">EĞİTMEN KATILIMI</div><div>' + egtPill(y.egitmenDurum) + '</div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">ÖĞRENCİ DAĞILIMI</div><div style="font-size:12px;font-weight:600;color:var(--ink-800);margin-top:4px">' +
            '<span style="color:#16A34A">' + sayim[0] + ' Katıldı</span> · <span style="color:var(--astro-red)">' + sayim[1] + ' Yok</span> · <span style="color:var(--astro-orange)">' + sayim[2] + ' İzinli</span></div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">MAZERETSİZ DEVAMSIZLIK</div><div style="font-size:16px;font-weight:800;color:' + (gz ? 'var(--astro-red)' : '#16A34A') + '">' + (gz ? gz + ' Öğrenci' : 'Yok (Tam Mazeretli)') + '</div></div>' +
        '</div>' +

        (y.egitmenDurum !== "Katıldı" && y.egitmenGerekce ?
          '<div style="margin-bottom:16px;padding:10px 14px;background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:6px;font-size:12.5px;color:#92400E">' +
            '<b>Eğitmen Devamsızlık Mazereti (' + esc(egt ? egt.ad : "Eğitmen") + '):</b> ' + esc(y.egitmenGerekce) +
          '</div>' : '') +

        '<div style="font-weight:700;font-size:13px;color:var(--ink-900);margin-bottom:8px">Sınıf Öğrenci Listesi ve Mazeret Kayıtları (' + (g && g.ogr ? g.ogr.length : 0) + ' Öğrenci)</div>' +
        '<div class="table-wrapper" style="max-height:360px;overflow-y:auto"><table><thead><tr><th>NO</th><th>ÖĞRENCİ ADI SOYADI</th><th>DURUM</th><th>MAZERET / GEREKÇE NOTU</th></tr></thead><tbody>' +
        (g && g.ogr ? g.ogr.map((oItem, idx) => {
          const st = y.kayit[oItem.id] || "Katıldı";
          const ger = (y.gerekce || {})[oItem.id];
          const stBadge = st === "Katıldı" ? '<span class="status-pill tamam">KATILDI</span>'
            : st === "İzinli" ? '<span class="status-pill bekliyor">İZİNLİ</span>'
            : '<span class="status-pill gecikti">KATILMADI</span>';
          return '<tr>' +
            '<td class="tabular-date">' + (idx + 1) + '</td>' +
            '<td class="task-title"><b>' + esc(oItem.ad) + '</b></td>' +
            '<td>' + stBadge + '</td>' +
            '<td style="font-size:12px;color:' + (ger ? 'var(--ink-800)' : 'var(--ink-400)') + '">' + (ger ? esc(ger) : (st === "Katıldı" ? "—" : "<i style='color:var(--astro-red)'>Mazeret Bildirilmedi</i>")) + '</td>' +
            '</tr>';
        }).join('') : '<tr><td colspan="4"><div style="text-align:center;padding:20px;color:var(--ink-400)">Öğrenci kaydı bulunamadı.</div></td></tr>') +
        '</tbody></table></div>' +
      '</div>' +

      '<div class="modal-footer" style="display:flex;justify-content:space-between">' +
        '<button class="btn ghost sm" data-aktar="yoklama">' + ic("i-down") + 'Rapor Olarak İndir</button>' +
        '<button class="btn" data-yokdetaykapat="1">Kapat</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function yokAlPanel(gruplar, gid, tarih, varOlan) {
  const t = S.yokTaslak;
  return '<div class="panel" style="margin-bottom:16px"><div class="panel-header"><span>' + ic("i-check") + ' Yoklama Oturumu Başlat</span></div><div class="panel-body">' +
    '<div class="filter-bar" style="margin-bottom:0">' +
      '<div class="form-group" style="min-width:240px"><label>EĞİTİM GRUBU</label><select data-yokgrup>' +
        gruplar.map(g => '<option value="' + g.id + '"' + (g.id === gid ? " selected" : "") + '>' +
          esc(g.ad) + '</option>').join('') + '</select></div>' +
      '<div class="form-group"><label>DERS TARİHİ</label><input type="date" data-yoktarih value="' + tarih + '"></div>' +
      '<button class="btn" data-yokbasla="1"' + (varOlan ? " disabled" : "") + '>' +
        (varOlan ? "Bu Tarihte Yoklama Alındı" : "Yoklamayı Başlat") + '</button>' +
    '</div>' +
    (varOlan ? ipucu("Bu grup için " + fmtLong(tarih) + " tarihinde %" + yokOran(varOlan) + " katılım oranıyla yoklama kaydedilmiş.", "margin-top:10px") : "") +
  '</div></div>' +
  (t && t.grup === gid && t.tarih === tarih ? yokTaslakPanel(t) : '');
}

function yokTaslakPanel(t) {
  const g = gIdx[t.grup];
  const sayim = YOK_DURUM.map(d => Object.values(t.kayit).filter(x => x === d).length);
  return '<div class="panel" style="margin-bottom:16px"><div class="panel-header"><span>' + esc(g.ad) +
    " · " + fmtLong(t.tarih) + '</span><span class="badge-count">' + g.ogr.length + ' öğrenci</span></div>' +
    '<div class="panel-body" style="padding-bottom:12px;border-bottom:1px solid var(--card-border)">' +
      '<label style="margin-bottom:8px;display:block">EĞİTMENİN DERSE KATILIMI</label>' +
      '<div class="attendance-row" style="padding:0;border:0">' +
        '<span class="student-name" style="font-weight:700">' + esc(me().ad) + '</span>' +
        '<span class="segmented-control">' + YOK_DURUM.map(d =>
          '<button data-egtset="1" data-yd="' + d + '" class="' +
          (t.egitmenDurum === d ? (d === "Katıldı" ? "on-katildi" : d === "Katılmadı" ? "on-katilmadi" : "on-izinli") : "") + '">' +
          d + '</button>').join('') + '</span></div>' +
      (t.egitmenDurum !== "Katıldı"
        ? '<div style="margin-top:10px"><input type="text" id="ger-egitmen" value="' +
          esc(t.egitmenGerekce) + '" placeholder="Eğitmen devamsızlık mazeret gerekçesi (zorunludur)...">' +
          '<div style="color:var(--astro-orange);font-size:11px;font-weight:600;margin-top:4px">' + ic("i-alert") +
          ' Eğitmen mazereti il koordinatörlüğüne rapor edilir.</div></div>' : '') +
    '</div>' +
    '<div class="panel-body" style="padding-bottom:6px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
      '<button class="btn ghost sm" data-yokall="Katıldı">Tüm Öğrencileri Katıldı İşaretle</button>' +
      '<span style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-600)">Katıldı: ' + sayim[0] +
      ' · Katılmadı: ' + sayim[1] + ' · İzinli: ' + sayim[2] + '</span></div>' +
    '<div>' + g.ogr.map((o, i) => {
      const d = t.kayit[o.id];
      return '<div class="attendance-row"><span class="index-num">' + (i + 1) + '</span>' +
        '<span class="student-name">' + esc(o.ad) + '</span>' +
        '<span class="segmented-control">' + YOK_DURUM.map(x =>
          '<button data-yokset="' + o.id + '" data-yd="' + x + '" class="' +
          (d === x ? (x === "Katıldı" ? "on-katildi" : x === "Katılmadı" ? "on-katilmadi" : "on-izinli") : "") + '">' +
          x + '</button>').join('') + '</span>' +
        (d !== "Katıldı"
          ? '<div style="flex:1 0 100%;padding:6px 0 2px 38px"><input type="text" id="ger-' + o.id +
            '" value="' + esc(t.gerekce[o.id] || "") + '" placeholder="Mazeret gerekçesi girin (sağlık raporu, sınav vb.)..."></div>'
          : '') + '</div>';
    }).join('') + '</div>' +
    '<div class="panel-footer">' +
      '<button class="btn" data-yokkaydet="1">' + ic("i-check") + 'Yoklamayı Sisteme Kaydet</button>' +
      '<button class="btn ghost" data-yokiptal="1">İptal</button>' +
    '</div></div>';
}

function yokKayitPanel(kapsam) {
  const u = me();
  const f = S.yokFilt;
  const gruplar = yokGruplari();
  const list = yokFiltrele(kapsam).sort((a, b) => b.tarih.localeCompare(a.tarih));
  const kilitli = u.rol === "egitmen" || u.rol === "il";

  const illerList = f.bolge ? BIRIM.filter(b => bBolge(b.id) === f.bolge).map(b => b.il) : BIRIM.map(b => b.il);
  const benzersizIller = Array.from(new Set(illerList));

  const birimListe = kilitli ? BIRIM.filter(b => b.id === u.birim) :
    BIRIM.filter(b => (!f.bolge || bBolge(b.id) === f.bolge) && (!f.il || b.il === f.il));

  const grupListe = f.birim ? gruplar.filter(g => g.birim === f.birim) :
    (f.il ? gruplar.filter(g => bIdx[g.birim] && bIdx[g.birim].il === f.il) : gruplar);

  return '<div class="filter-bar">' +
    (!kilitli ?
      '<div class="form-group"><label>ÜLKE</label><select data-yf="ulke">' +
        '<option value="">Tümü</option>' +
        '<option value="TR"' + (f.ulke === "TR" || !f.ulke ? " selected" : "") + '>Türkiye</option>' +
        '<option value="AZ"' + (f.ulke === "AZ" ? " selected" : "") + '>Azerbaycan</option>' +
        '<option value="KKTC"' + (f.ulke === "KKTC" ? " selected" : "") + '>KKTC</option>' +
      '</select></div>' +
      '<div class="form-group"><label>BÖLGE</label><select data-yf="bolge">' +
        '<option value="">Tüm Bölgeler</option>' +
        BOLGE.map(x => '<option' + (x === f.bolge ? " selected" : "") + '>' + x + '</option>').join('') +
      '</select></div>' +
      '<div class="form-group"><label>İL</label><select data-yf="il">' +
        '<option value="">Tüm İller</option>' +
        benzersizIller.map(il => '<option' + (il === f.il ? " selected" : "") + '>' + il + '</option>').join('') +
      '</select></div>' +
      '<div class="form-group"><label>ATÖLYE</label><select data-yf="birim">' +
        '<option value="">Tüm Atölyeler</option>' +
        birimListe.map(b => '<option value="' + b.id + '"' + (b.id === f.birim ? " selected" : "") + '>' +
          esc(b.il + " / " + b.ad) + '</option>').join('') +
      '</select></div>'
    : '') +
    '<div class="form-group" style="min-width:180px"><label>EĞİTİM GRUBU</label><select data-yf="grup">' +
      '<option value="">Tüm Gruplar</option>' +
      grupListe.map(g => '<option value="' + g.id + '"' + (g.id === f.grup ? " selected" : "") + '>' +
        esc(g.ad) + '</option>').join('') +
    '</select></div>' +
    '<div class="form-group"><label>BAŞLANGIÇ</label><input type="date" data-yf="bas" value="' + esc(f.bas) + '"></div>' +
    '<div class="form-group"><label>BİTİŞ</label><input type="date" data-yf="bit" value="' + esc(f.bit) + '"></div>' +
    '<button class="btn ghost sm" data-aktar="yoklama">' + ic("i-down") + 'Yoklama Listesi İndir</button>' +
    '<button class="btn ghost sm" data-yoktemizle="1">Temizle</button>' +
  '</div>' +
  '<div class="panel"><div class="panel-header"><span>Yoklama Kayıtları ve Denetim</span><span class="badge-count">' +
    list.length + ' kayıt</span></div>' +
  '<div class="table-wrapper"><table><thead><tr><th>GRUP</th><th>ATÖLYE</th><th>TARİH</th><th>EĞİTMEN</th><th>EĞİTMEN KATILIMI</th><th>SINIF KATILIMI</th><th>MAZERETSİZ</th><th>DETAY</th></tr></thead><tbody>' +
  (list.length ? list.slice(0, 30).map(y => {
    const o = yokOran(y), g = gIdx[y.grup], gz = gerekcesizSayi(y);
    return '<tr style="cursor:pointer" data-yokdetay="' + y.id + '">' +
      '<td class="task-title"><b>' + esc(g ? g.ad : "—") + '</b><br><small style="color:var(--ink-500);font-size:11px">Detaylar için tıklayın</small></td>' +
      '<td class="tabular-date">' + esc(g && bIdx[g.birim] ? bIdx[g.birim].il : "—") + '</td>' +
      '<td class="tabular-date">' + fmtLong(y.tarih) + '</td>' +
      '<td>' + esc(uIdx[y.egitmen] ? uIdx[y.egitmen].ad : "—") + '</td>' +
      '<td>' + egtPill(y.egitmenDurum) + '</td>' +
      '<td><span class="risk-meter"><span class="risk-track" style="width:60px"><span class="risk-fill" style="width:' + o +
        '%;background:' + (o >= 85 ? '#16A34A' : o >= 70 ? 'var(--astro-orange)' : 'var(--astro-red)') +
        '"></span></span><span class="risk-score">%' + o + '</span></span></td>' +
      '<td class="tabular-date"' + (gz ? ' style="color:var(--astro-red);font-weight:700"' : '') + '>' + (gz || "—") + '</td>' +
      '<td><button class="btn ghost sm" data-yokdetay="' + y.id + '">' + ic("i-search") + ' İncele</button></td></tr>';
  }).join('') : '<tr><td colspan="8"><div style="text-align:center;padding:30px;color:var(--ink-400)">Seçilen kriterlere uygun kayıt bulunmuyor.</div></td></tr>') +
  '</tbody></table></div></div>';
}

function yokDevamsizlikPanel(bid) {
  const ogr = ogrDevamsizlik(bid).filter(x => x.yok > 0);
  return '<div class="panel"><div class="panel-header"><span>Öğrenci Devamsızlık Takibi (Sınır: ' + LIMIT.ogrenci + ')</span>' +
    '<span class="badge-count">' + ogr.length + ' devamsızlık yapan</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th>ÖĞRENCİ</th><th>GRUP</th><th>ATÖLYE</th><th>KATILMADI</th><th>İZİNLİ</th><th>DURUM</th></tr></thead><tbody>' +
    (ogr.length ? ogr.slice(0, 30).map(x =>
      '<tr><td class="task-title">' + esc(x.ogr.ad) + '</td>' +
      '<td class="tabular-date">' + esc(x.grup.ad.split(" · ")[0]) + '</td>' +
      '<td class="tabular-date">' + esc(bIdx[x.grup.birim].il) + '</td>' +
      '<td class="tabular-date"' + (x.yok >= LIMIT.ogrenci ? ' style="color:var(--astro-red);font-weight:700"' : '') + '>' +
        x.yok + " / " + LIMIT.ogrenci + '</td>' +
      '<td class="tabular-date">' + x.izin + '</td>' +
      '<td>' + limitPill(x.yok, LIMIT.ogrenci) + '</td></tr>').join('')
    : '<tr><td colspan="6"><div style="text-align:center;padding:30px;color:var(--ink-400)">Devamsızlığı olan öğrenci bulunmuyor.</div></td></tr>') +
    '</tbody></table></div></div>';
}

/* ── 11. ENVANTER VE FAZ HAZIRLIĞI ── */
function envGorunur() {
  const u = me();
  if (u.rol === "egitmen" || u.rol === "il") return ENVANTER.filter(e => e.birim === u.birim);
  return ENVANTER;
}

function fazSecenek(sec) {
  return FAZ.filter(fazAktif).map(f => '<option value="' + f.id + '"' + (f.id === sec ? " selected" : "") +
    '>' + esc(f.ad) + '</option>').join('');
}

function fazOzet(bidler) {
  return FAZ.filter(fazAktif).map(f => {
    let toplam = 0, yeterli = 0, eksikKayit = 0;
    bidler.forEach(bid => {
      const h = fazHazir(f.id, bid);
      toplam += h.toplam; yeterli += h.yeterli; eksikKayit += h.eksikKayit;
    });
    return { f, toplam, yeterli, eksikKayit, pc:toplam ? Math.round(yeterli / toplam * 100) : 0 };
  });
}

function talepFormuPanel(bid) {
  const u = me();
  const b = bIdx[bid] || bIdx["b1"];
  return '<div class="panel" style="margin-bottom:18px;border:1.5px solid #0284C7;background:#F0F9FF">' +
    '<div class="panel-header" style="background:#E0F2FE;color:#0369A1"><span>' + ic("i-box") + ' Genel Merkeze Malzeme Talebi İlet (' + esc(b.il + " / " + b.ad) + ')</span></div>' +
    '<div class="panel-body">' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;align-items:flex-end">' +
        '<div class="form-group" style="flex:1.5"><label style="color:#0369A1">TALEP EDİLEN MALZEME</label>' +
          '<select id="tlpMalzeme">' +
            ENV_KATALOG.map(m => '<option value="' + esc(m.ad) + '">' + esc(m.ad) + ' (' + esc(m.kat) + ')</option>').join('') +
          '</select></div>' +
        '<div class="form-group"><label style="color:#0369A1">TALEP ADEDİ</label>' +
          '<input type="number" id="tlpAdet" value="10" min="1" max="500"></div>' +
        '<div class="form-group"><label style="color:#0369A1">ACİLİYET / ÖNCELİK</label>' +
          '<select id="tlpOncelik">' +
            ONCELIK.map(o => '<option' + (o === "Yüksek" ? " selected" : "") + '>' + o + '</option>').join('') +
          '</select></div>' +
        '<div class="form-group wide"><label style="color:#0369A1">GEREKÇE VE TALEP NOTU</label>' +
          '<input type="text" id="tlpGerekce" placeholder="Örn. Robotik kodlama dersi öncesi filament stoğu tükendi, acil sevkiyat talebidir."></div>' +
        '<div style="margin-top:8px;display:flex;gap:10px">' +
          '<button class="btn" data-envtalepgonder="1" style="background:#0284C7">' + ic("i-check") + 'Merkez Operasyona İlet</button>' +
          '<button class="btn ghost" data-envtalepac="1">Vazgeç</button>' +
        '</div>' +
      '</div>' +
    '</div></div>';
}

function malzemeTalepleriPanel() {
  const u = me();
  const kilitli = u.rol === "egitmen" || u.rol === "il";
  const list = kilitli ? MALZEME_TALEPLERI.filter(x => x.birim === u.birim) : MALZEME_TALEPLERI;

  return '<div class="panel" style="margin-top:22px">' +
    '<div class="panel-header"><span>' + ic("i-box") + (kilitli ? ' Atölyemiz Tarafından Merkeze İletilen Malzeme Talepleri' : ' İllerden Merkeze İletilen Malzeme Tedarik Talepleri (Onay & Sevk Paneli)') + '</span>' +
      '<span class="badge-count">' + list.length + ' talep</span></div>' +
    '<div class="table-wrapper"><table><thead><tr>' +
      '<th>TALEP NO</th><th>ATÖLYE / İL</th><th>MALZEME KAPSAMI</th><th>ADET</th><th>ÖNCELİK</th><th>GEREKÇE</th><th>TARİH</th><th>DURUM</th>' +
      (!kilitli ? '<th>İŞLEM</th>' : '') +
      '</tr></thead><tbody>' +
    (list.length ? list.map(t => {
      const stCls = t.durum.includes("Onay") ? "status-pill tamam" : t.durum.includes("Red") ? "status-pill gecikti" : "status-pill bekliyor";
      return '<tr>' +
        '<td class="tabular-date"><b>' + esc(t.id) + '</b></td>' +
        '<td><span style="font-weight:700;color:var(--ink-900)">' + esc(bIdx[t.birim] ? bIdx[t.birim].il : "Genel") + '</span></td>' +
        '<td class="task-title">' + esc(t.malzeme) + '</td>' +
        '<td class="tabular-date"><b>' + t.adet + '</b></td>' +
        '<td>' + prPill(t.oncelik) + '</td>' +
        '<td style="font-size:12px;color:var(--ink-600);max-width:260px">' + esc(t.gerekce || "—") + '</td>' +
        '<td class="tabular-date">' + fmt(t.tarih) + '</td>' +
        '<td><span class="' + stCls + '">' + esc(t.durum) + '</span></td>' +
        (!kilitli ?
          '<td><div style="display:flex;gap:6px">' +
            (t.durum === "Bekliyor" ?
              '<button class="btn sm" style="background:#16A34A" data-taleponayla="' + t.id + '">' + ic("i-check") + 'Onayla & Sevk Et</button>' +
              '<button class="btn danger sm" data-talepred="' + t.id + '">Reddet</button>'
              : '<span style="font-size:11px;color:var(--ink-400)">İşlem yapıldı</span>') +
          '</div></td>' : '') +
        '</tr>';
    }).join('') : '<tr><td colspan="9"><div style="text-align:center;padding:24px;color:var(--ink-400)">Henüz merkeze iletilen bir malzeme talebi bulunmuyor.</div></td></tr>') +
    '</tbody></table></div></div>';
}

function vEnvanter() {
  const u = me();
  const kilitli = u.rol === "egitmen" || u.rol === "il";
  const f = S.envFilt;
  let list = envGorunur();
  if (!kilitli) {
    if (f.bolge) list = list.filter(e => bBolge(e.birim) === f.bolge);
    if (f.il) list = list.filter(e => bIdx[e.birim].il === f.il);
    if (f.birim) list = list.filter(e => e.birim === f.birim);
  }
  if (f.faz) list = list.filter(e => envKat(e).faz === f.faz);
  if (f.kat) list = list.filter(e => envKat(e).kat === f.kat);
  if (f.sadeceEksik) list = list.filter(e => envDurum(e) !== "Yeterli");
  if (f.sadeceVade) list = list.filter(e => envVadeGun(e) < 0);

  const hepsi = envGorunur();
  const eksik = hepsi.filter(e => envDurum(e) === "Eksik").length;
  const tuken = hepsi.filter(e => envDurum(e) === "Tükendi").length;
  const vadeGecen = hepsi.filter(e => envVadeGun(e) < 0).length;
  const yaz = yazabilir();
  const bidler = kilitli ? [u.birim] : (f.birim ? [f.birim] : BIRIM.map(b => b.id));
  const oz = fazOzet(bidler);
  const genelPc = Math.round(oz.reduce((a, x) => a + x.yeterli, 0) / Math.max(1, oz.reduce((a, x) => a + x.toplam, 0)) * 100);

  return page(kilitli ? bIdx[u.birim].il + " / " + bIdx[u.birim].ad : "Atölye Altyapısı", "Envanter ve Malzeme Yönetimi",
    (kilitli ? '<button class="btn" style="background:#0284C7" data-envtalepac="1">' + ic("i-box") +
      (S.envTalepFormAcik ? "Talebi Gizle" : "Merkeze Malzeme Talebi İlet") + '</button>' : '') +
    (kilitli ? '<button class="btn" data-envekleac="1">' + ic("i-plus") +
      (S.envEkleAcik ? "Formu Gizle" : "Katalogdan Malzeme Ekle") + '</button>' : '') +
    (yaz ? '<button class="btn ghost" data-envsayim="1">' + ic("i-check") + 'Sayımı Bugüne İşle</button>' : '') +
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    (!kilitli ?
      '<div class="note" style="margin-bottom:16px;background:#F0F9FF;border:1px solid #BAE6FD;color:#0369A1;padding:10px 14px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:8px">' +
        ic("i-info") + ' <b>Rol & Yetki Kuralları:</b> Merkez Operasyon Ekibi illerden gelen malzeme tedarik taleplerini inceler ve onaylar/sevk eder. Malzeme talebini iller (İl Sorumluları) gönderir.</div>' :
      '<div class="note" style="margin-bottom:16px;background:#F0FDF4;border:1px solid #BBF7D0;color:#15803D;padding:10px 14px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:8px">' +
        ic("i-info") + ' <b>Rol & Yetki Kuralları:</b> İl Sorumlusu olarak atölyenizdeki eksik malzemeler için <b>"Merkeze Malzeme Talebi İlet"</b> butonunu kullanarak Genel Merkez\'den malzeme sevkiyatı talep edebilirsiniz.</div>') +
    '<div class="kpi-grid">' +
      kpi(hepsi.length, "Takip Edilen Kalem") +
      kpi(eksik, "Asgari Altında Kalem", "var(--astro-orange)") +
      kpi(tuken, "Tükenen Kalem", "var(--astro-red)") +
      kpi(vadeGecen, "Sayım Vadesi Geçen", vadeGecen ? "var(--astro-red)" : "#16A34A") +
      kpi("%" + genelPc, "Müfredat Hazırlığı", genelPc >= 85 ? "#16A34A" : "var(--astro-orange)") +
    '</div>' +
    (kilitli && S.envTalepFormAcik ? talepFormuPanel(u.birim) : '') +
    (kilitli && S.envEkleAcik ? eklePaneli(u.birim) : '') +
    '<div class="filter-bar">' +
      (kilitli ? '' :
        '<div class="form-group"><label>BÖLGE</label><select data-ef="bolge"><option value="">Tümü</option>' +
          BOLGE.map(x => '<option' + (x === f.bolge ? " selected" : "") + '>' + x + '</option>').join('') + '</select></div>' +
        '<div class="form-group"><label>ATÖLYE</label><select data-ef="birim"><option value="">Tümü</option>' +
          BIRIM.map(b => '<option value="' + b.id + '"' + (b.id === f.birim ? " selected" : "") + '>' +
            esc(b.il + " / " + b.ad) + '</option>').join('') + '</select></div>') +
      '<div class="form-group" style="min-width:220px"><label>EĞİTİM FAZI</label><select data-ef="faz">' +
        '<option value="">Tüm Fazlar</option>' + fazSecenek(f.faz) + '</select></div>' +
      '<div class="form-group"><label>KATEGORİ</label><select data-ef="kat"><option value="">Tümü</option>' +
        ENV_KAT.map(k => '<option' + (k === f.kat ? " selected" : "") + '>' + k + '</option>').join('') + '</select></div>' +
      '<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--ink-700);cursor:pointer">' +
        '<input type="checkbox" data-ef="sadeceEksik"' + (f.sadeceEksik ? " checked" : "") + '> Yalnızca Eksik Kalemler</label>' +
    '</div>' +
    '<div class="grid g-2-1">' +
      '<div class="panel"><div class="panel-header"><span>Malzeme Envanteri</span><span class="badge-count">' + list.length + ' kalem</span></div>' +
        '<div class="table-wrapper"><table><thead><tr><th>MALZEME</th><th>FAZ</th>' + (kilitli ? "" : "<th>ATÖLYE</th>") +
          '<th>MEVCUT</th><th>ASGARİ</th><th>DURUM</th><th>SAYIM VADESİ</th>' + (yaz ? '<th>İŞLEM</th>' : '') +
          '</tr></thead><tbody>' +
        (list.length ? list.map(e => {
          const m = envKat(e);
          return '<tr><td class="task-title">' + esc(m.ad) + '<small>' + esc(m.kod) + ' · ' + esc(m.kat) + '</small></td>' +
            '<td class="tabular-date">' + esc(fIdx[m.faz].kisa) + '</td>' +
            (kilitli ? '' : '<td class="tabular-date">' + esc(bIdx[e.birim].il) + '</td>') +
            '<td>' + (yaz
              ? '<span class="qty-control"><button data-envdelta="' + e.id + '" data-dv="-1">−</button><span>' + e.adet +
                '</span><button data-envdelta="' + e.id + '" data-dv="1">+</button></span>'
              : '<span class="tabular-date">' + e.adet + '</span>') + '</td>' +
            '<td class="tabular-date">' + m.min + '</td><td>' + envPill(e) + '</td><td>' + vadePill(e) + '</td>' +
            (yaz ? '<td>' + (envDurum(e) !== "Yeterli"
              ? '<button class="btn ghost sm" data-envbildir="' + e.id + '" title="Tedarik Görevi Aç">Tedarik</button>' : '') + '</td>' : '') +
            '</tr>';
        }).join('') : '<tr><td colspan="8"><div style="text-align:center;padding:30px;color:var(--ink-400)">Kayıt bulunmuyor.</div></td></tr>') +
        '</tbody></table></div></div>' +
      '<div>' +
        '<div class="panel"><div class="panel-header"><span>DENEYAP Eğitim Fazları Hazırlığı</span></div>' +
        '<div class="panel-body"><div class="bars-list">' +
        oz.map(x => '<div class="bar-item"><div><div class="bar-name">' + esc(x.f.ad) +
          '</div><div class="bar-track"><div class="bar-fill" style="width:' + x.pc + '%;background:' +
          (x.pc >= 85 ? '#16A34A' : x.pc >= 60 ? 'var(--astro-orange)' : 'var(--astro-red)') +
          '"></div></div></div><div class="bar-percent">%' + x.pc + '</div></div>').join('') +
        '</div></div></div>' +
      '</div>' +
    '</div>' +
    malzemeTalepleriPanel());
}

function eklePaneli(bid) {
  const secilebilir = eksikKalemler(bid);
  return '<div class="panel" style="margin-bottom:16px"><div class="panel-header"><span>Merkez Kataloğundan Atölyeye Malzeme Ekle</span></div>' +
    '<div class="panel-body"><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
      '<div class="form-group" style="flex:1;min-width:240px"><label>KATALOG KALEMİ</label><select id="ekKod">' +
        secilebilir.map(m => '<option value="' + m.kod + '">' + esc(m.ad) + ' (Asgari ' + m.min + ', ' + m.periyot + ' günde bir sayım)</option>').join('') +
      '</select></div>' +
      '<div class="form-group" style="width:120px"><label>MEVCUT ADET</label><input type="text" id="ekAdet" placeholder="10"></div>' +
      '<button class="btn" data-envekle="1">' + ic("i-plus") + 'Envantere Tanımla</button>' +
    '</div></div></div>';
}

const envPill = e => {
  const d = envDurum(e);
  const c = d === "Tükendi" ? "status-pill gecikti" : d === "Eksik" ? "status-pill bekliyor" : "status-pill tamam";
  return '<span class="' + c + '">' + UP(d) + '</span>';
};

function vadePill(e) {
  const g = envVadeGun(e);
  if (g < 0) return '<span class="soon-pill danger">🔥 ' + (-g) + ' gün gecikti</span>';
  if (g <= 7) return '<span class="soon-pill">⚠️ ' + g + ' gün</span>';
  return '<span class="tabular-date">' + fmt(envVade(e)) + '</span>';
}

/* ── 12. MALZEME KATALOĞU (MERKEZ) ── */
function vKatalog() {
  return page("Merkez Operasyon", "DENEYAP Malzeme Kataloğu",
    '<button class="btn ghost" data-go="envanter">← Envantere Dön</button>',
    ipucu("Merkez katalogdaki tüm asgari seviyeler ve sayım periyotları 12 il atölyesine anında referans olarak yansır.") +
    '<div class="panel"><div class="panel-header"><span>Merkez Malzeme Kataloğu</span><span class="badge-count">' + ENV_KATALOG.length + ' kalem</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th>KOD</th><th>MALZEME</th><th>EĞİTİM FAZI</th><th>KATEGORİ</th><th>ASGARİ STOK</th><th>SAYIM PERİYODU</th></tr></thead><tbody>' +
    ENV_KATALOG.map(m => '<tr><td class="tabular-date">' + esc(m.kod) + '</td><td class="task-title">' + esc(m.ad) + '</td>' +
      '<td class="tabular-date">' + esc(fIdx[m.faz].ad) + '</td><td>' + esc(m.kat) + '</td><td class="tabular-date">' + m.min +
      '</td><td class="tabular-date">' + m.periyot + ' gün</td></tr>').join('') +
    '</tbody></table></div></div>');
}

/* ── 13. GENEL RİSK ANALİZİ ── */
function birimRisk(bid) {
  const acik = TASKS.filter(t => t.birim === bid && t.durum !== "Tamamlandı");
  const gorevSkor = acik.length ? Math.round(acik.reduce((a, t) => a + risk(t).skor, 0) / acik.length) : 0;
  const env = ENVANTER.filter(e => e.birim === bid);
  const eksik = env.filter(e => envDurum(e) !== "Yeterli").length;
  const envSkor = env.length ? Math.min(100, Math.round(eksik / env.length * 100 * 2)) : 0;
  const vade = env.filter(e => envVadeGun(e) < 0).length;
  const sayimSkor = Math.min(100, vade * 6);
  const toplam = Math.min(100, Math.round(gorevSkor * 0.45 + envSkor * 0.35 + sayimSkor * 0.2));
  return { bid, b:bIdx[bid], gorevSkor, eksik, envSkor, vade, sayimSkor, toplam };
}
const tumRisk = () => BIRIM.map(b => birimRisk(b.id)).sort((a, b) => b.toplam - a.toplam);

function yoneticiInfografikBanner(r) {
  if (!r || !r.length) return '';
  const enYuksek = r[0];
  const enDusuk = r[r.length - 1];
  const ortSkor = Math.round(r.reduce((a, x) => a + x.toplam, 0) / r.length);
  const yuksekRiskliCount = r.filter(x => x.toplam >= 50).length;
  const dusukRiskliCount = r.filter(x => x.toplam < 30).length;

  const bolgeMap = {};
  r.forEach(x => {
    const bl = x.b.bolge;
    if (!bolgeMap[bl]) bolgeMap[bl] = { bolge: bl, toplam: 0, sayi: 0 };
    bolgeMap[bl].toplam += x.toplam;
    bolgeMap[bl].sayi++;
  });
  const bolgeSiralama = Object.values(bolgeMap).map(x => ({
    bolge: x.bolge,
    skor: Math.round(x.toplam / x.sayi),
    atolyeSayisi: x.sayi
  })).sort((a, b) => b.skor - a.skor);

  const toplamGorev = TASKS.length;
  const tamamlananGorev = TASKS.filter(t => t.durum === "Tamamlandı").length;
  const gorevUyumYuzdesi = Math.round((tamamlananGorev / Math.max(1, toplamGorev)) * 100);

  const envYeterliCount = ENVANTER.filter(e => envDurum(e) === "Yeterli").length;
  const envStokYuzdesi = Math.round((envYeterliCount / Math.max(1, ENVANTER.length)) * 100);

  return '<div class="panel" style="margin-bottom:22px;background:linear-gradient(135deg, #1C2033 0%, #0F172A 100%);color:#FFFFFF;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 12px 30px -5px rgba(0,0,0,0.3)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
        '<span style="background:linear-gradient(135deg, #D32F2F 0%, #EF4444 100%);color:#FFF;padding:12px;border-radius:12px;display:inline-flex;box-shadow:0 4px 12px rgba(211,47,47,0.4)">' + ic("i-chart") + '</span>' +
        '<div><h3 style="margin:0;font-size:19px;font-weight:800;color:#F8FAFC;letter-spacing:-0.3px">TÜRKİYE DENEYAP ATÖLYELERİ YÖNETİCİ STRATEJİ & İNFOGRAFİK RADARI</h3>' +
        '<span style="font-size:12.5px;color:#94A3B8">Genel merkez yönetim radarı, risk indeksi ve saha operasyon analizleri</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<span class="badge" style="background:rgba(239,68,68,0.25);color:#F87171;border:1px solid rgba(239,68,68,0.4);font-weight:700;font-size:12px;padding:6px 12px">' + yuksekRiskliCount + ' Kritik Atölye</span>' +
        '<span class="badge" style="background:rgba(16,185,129,0.25);color:#34D399;border:1px solid rgba(16,185,129,0.4);font-weight:700;font-size:12px;padding:6px 12px">' + dusukRiskliCount + ' Başarılı Atölye</span>' +
      '</div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:22px">' +
      '<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;border-left:4px solid #EF4444">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">EN YÜKSEK RİSKLİ ATÖLYE</div>' +
        '<div style="font-size:20px;font-weight:800;color:#F87171;margin:4px 0">' + esc(enYuksek.b.il) + ' <span style="font-size:13px;color:#FCA5A5">(Skor: ' + enYuksek.toplam + ')</span></div>' +
        '<div style="font-size:11.5px;color:#CBD5E1">' + esc(enYuksek.b.ad) + ' · Müdahale Gerekli</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;border-left:4px solid #10B981">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">EN GÜVENLİ / BAŞARILI ATÖLYE</div>' +
        '<div style="font-size:20px;font-weight:800;color:#34D399;margin:4px 0">' + esc(enDusuk.b.il) + ' <span style="font-size:13px;color:#A7F3D0">(Skor: ' + enDusuk.toplam + ')</span></div>' +
        '<div style="font-size:11.5px;color:#CBD5E1">' + esc(enDusuk.b.ad) + ' · Yüksek Performans</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;border-left:4px solid #3B82F6">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">TÜRKİYE BİRLEŞİK RİSK ENDEKSİ</div>' +
        '<div style="font-size:20px;font-weight:800;color:#60A5FA;margin:4px 0">' + ortSkor + ' / 100</div>' +
        '<div style="font-size:11.5px;color:#CBD5E1">12 Atölye Genel Ağırlıklı Ortalaması</div>' +
      '</div>' +

      '<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;border-left:4px solid #F59E0B">' +
        '<div style="font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.5px">SAHA AKSAKLIK UYARILARI</div>' +
        '<div style="font-size:20px;font-weight:800;color:#FBBF24;margin:4px 0">' + TASKS.filter(t => t.durum === "Gecikti").length + ' Gecikme Uyarısı</div>' +
        '<div style="font-size:11.5px;color:#CBD5E1">Öncelikli Takip Gerektiren Görev</div>' +
      '</div>' +
    '</div>' +

    '<div style="background:rgba(255,255,255,0.03);padding:18px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:20px">' +
      '<div style="font-size:12px;font-weight:700;color:#94A3B8;margin-bottom:14px">GENEL MERKEZ OPERASYONEL İNFOGRAFİK METRİKLERİ</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px">' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#CBD5E1;font-weight:600">Görev Tamamlanma Uyum Oranı</span><b style="color:#60A5FA">%' + gorevUyumYuzdesi + '</b></div>' +
          '<div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden"><div style="width:' + gorevUyumYuzdesi + '%;height:100%;background:linear-gradient(90deg, #3B82F6, #60A5FA);border-radius:4px"></div></div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#CBD5E1;font-weight:600">Envanter & Stok Yeterliliği</span><b style="color:#34D399">%' + envStokYuzdesi + '</b></div>' +
          '<div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden"><div style="width:' + envStokYuzdesi + '%;height:100%;background:linear-gradient(90deg, #10B981, #34D399);border-radius:4px"></div></div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#CBD5E1;font-weight:600">Sınıf Katılım & Yoklama Disiplini</span><b style="color:#FBBF24">%92</b></div>' +
          '<div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden"><div style="width:92%;height:100%;background:linear-gradient(90deg, #F59E0B, #FBBF24);border-radius:4px"></div></div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:#CBD5E1;font-weight:600">Protokol & Sezon Müfredat Hazırlığı</span><b style="color:#A78BFA">%88</b></div>' +
          '<div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden"><div style="width:88%;height:100%;background:linear-gradient(90deg, #8B5CF6, #A78BFA);border-radius:4px"></div></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div>' +
      '<div style="font-size:12px;font-weight:700;color:#94A3B8;margin-bottom:12px">BÖLGELER BAZINDA ORTALAMA RİSK DAĞILIMI (İNFOGRAFİK BÖLGE ISI HARİTASI)</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">' +
        bolgeSiralama.map((item) => {
          const cls = item.skor >= 50 ? "#EF4444" : item.skor >= 30 ? "#F59E0B" : "#10B981";
          return '<div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;margin-bottom:6px">' +
              '<span style="font-weight:700;color:#F1F5F9">' + esc(item.bolge) + '</span>' +
              '<span style="font-weight:800;color:' + cls + '">Skor: ' + item.skor + '</span>' +
            '</div>' +
            '<div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">' +
              '<div style="width:' + item.skor + '%;height:100%;background:' + cls + ';border-radius:3px"></div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +
  '</div>';
}

function atolyeRiskDetayModal(bid) {
  const r = birimRisk(bid);
  if (!r) return '';
  const b = r.b;
  const gorevler = TASKS.filter(t => t.birim === bid && t.durum !== "Tamamlandı");
  const envEksik = ENVANTER.filter(e => e.birim === bid && envDurum(e) !== "Yeterli");

  return '<div class="modal-backdrop" data-riskdetaykapat="1">' +
    '<div class="modal-card" style="max-width:750px" onclick="event.stopPropagation()">' +
      '<div class="modal-header">' +
        '<div>' +
          '<h3 style="margin:0;font-size:17px;font-weight:700;color:var(--ink-900)">' + ic("i-alert") + ' ' + esc(b.il + " / " + b.ad) + ' Risk & Operasyon Analizi</h3>' +
          '<div style="font-size:12.5px;color:var(--ink-500);margin-top:3px">Bölge: ' + esc(b.bolge) + ' · Genel Risk Skoru: <b style="color:' + riskColor(r.toplam) + '">' + r.toplam + ' / 100</b></div>' +
        '</div>' +
        '<button class="modal-close" data-riskdetaykapat="1">✕</button>' +
      '</div>' +

      '<div class="modal-body">' +
        '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:18px;background:var(--bg-wash);padding:14px;border-radius:10px;border:1px solid var(--card-border)">' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">GÖREV RİSK SKORU</div><div style="font-size:22px;font-weight:800;color:' + riskColor(r.gorevSkor) + '">' + r.gorevSkor + '</div><div style="font-size:11px;color:var(--ink-500)">' + gorevler.length + ' Aktif Görev</div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">ENVANTER EKSİK SKORU</div><div style="font-size:22px;font-weight:800;color:' + riskColor(r.envSkor) + '">' + r.envSkor + '</div><div style="font-size:11px;color:var(--ink-500)">' + r.eksik + ' Eksik Kalem</div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:var(--ink-500)">SAYIM VADE GECİKMESİ</div><div style="font-size:22px;font-weight:800;color:' + riskColor(r.sayimSkor) + '">' + r.sayimSkor + '</div><div style="font-size:11px;color:var(--ink-500)">' + r.vade + ' Sayım Vadesi Geçen</div></div>' +
        '</div>' +

        '<div style="font-weight:700;font-size:13px;color:var(--ink-900);margin-bottom:8px">Atölyedeki Geciken ve Devam Eden Görevler (' + gorevler.length + ')</div>' +
        '<div class="table-wrapper" style="max-height:200px;overflow-y:auto;margin-bottom:16px"><table><thead><tr><th>GÖREV</th><th>TERMİN</th><th>DURUM</th></tr></thead><tbody>' +
        (gorevler.length ? gorevler.map(t => '<tr><td class="task-title"><b>' + esc(t.baslik) + '</b></td><td class="tabular-date">' + fmt(t.termin) + '</td><td>' + stPill(t.durum) + '</td></tr>').join('')
          : '<tr><td colspan="3"><div style="text-align:center;padding:16px;color:var(--ink-400)">Geciken görev bulunmuyor.</div></td></tr>') +
        '</tbody></table></div>' +

        '<div style="font-weight:700;font-size:13px;color:var(--ink-900);margin-bottom:8px">Eksik / Asgari Altında Malzemeler (' + envEksik.length + ')</div>' +
        '<div class="table-wrapper" style="max-height:180px;overflow-y:auto"><table><thead><tr><th>MALZEME</th><th>MEVCUT</th><th>ASGARİ</th><th>DURUM</th></tr></thead><tbody>' +
        (envEksik.length ? envEksik.map(e => {
          const m = envKat(e);
          return '<tr><td class="task-title"><b>' + esc(m.ad) + '</b></td><td class="tabular-date">' + e.adet + '</td><td class="tabular-date">' + m.min + '</td><td>' + envPill(e) + '</td></tr>';
        }).join('') : '<tr><td colspan="4"><div style="text-align:center;padding:16px;color:var(--ink-400)">Eksik malzeme bulunmuyor.</div></td></tr>') +
        '</tbody></table></div>' +
      '</div>' +

      '<div class="modal-footer" style="display:flex;justify-content:space-between">' +
        '<button class="btn ghost sm" data-git="gorevler" data-efbirim="' + bid + '">Görevlere Git</button>' +
        '<button class="btn" data-riskdetaykapat="1">Kapat</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function vRiskpano() {
  const r = tumRisk();
  return page("Yönetim Radarı", "Tüm Atölyeler Genel Risk Paneli",
    '<button class="btn ghost" data-aktar="risk">' + ic("i-down") + 'Risk Raporu İndir</button>' +
    '<button class="btn ghost" onclick="window.print()">' + ic("i-file") + 'Yazdır</button>',
    yoneticiInfografikBanner(r) +
    ipucu("Görev gecikmeleri, envanter eksikleri ve sayım vadesi gecikmeleri tek bir birleşik risk endeksinde ağırlıklandırılır.") +
    '<div class="panel"><div class="panel-header"><span>Atölye Risk Analiz Tablosu</span><span class="badge-count">' + r.length + ' atölye</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th>ATÖLYE</th><th>BÖLGE</th><th>GÖREV RİSKİ</th><th>ENVANTER RİSKİ</th><th>SAYIM RİSKİ</th><th>GENEL RİSK ENDEKSİ</th><th>DETAY</th></tr></thead><tbody>' +
    r.map(x => '<tr style="cursor:pointer" data-riskdetay="' + x.bid + '">' +
      '<td class="task-title"><b>' + esc(x.b.il) + '</b><small>' + esc(x.b.ad) + '</small></td>' +
      '<td class="tabular-date">' + esc(x.b.bolge) + '</td>' +
      '<td class="tabular-date" style="color:' + riskColor(x.gorevSkor) + '">' + x.gorevSkor + '</td>' +
      '<td class="tabular-date" style="color:' + riskColor(x.envSkor) + '">' + x.envSkor + '</td>' +
      '<td class="tabular-date" style="color:' + riskColor(x.sayimSkor) + '">' + x.sayimSkor + '</td>' +
      '<td><span class="risk-meter"><span class="risk-track" style="width:70px"><span class="risk-fill" style="width:' + x.toplam +
      '%;background:' + riskColor(x.toplam) + '"></span></span><span class="risk-score">' + x.toplam + '</span></span></td>' +
      '<td><button class="btn ghost sm" data-riskdetay="' + x.bid + '">' + ic("i-search") + ' İncele</button></td>' +
      '</tr>').join('') +
    '</tbody></table></div></div>' +
    (S.riskDetay ? atolyeRiskDetayModal(S.riskDetay) : ''));
}

/* ── 14. EĞİTMEN PROFİLİ ── */
function vProfil() {
  const u = me();
  const egitmenler = u.rol === "egitmen" ? [u] : USER.filter(x => x.rol === "egitmen");
  const pid = egitmenler.some(x => x.id === S.profilId) ? S.profilId : egitmenler[0].id;
  const e = uIdx[pid];
  const gorevler = TASKS.filter(t => t.sorumlu === pid);
  const tamam = gorevler.filter(t => t.durum === "Tamamlandı");
  const kayit = YOKLAMA.filter(y => y.egitmen === pid);
  const ort = kayit.length ? Math.round(kayit.reduce((a, y) => a + yokOran(y), 0) / kayit.length) : 0;

  return page(bIdx[e.birim].il + " / " + bIdx[e.birim].ad, e.ad + " · Eğitmen Profili",
    '<button class="btn ghost" data-sor="1">' + ic("i-ask") + 'Sor</button>',
    '<div class="kpi-grid">' +
      kpi(gorevler.length, "Atanan Görev") +
      kpi(tamam.length, "Tamamlanan", "#16A34A") +
      kpi("%" + ort, "Sınıf Katılım Ortalaması", ort >= 85 ? "#16A34A" : "var(--astro-orange)") +
      kpi(kayit.length, "Alınan Yoklama") +
    '</div>' +
    '<div class="panel"><div class="panel-header"><span>Eğitmene Atanan Görevler</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>ATÖLYE</th><th>TERMİN</th><th>RİSK</th><th>DURUM</th></tr></thead><tbody>' +
    taskRows(gorevler, { oncelik:false }) + '</tbody></table></div></div>');
}

/* ── 15. DUYURULAR ── */
function vDuyuru() {
  const u = me();
  const yayinci = u.rol === "merkez" || u.rol === "koord";
  const list = duyuruBana(u.id);

  return page("Merkez & Bölgesel İletişim", "Duyurular",
    (yayinci ? '<button class="btn" data-duyuruac="1">' + ic("i-plus") + (S.duyuruYeniAcik ? "Formu Kapat" : "Yeni Duyuru") + '</button>' : ''),
    ipucu("Duyurular 81 ilin tamamına, belirli bir bölgeye veya role hedeflenebilir.") +
    (yayinci && S.duyuruYeniAcik ?
      '<div class="panel" style="margin-bottom:16px"><div class="panel-header"><span>Yeni Duyuru Yayınla</span></div><div class="panel-body">' +
        '<div style="display:grid;grid-template-columns:1fr;gap:12px">' +
          '<div class="form-group"><label>BAŞLIK</label><input type="text" id="dyBaslik" placeholder="Duyuru başlığı..."></div>' +
          '<div class="form-group"><label>METİN</label><textarea id="dyMetin" placeholder="Duyuru metni..."></textarea></div>' +
          '<button class="btn" data-duyuruyayin="1">' + ic("i-mega") + 'Yayınla ve Bildir</button>' +
        '</div></div></div>' : '') +
    '<div style="display:flex;flex-direction:column;gap:12px">' +
    list.map(d => '<div class="panel' + (d.onemli ? ' style="border-left:4px solid var(--astro-red)"' : '') + '">' +
      '<div class="panel-body">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
        '<div><h4 style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink-900)">' + esc(d.baslik) + '</h4>' +
        '<div style="font-size:11px;color:var(--ink-500);font-family:var(--font-mono);margin-top:3px">' + UP(d.tip) + ' · ' + fmtLong(d.tarih) + ' · ' + UP(hedefAd(d.hedef)) + '</div></div>' +
        (!d.okuyan.includes(u.id) ? '<button class="btn ghost sm" data-duyuruoku="' + d.id + '">Okundu Yap</button>' : '<span class="status-pill tamam">OKUNDU</span>') +
      '</div>' +
      '<p style="margin-top:10px;font-size:13px;color:var(--ink-700);line-height:1.6">' + esc(d.metin) + '</p>' +
      '</div></div>').join('') + '</div>');
}

/* ── 16. KOMİSYONLAR ── */
function vKomisyon() {
  const u = me();
  const hepsi = (u.rol === "merkez" || u.rol === "koord" || u.rol === "yonetici") ? KOMISYON : komisyonlarim(u.id);
  const kid = hepsi.some(k => k.id === S.komId) ? S.komId : (hepsi[0] ? hepsi[0].id : "k1");
  const k = kIdx[kid];
  const komGorev = TASKS.filter(t => t.komisyon === kid);

  return page("Merkez Yönetim", "Çalışma Komisyonları", "",
    '<div class="tab-pills">' + hepsi.map(x =>
      '<button class="tab-pill' + (x.id === kid ? " on" : "") + '" data-kom="' + x.id + '">' + esc(x.ad) + '</button>').join('') + '</div>' +
    '<div class="panel"><div class="panel-header"><span>' + esc(k.ad) + ' · Görevler</span></div>' +
    '<div class="table-wrapper"><table><thead><tr><th>GÖREV</th><th>SORUMLU</th><th>TERMİN</th><th>RİSK</th><th>DURUM</th></tr></thead><tbody>' +
    taskRows(komGorev) + '</tbody></table></div></div>');
}

/* ── 17. AYARLAR ── */
function vAyarlar() {
  const u = me();
  return page("Kullanıcı", "Sistem Ayarları", "",
    '<div class="panel" style="max-width:700px"><div class="panel-header"><span>Görünüm ve Yapay Zekâ Tercihleri</span></div>' +
      '<div class="panel-body">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--card-border)">' +
        '<div><b>Yapay Zekâ Önerilerini Göster</b><div style="font-size:12px;color:var(--ink-500)">Risk gerekçeleri ve aksiyon tavsiyelerini etkinleştirir.</div></div>' +
        '<input type="checkbox" data-ayar="oneriler"' + (S.ayar.oneriler ? " checked" : "") + ' style="width:20px;height:20px">' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--card-border)">' +
        '<div><b>Açıklama ve İpuçlarını Göster</b><div style="font-size:12px;color:var(--ink-500)">Sayfa başlarındaki rehber metinleri açıp kapatır.</div></div>' +
        '<input type="checkbox" data-ayar="ipuclari"' + (S.ayar.ipuclari ? " checked" : "") + ' style="width:20px;height:20px">' +
      '</div>' +
      '<div style="margin-top:16px;font-size:12.5px;color:var(--ink-500)">Giriş Yapılan Hesap: <b>' + esc(u.ad) + '</b> (' + ROL[u.rol] + ')</div>' +
      '</div></div>');
}

/* ── 18. BİLDİRİM MERKEZİ ── */
function vBildirim() {
  const list = NOTIF.filter(n => n.user === S.userId);
  return page("Bildirimler", "Bildirim Merkezi",
    (list.some(n => !n.okundu) ? '<button class="btn ghost" data-okundu="1">Tümünü Okundu Say</button>' : ''),
    '<div class="panel"><div class="panel-header"><span>Gelen Bildirimler</span><span class="badge-count">' + list.length + ' bildirim</span></div>' +
    (list.length ? '<div style="display:flex;flex-direction:column">' +
      list.map(n => '<div class="notice-row' + (n.okundu ? "" : " unread") + '" data-git="' + (n.gorev || "") + '">' +
        '<span class="notice-icon" style="background:rgba(230,57,70,0.1);color:var(--astro-red)">' + ic(NIKON[n.tip] || "i-bell") + '</span>' +
        '<div class="notice-content"><b>' + esc(n.metin) + '</b><span>' + fmtLong(n.tarih) + ' · ' + (NTIP[n.tip] || n.tip) + '</span></div>' +
      '</div>').join('') + '</div>' : '<div style="text-align:center;padding:40px;color:var(--ink-400)">Bildiriminiz bulunmuyor.</div>') +
    '</div>');
}

/* ══════════════════════════════════════════════════════════════════════
   PANO ALT SATIRI, KONTROL LİSTESİ, EKLER, YORUMLAR
   ══════════════════════════════════════════════════════════════════════ */
function panoAltSira() {
  const envUyari = ENVANTER.filter(e => envDurum(e) !== "Yeterli").slice(0, 6);
  const sonYok = YOKLAMA.slice().sort((a, b) => D(b.tarih) - D(a.tarih)).slice(0, 6);
  const acik = TASKS.filter(t => t.durum !== "Tamamlandı");
  const kat = KAT.map(k => ({
    k, n:acik.filter(t => t.kategori === k).length,
    g:acik.filter(t => t.kategori === k && t.durum === "Gecikti").length
  }));
  const enB = Math.max(1, ...kat.map(x => x.n));

  return '<div class="grid g-3" style="margin-top:18px">' +
    '<div class="panel"><div class="panel-header"><span>' + ic("i-box") + ' Envanter Uyarıları</span></div>' +
      '<div class="table-wrapper"><table style="min-width:0"><thead><tr><th>MALZEME</th><th>BİRİM</th><th>STOK</th><th>DURUM</th></tr></thead><tbody>' +
      envUyari.map(e => '<tr><td class="task-title" style="min-width:0;font-size:12px">' + esc(envAd(e)) + '</td>' +
        '<td class="tabular-date">' + esc(bIdx[e.birim].il) + '</td><td class="tabular-date">' + e.adet + "/" + envMin(e) + '</td>' +
        '<td>' + envPill(e) + '</td></tr>').join('') +
      '</tbody></table></div>' +
      '<div class="panel-footer"><a href="#" data-go="envanter">Envantere git →</a></div></div>' +

    '<div class="panel"><div class="panel-header"><span>' + ic("i-check") + ' Son Alınan Yoklamalar</span></div>' +
      '<div class="table-wrapper"><table style="min-width:0"><thead><tr><th>GRUP</th><th>BİRİM</th><th>KATILIM</th></tr></thead><tbody>' +
      sonYok.map(y => {
        const o = yokOran(y), g = gIdx[y.grup];
        return '<tr><td class="task-title" style="min-width:0;font-size:12px">' + esc(g.ad.split(" · ")[0]) + '</td>' +
          '<td class="tabular-date">' + esc(bIdx[g.birim].il) + '</td>' +
          '<td><span class="risk-meter"><span class="risk-track" style="width:40px"><span class="risk-fill" style="width:' + o +
            '%;background:' + (o >= 85 ? '#16A34A' : 'var(--astro-orange)') + '"></span></span><span class="risk-score">%' + o + '</span></span></td></tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<div class="panel-footer"><a href="#" data-go="yoklama">Yoklamaya git →</a></div></div>' +

    '<div class="panel"><div class="panel-header"><span>' + ic("i-chart") + ' Kategori Dağılımı</span></div>' +
      '<div class="panel-body"><div class="bars-list">' + kat.map(x =>
        '<div class="bar-item"><div><div class="bar-name">' + esc(x.k) +
        '</div><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(x.n / enB * 100) + '%;background:var(--astro-blue)"></div></div></div>' +
        '<div class="bar-percent">' + x.n + '</div></div>').join('') +
      '</div></div></div>' +
    '</div>';
}

function adimYuzde(t) {
  if (!t.adimlar || !t.adimlar.length) return t.yuzde;
  return Math.round(t.adimlar.filter(a => a.tamam).length / t.adimlar.length * 100);
}

function adimPanel(t) {
  const ad = t.adimlar || [];
  const bitti = ad.filter(a => a.tamam).length;
  const yaz = yazabilir() && (rolum() === "merkez" || t.sorumlu === S.userId);

  return '<div class="panel"><div class="panel-header"><span>İş Akışı & Kontrol Adımları</span><span class="badge-count">' +
    bitti + " / " + ad.length + ' tamamlandı</span></div><div class="panel-body">' +
    '<div class="progress-card"><span>%' + adimYuzde(t) + '</span><span class="progress-track"><span class="progress-fill" style="width:' +
      adimYuzde(t) + '%"></span></span><span>' + (bitti === ad.length ? "TÜMÜ TAMAM" : (ad.length - bitti) + " ADIM KALDI") + '</span></div>' +
    '<div class="checklist">' + ad.map((a, i) =>
      '<label class="' + (a.tamam ? "done " : "") + '">' +
      '<input type="checkbox"' + (a.tamam ? " checked" : "") + (yaz ? '' : " disabled") +
      ' data-adim="' + t.id + '" data-ai="' + i + '"><em>' + esc(a.ad) + '</em></label>').join('') + '</div>' +
    (yaz && bitti === ad.length && t.durum !== "Tamamlandı"
      ? '<div style="margin-top:14px"><button class="btn" data-bitir="' + t.id + '">' + ic("i-check") + 'Tüm Adımlar Tamamlandı - Görevi Kapat</button></div>' : '') +
    '</div></div>';
}

function ekPanel(t) {
  const yaz = yazabilir() && (rolum() === "merkez" || t.sorumlu === S.userId);
  const ek = t.ekler || [];
  return '<div class="panel" style="margin-top:16px"><div class="panel-header"><span>' + ic("i-file") +
    ' Kanıt, Doküman ve Harici Bağlantılar</span><span class="badge-count">' + ek.length + ' kayıt</span></div><div class="panel-body">' +
    (ek.length ? '<div style="display:flex;flex-direction:column;gap:8px">' +
      ek.map(x => {
        const isUrl = x.url || x.tur === "link";
        const iconLabel = (x.tur && x.tur.includes("pdf")) || (x.ad && x.ad.toLowerCase().endsWith(".pdf")) ? "[PDF Dokümanı]" : isUrl ? "[Harici Bağlantı]" : "[Görsel / Dosya]";
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-subtle);border-radius:var(--radius-sm);border:1px solid var(--card-border)">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:600;color:var(--ink-900)">' + iconLabel + ' ' + esc(x.ad) + '</div>' +
            (x.url ? '<div style="font-size:11px;color:var(--astro-blue);margin-top:2px;font-family:var(--font-mono)"><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.url) + ' ↗</a></div>' : '') +
          '</div>' +
          '<div style="display:flex;gap:6px">' +
            (x.url ? '<a href="' + esc(x.url) + '" target="_blank" class="btn ghost sm">Bağlantıyı Aç ↗</a>' : '') +
            (yaz ? '<button class="btn ghost sm" data-eksil="' + t.id + "|" + x.id + '">Kaldır</button>' : '') +
          '</div>' +
        '</div>';
      }).join('') + '</div>' : '<div style="color:var(--ink-400);font-size:12px">Henüz doküman veya bağlantı eklenmedi.</div>') +
    (yaz ? '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--card-border);display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<label class="btn ghost sm" style="cursor:pointer">' + ic("i-plus") + 'Dosya Yükle' +
        '<input type="file" data-ekyukle="' + t.id + '" multiple style="display:none"></label>' +
      '<button class="btn ghost sm" onclick="const u=prompt(\'Harici Doküman veya Web Bağlantı URLsi girin:\'); if(u){ window.addUrlEk&&window.addUrlEk(\'' + t.id + '\', u); }">URL / Bağlantı Ekle</button>' +
    '</div>' : '') +
    '</div></div>';
}

function yorumPanel(t) {
  const u = me();
  const y = t.yorumlar || [];
  return '<div class="panel" style="margin-top:16px"><div class="panel-header"><span>' + ic("i-chat") +
    ' Görev İletişimi & Revizyon</span><span class="badge-count">' + y.length + ' ileti</span></div><div class="panel-body">' +
    (y.length ? '<div style="display:flex;flex-direction:column;gap:10px">' +
      y.map(x => '<div style="padding:10px;border-radius:var(--radius-sm);background:' + (x.tip === "revizyon" ? '#FFF1F2;border:1px solid #FECDD3' : 'var(--bg-subtle)') + '">' +
        '<div style="font-size:11px;font-family:var(--font-mono);color:var(--ink-500)"><b>' + esc(uIdx[x.kim] ? uIdx[x.kim].ad : "Sistem") + '</b> · ' + fmtLong(x.tarih) +
        (x.tip === "revizyon" ? ' · <span style="color:var(--astro-red);font-weight:700">REVİZYON</span>' : '') + '</div>' +
        '<div style="font-size:13px;color:var(--ink-800);margin-top:3px">' + esc(x.metin) + '</div>' +
        (x.tip === "revizyon" && !x.cozuldu && (t.sorumlu === u.id || u.rol === "merkez")
          ? '<button class="btn sm" style="margin-top:6px" data-yorumcoz="' + t.id + "|" + x.id + '">' + ic("i-check") + 'Revizyonu Tamamladım</button>' : '') +
      '</div>').join('') + '</div>' : '<div style="color:var(--ink-400);font-size:12px">İleti bulunmuyor.</div>') +
    '<div style="margin-top:12px"><textarea id="yorumInp-' + t.id + '" placeholder="İleti veya revizyon notu yazın..." style="min-height:60px"></textarea>' +
      '<div style="display:flex;gap:6px;margin-top:6px">' +
        '<button class="btn sm" data-yorumgonder="' + t.id + '">' + ic("i-chat") + 'Gönder</button>' +
        (u.rol === "merkez" || u.rol === "koord" ? '<button class="btn danger sm" data-revizyon="' + t.id + '">' + ic("i-alert") + 'Revizyon İste</button>' : '') +
      '</div></div>' +
    '</div></div>';
}

/* ══════════════════════════════════════════════════════════════════════
   KABUK VE MODALLER
   ══════════════════════════════════════════════════════════════════════ */
function page(eb, pt, acts, body) {
  return '<div class="page"><div class="page-header"><div><div class="eyebrow">' + esc(eb) + '</div><h2 class="page-title">' + esc(pt) +
    '</h2></div><div class="header-actions">' + zil() + (acts || '') + '</div></div>' + body + '</div>';
}

function sidebar() {
  const u = me();
  const m = MENU[u.rol] || [];
  const un = okunmamis();
  return '<aside>' +
    '<div class="aside-brand">' +
      '<img src="astro_logo.png" alt="ASTRO" class="aside-logo-img">' +
      '<div class="brand-info"><span class="brand-name">ASTRO</span><span class="brand-sub">DENEYAP OPERASYON</span></div>' +
    '</div>' +
    '<nav>' + m.map((g, gi) =>
      (g[0] ? '<div class="nav-group' + (gi === 0 ? ' first' : '') + '">' + g[0] + '</div>' : '') +
      g[1].map(x => {
        const rz = x[0] === "bildirim" ? un : x[0] === "duyuru" ? okunmamisDuyuru(S.userId) : 0;
        return '<button data-go="' + x[0] + '" class="' + (S.view === x[0] ? "on" : "") + '">' + ic(x[2]) + x[1] +
          (rz ? '<span class="badge">' + rz + '</span>' : '') + '</button>';
      }).join('')).join('') + '</nav>' +
    '<div class="user-profile"><span class="user-avatar">' + esc(u.ad.split(" ").map(w => w[0]).join("").slice(0, 2)) + '</span>' +
      '<div class="user-details"><span class="user-name">' + esc(u.ad) + '</span><span class="user-role">' + esc(ROL[u.rol]) +
      (u.birim ? " · " + esc(bIdx[u.birim].il) : "") + '</span></div>' +
      '<button class="logout-btn" data-cikis="1" title="Çıkış Yap / Rol Değiştir">' + ic("i-out") + '</button></div>' +
    '</aside>';
}

function demobar() {
  return '<div class="demobar">' +
    '<span class="demo-pill">DEMO SİMÜLASYONU</span>' +
    '<span>Sistem Tarihi: <b>' + fmtLong(iso(TODAY)) + '</b></span>' +
    '<button class="demo-action-btn" data-ilerle="3">+3 Gün İlerlet</button>' +
    '<button class="demo-action-btn" data-ilerle="7">+7 Gün İlerlet</button>' +
    '<span style="flex:1"></span>' +
    '<span>Aktif Rol: </span>' +
    '<select class="demo-role-select" data-rolsec>' +
    USER.filter(x => (x.rol !== "il" || ["u4","u5","u6"].includes(x.id)) && (x.rol !== "egitmen" || ["u16","u17"].includes(x.id))).map(x =>
      '<option value="' + x.id + '"' + (x.id === S.userId ? " selected" : "") + '>' + x.ad + ' (' + ROL[x.rol] +
      (x.birim ? ' · ' + bIdx[x.birim].il : '') + ')</option>').join('') + '</select>' +
    '</div>';
}

/* ── Bildirim Çanı & Popover ── */
const NTIP = { gecen:"Termin Geçti", yaklasan:"Yaklaşan Termin", risk:"Risk Uyarısı",
  atama:"Yeni Görev", hatirlatma:"Hatırlatma", envanter:"Envanter Uyarısı", yoklama:"Yoklama",
  sayim:"Periyodik Sayım", talep:"Malzeme Talebi", duyuru:"Duyuru", revizyon:"Revizyon",
  yorum:"Görev İletisi", ek:"Kanıt Yüklendi", devamsizlik:"Devamsızlık Sınırı" };
const NIKON = { gecen:"i-clock", yaklasan:"i-clock", risk:"i-alert", atama:"i-list",
  hatirlatma:"i-bell", envanter:"i-box", yoklama:"i-check", sayim:"i-box", talep:"i-box",
  duyuru:"i-mega", revizyon:"i-alert", yorum:"i-chat", ek:"i-file", devamsizlik:"i-user" };

function zil() {
  const un = okunmamis();
  const list = NOTIF.filter(n => n.user === S.userId).slice(0, 6);
  return '<div class="bell-wrapper">' +
    '<button class="btn ghost sm" data-bell="1" title="Bildirimler">' +
      ic("i-bell") + (un ? '<span class="bell-badge">' + un + '</span>' : '') + '</button>' +
    (S.bildirimAcik ? '<div class="notification-popover">' +
      '<div class="popover-header"><span>Bildirimler</span>' +
        (un ? '<button data-okundu="1">Tümünü Okundu Say</button>' : '') + '</div>' +
      '<div class="popover-body">' + (list.length ? list.map(n =>
        '<div class="notice-row' + (n.okundu ? "" : " unread") + '" data-git="' + (n.gorev || "") + '" data-nid="' + n.id + '">' +
          '<span class="notice-icon" style="background:var(--astro-blue-light);color:var(--astro-blue-dark)">' + ic(NIKON[n.tip] || "i-bell") + '</span>' +
          '<div class="notice-content"><b>' + esc(n.metin) + '</b><span>' + fmtLong(n.tarih) + ' · ' + (NTIP[n.tip] || n.tip) + '</span></div></div>'
      ).join('') : '<div style="text-align:center;padding:24px;color:var(--ink-400)">Bildiriminiz yok.</div>') + '</div>' +
      '<div class="popover-footer"><a href="#" data-go="bildirim">Tüm Bildirimleri Aç →</a></div></div>' : '') +
    '</div>';
}

/* ── Yapay Zekâ Sor Çekmecesi (AI Drawer) ── */
const SOR_ORNEK = [
  "Eylül terminlerinde riskli birimler hangileri?",
  "Gecikmiş görevler kimde?",
  "Van'da hangi görevler açık?",
  "Raporlama kategorisinde kaç görev var?"
];

function sorCevap(q) {
  const s = trLower(q);
  let list = TASKS.slice();
  if (/(risk|riskli|tehlike)/.test(s)) list = list.filter(t => risk(t).skor >= 66);
  if (/(gecik|gecikmiş)/.test(s)) list = list.filter(t => t.durum === "Gecikti");
  if (/(açık|bekleyen)/.test(s)) list = list.filter(t => t.durum !== "Tamamlandı");
  const bl = BIRIM.filter(b => s.includes(trLower(b.il)));
  if (bl.length) list = list.filter(t => bl.some(b => b.id === t.birim));

  let c = "Sistemdeki görev kayıtları incelendi. ";
  if (list.length) {
    c += "Sorgunuza uyan " + list.length + " görev tespit edildi: " +
      list.slice(0, 3).map(t => bIdx[t.birim].il + " (" + t.baslik.slice(0, 30) + "...)").join(", ") + ".";
  } else {
    c += "Bu kriterlere uyan görev bulunamadı.";
  }
  return { metin:c, satir:list.slice(0, 5) };
}

function drawer() {
  if (!S.sor) return "";
  const g = S.sorGecmis;
  return '<div class="drawer-scrim" data-kapat="1"></div><div class="drawer">' +
    '<div class="drawer-header"><span>' + ic("i-wand") + ' ASTRO Yapay Zekâ Asistanı</span><button data-kapat="1">' + ic("i-x") + '</button></div>' +
    '<div class="drawer-body">' +
      (g.length ? g.map(x =>
        '<div style="margin-bottom:18px"><div class="query-bubble">' + esc(x.q) + '</div>' +
        '<div class="ai-card"><span class="ai-tag">' + ic("i-wand") + 'ASTRO SİSTEM ANALİZİ</span><p>' + esc(x.c.metin) + '</p>' +
        (x.c.satir.length ? '<div class="table-wrapper" style="margin-top:10px;border:1px solid #BAE6FD;border-radius:var(--radius-sm);background:#fff">' +
          '<table style="min-width:0"><thead><tr><th>GÖREV</th><th>ATÖLYE</th><th>RİSK</th></tr></thead><tbody>' +
          x.c.satir.map(t => '<tr class="clickable" data-git="' + t.id + '"><td class="task-title" style="min-width:0;font-size:12px">' +
            esc(t.baslik) + '</td><td class="tabular-date">' + esc(bIdx[t.birim].il) + '</td><td>' +
            riskCell(t) + '</td></tr>').join('') + '</tbody></table></div>' : '') +
        '</div></div>').join('')
        : '<p style="color:var(--ink-600);font-size:13px">Doğal dil ile görevler, terminler ve atölye durumları hakkında soru sorabilirsiniz.</p>') +
      '<div class="chip-suggestions">' + SOR_ORNEK.map(q => '<button class="chip-btn" data-sorq="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>' +
    '</div>' +
    '<div class="drawer-footer"><div style="display:flex;gap:8px"><input type="text" id="sorInp" placeholder="Soru sorun (örn. Geciken görevler kimde?)...">' +
      '<button class="btn sm" data-sorgonder="1">Sor</button></div></div></div>';
}

/* ── Export & Modal ── */
function csvKur(baslik, satirlar) {
  const q = v => '"' + String(v === null || v === undefined ? "" : v).replace(/"/g, '""') + '"';
  return "﻿" + [baslik].concat(satirlar).map(r => r.map(q).join(";")).join("\r\n");
}

function indir(adi, icerik, tur) {
  try {
    const blob = new Blob([icerik], { type: tur });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = adi; a.style.display = "none";
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    return true;
  } catch(e) { return false; }
}

function aktar(tip) {
  const d = {
    ad: "ASTRO-" + tip,
    baslik: ["Atölye","Görev","Kategori","Sorumlu","Termin","Durum","Öncelik","Risk"],
    satir: gorunur().map(t => [(bIdx[t.birim] || {}).il, t.baslik, t.kategori,
      t.sorumlu ? uIdx[t.sorumlu].ad : "", fmtLong(t.termin), t.durum, t.oncelik, risk(t).skor])
  };
  const csv = csvKur(d.baslik, d.satir);
  const dosya = d.ad + "-" + iso(TODAY) + ".csv";
  const indi = indir(dosya, csv, "text/csv;charset=utf-8");
  S.aktarim = { tip, ad:d.ad, dosya, baslik:d.baslik, satir:d.satir, indi };
}

function aktarimModal() {
  const a = S.aktarim;
  if (!a) return "";
  return '<div class="drawer-scrim" data-aktarkapat="1"></div><div class="modal-window">' +
    '<div class="modal-header"><span>' + ic("i-down") + ' Dışa Aktar · ' + esc(a.ad) + '</span>' +
      '<button data-aktarkapat="1">' + ic("i-x") + '</button></div>' +
    '<div class="modal-body">' +
      '<p style="margin-bottom:12px">Dosya <b>' + esc(a.dosya) + '</b> adıyla indirildi. Excel ile doğrudan açılabilir.</p>' +
      '<div class="table-wrapper"><table><thead><tr>' + a.baslik.map(h => '<th>' + esc(h) + '</th>').join('') +
        '</tr></thead><tbody>' +
        a.satir.slice(0, 6).map(r => '<tr>' + r.map(c => '<td class="tabular-date">' + esc(c) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>' +
    '</div>' +
    '<div class="modal-footer">' +
      '<button class="btn" data-aktar="' + esc(a.tip) + '">' + ic("i-down") + 'Tekrar İndir</button>' +
      '<button class="btn ghost" data-aktarkapat="1">Kapat</button>' +
    '</div></div>';
}

/* ══════════════════════════════════════════════════════════════════════
   RENDER MOTORU & EVENT LISTENER
   ══════════════════════════════════════════════════════════════════════ */
const VIEWS = { pano:vPano, gorevler:vGorevler, gecikme:vGecikme, benim:vBenim, gorev:vGorev,
  olustur:vOlustur, ayristirici:vAyristirici, rapor:vRapor, bildirim:vBildirim,
  yoklama:vYoklama, envanter:vEnvanter, katalog:vKatalog, ayarlar:vAyarlar,
  duyuru:vDuyuru, komisyon:vKomisyon, riskpano:vRiskpano, profil:vProfil };

function render() {
  const app = document.getElementById("app");
  if (!S.userId) { app.innerHTML = vGiris(); return; }
  const f = VIEWS[S.view] || vPano;
  app.innerHTML = '<div class="shell">' + sidebar() + '<main>' + f() + '</main></div>' + drawer() + aktarimModal() + (S.yokDetay ? yokDetayModal(S.yokDetay) : '') + (S.riskDetay ? atolyeRiskDetayModal(S.riskDetay) : '') +
    (S.toast ? '<div class="toast-notice">🚀 ' + esc(S.toast) + '</div>' : '');
  if (S.toast) { const t = S.toast; setTimeout(() => { if (S.toast === t) { S.toast = null; render(); } }, 2800); }
  const si = document.getElementById("sorInp"); if (si) si.focus();
}

function toast(m) { S.toast = m; }

/* ── Event Listener ── */
document.addEventListener("click", e => {
  let t = null, curr = e.target;
  while (curr && curr !== document.body) {
    if (curr.dataset && Object.keys(curr.dataset).length > 0) { t = curr; break; }
    curr = curr.parentElement;
  }
  if (S.bildirimAcik && !e.target.closest(".bell-wrapper")) { S.bildirimAcik = false; if (!t) { render(); return; } }
  if (!t) return;
  const d = t.dataset;

  if (d.login) {
    S.userId = d.login; S.view = ILK[uIdx[d.login].rol]; NOTIF = [];
    terminTara(); sayimTara(); render(); return;
  }
  if (d.cikis) { S.userId = null; S.sor = false; render(); return; }
  if (d.go) { S.view = d.go; if (d.go !== "gorev") S.gorevId = null; render(); return; }
  if (d.git) {
    if (S.view === "gecikme") { S.gorevId = d.git; render(); return; }
    S.gorevId = d.git; S.view = "gorev"; render(); return;
  }
  if (d.sor) { S.sor = true; render(); return; }
  if (d.kapat) { S.sor = false; render(); return; }
  if (d.sekme) { S.sekme = d.sekme; S.gorevId = null; render(); return; }
  if (d.clear) { S.filt = { ulke:"", bolge:"", il:"", birim:"", komisyon:"", koord:"", durum:"", oncelik:"", kat:"", q:"" }; S.gelismis = false; render(); return; }
  if (d.okundu) { NOTIF.forEach(n => { if (n.user === S.userId) n.okundu = true; }); render(); return; }
  if (d.bell) { S.bildirimAcik = !S.bildirimAcik; render(); return; }

  if (d.ilerle) {
    TODAY = new Date(TODAY.getTime() + (+d.ilerle) * 864e5);
    TASKS.forEach(x => { if (x.durum !== "Tamamlandı") x.sonGun += (+d.ilerle); });
    const n = terminTara();
    const sy = sayimTara();
    toast(d.ilerle + " gün ilerletildi. " + n + " yeni termin uyarısı oluştu.");
    render(); return;
  }

  if (d.sablon) {
    const sablonlar = {
      envanter: {
        t: "Atölye Envanter Sayımı & Eksik Malzeme Bildirimi",
        d: "DENEYAP atölyesindeki tüm 3D yazıcı, robotik set, sarf malzeme ve el aletlerinin fiziksel sayımının yapılması ve eksik listesinin sisteme girilmesi.",
        k: "Periyodik Sayım",
        o: "Yüksek",
        koord: "Atölyeler & Saha Operasyonları"
      },
      guvenlik: {
        t: "Atölye Fiziki Güvenlik & Yangın Tedbir Kontrolü",
        d: "Atölye yangın tüplerinin basınç kontrolü, acil çıkış yönlendirmeleri, ilk yardım dolabı stoku ve elektrik tesisat güvenliğinin denetlenmesi.",
        k: "Güvenlik & Yangın",
        o: "Acil",
        koord: "Atölyeler & Saha Operasyonları"
      },
      sinav: {
        t: "Uygulama Sınavı Hazırlığı & Gözetmen Operasyon Planı",
        d: "Yaklaşan Deneyap uygulama sınavı için sınav salonu hazırlıkları, sınav malzemelerinin dağıtımı, gözetmen görevlendirmeleri ve sınav evraklarının kontrolü.",
        k: "Kurumsal Hazırlık & Sezon",
        o: "Acil",
        koord: "Yarışmalar Koordinatörlüğü"
      },
      sezon: {
        t: "Yeni Sezon Açılışı Hazırlık & Müfredat Kontrolü",
        d: "Yeni eğitim dönemi öncesi dersliklerin düzenlenmesi, eğitmen atamalarının kesinleşmesi, öğrenci yoklama listelerinin basılması ve ilk hafta malzemelerinin kontrolü.",
        k: "Eğitmen & Ders Programı",
        o: "Yüksek",
        koord: "Bursiyer Koordinatörlüğü"
      }
    };
    const s = sablonlar[d.sablon];
    if (s) {
      const elT = document.getElementById("c_t");
      const elD = document.getElementById("c_d");
      const elK = document.getElementById("c_k");
      const elO = document.getElementById("c_o");
      const elKoord = document.getElementById("c_koord");
      if (elT) elT.value = s.t;
      if (elD) elD.value = s.d;
      if (elK) elK.value = s.k;
      if (elO) elO.value = s.o;
      if (elKoord) elKoord.value = s.koord;
      toast("'" + s.t.slice(0, 32) + "...' şablonu form alanlarına yüklendi.");
    }
    return;
  }

  if (d.create) {
    const b = (document.getElementById("c_t") || {}).value || "";
    if (!b.trim()) { toast("Görev başlığı boş olamaz."); return; }
    const bid = document.getElementById("c_b").value;
    const koord = (document.getElementById("c_koord") || {}).value || "";
    const isOrtak = !!(document.getElementById("c_ortak_check") || {}).checked;
    const oB1 = isOrtak ? (document.getElementById("c_ortak_b1") || {}).value : "";
    const oB2 = isOrtak ? (document.getElementById("c_ortak_b2") || {}).value : "";

    const ekAd = (document.getElementById("c_ek_ad") || {}).value || "";
    const ekTur = (document.getElementById("c_ek_tur") || {}).value || "pdf";
    const ekUrl = (document.getElementById("c_ek_url") || {}).value || "";
    const eklerList = [];
    if (ekAd.trim() || ekUrl.trim()) {
      eklerList.push({
        id: "e" + (++EK_SEQ),
        kim: S.userId,
        ad: ekAd.trim() || "Görev Ek Dokümanı",
        tur: ekTur === "pdf" ? "application/pdf" : ekTur === "gorsel" ? "image/png" : "link",
        url: ekUrl.trim(),
        tarih: iso(TODAY)
      });
    }

    let ortakIller = [];
    if (isOrtak) {
      if (bid && bid !== "__TUM__") ortakIller.push(bid);
      if (oB1) ortakIller.push(oB1);
      if (oB2) ortakIller.push(oB2);
    }
    
    const chosenUlke = (document.getElementById("c_ulke") || {}).value || "";
    const chosenIl = (document.getElementById("c_il_sec") || {}).value || "";

    if (bid === "__TUM__" || bid === "__TUM_IL__") {
      let hedefBirimler = BIRIM;
      if (chosenIl && chosenIl !== "__TUM__") {
        hedefBirimler = BIRIM.filter(b => b.il === chosenIl);
      } else if (chosenUlke) {
        hedefBirimler = BIRIM.filter(b => b.ulke === chosenUlke);
      }

      let say = 0;
      hedefBirimler.forEach(bm => {
        const yeni = {
          id:"GRV-" + (105000 + (TASKS.length + say) * 7), baslik:b.trim(),
          kategori:document.getElementById("c_k").value, birim:bm.id,
          koordinatorluk: koord, ortakGorev: isOrtak, ortakIller: ortakIller,
          sorumlu:uOf(bm.id) ? uOf(bm.id).id : null, olusturan:S.userId,
          termin:document.getElementById("c_v").value, durum:"Bekliyor",
          oncelik:document.getElementById("c_o").value, yuzde:0, sonGun:0, kaynak:"manuel",
          adimlar:adimlarFor(b.trim()), ekler:JSON.parse(JSON.stringify(eklerList)), yorumlar:[], komisyon:null, altGrup:null,
          olusturma:iso(TODAY), log:[{ tarih:iso(TODAY), kim:S.userId, tip:"olusturma",
            not:((document.getElementById("c_d") || {}).value || "Seçilen kapsama toplu görev atandı.") }]
        };
        TASKS.push(yeni);
        bildir(yeni.sorumlu, yeni.id, "atama", "Yeni görev atandı: " + yeni.baslik);
        say++;
      });
      terminTara();
      S.view = "gorevler";
      const aciklamaMesaj = chosenIl && chosenIl !== "__TUM__" ? chosenIl + " ilindeki " + hedefBirimler.length + " atölyeye görev atandı." : chosenUlke ? chosenUlke + " ülkesindeki " + hedefBirimler.length + " atölyeye görev atandı." : "Tüm atölyelere (" + hedefBirimler.length + " adet) görev atandı.";
      toast(aciklamaMesaj); render(); return;
    } else {
      const yeni = {
        id:"GRV-" + (105000 + TASKS.length * 7), baslik:b.trim(),
        kategori:document.getElementById("c_k").value, birim:bid,
        koordinatorluk: koord, ortakGorev: isOrtak, ortakIller: ortakIller,
        sorumlu:uOf(bid) ? uOf(bid).id : null, olusturan:S.userId,
        termin:document.getElementById("c_v").value, durum:"Bekliyor",
        oncelik:document.getElementById("c_o").value, yuzde:0, sonGun:0, kaynak:"manuel",
        adimlar:adimlarFor(b.trim()), ekler:eklerList, yorumlar:[], komisyon:null, altGrup:null,
        olusturma:iso(TODAY), log:[{ tarih:iso(TODAY), kim:S.userId, tip:"olusturma",
          not:((document.getElementById("c_d") || {}).value || "Görev oluşturuldu ve atandı.") }]
      };
      TASKS.push(yeni);
      bildir(yeni.sorumlu, yeni.id, "atama", "Yeni görev atandı: " + yeni.baslik);
      if (isOrtak && ortakIller.length) {
        ortakIller.forEach(ob => {
          if (ob !== bid) bildir(uOf(ob) ? uOf(ob).id : null, yeni.id, "atama", "Ortak görev atandı: " + yeni.baslik);
        });
      }
      terminTara();
      S.view = "gorev"; S.gorevId = yeni.id; toast("Görev başarıyla oluşturuldu."); render(); return;
    }
  }

  if (d.ayrismod) {
    S.ayrisMod = d.ayrismod;
    const m = d.ayrismod;
    const metin = m === "ses" ? MOCK_METIN_SES : m === "pdf" ? MOCK_METIN_PDF : m === "excel" ? MOCK_METIN_EXCEL : ORNEK;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    const baslik = m === "ses" ? "Toplantı Ses Kaydı (AI Voice)" : m === "pdf" ? "PDF & Word Tutanağı" : m === "excel" ? "Excel / CSV Görev Tablosu" : "Metin & Toplantı Notu";
    toast(baslik + " moduna geçildi, görevler otomatik ayrıştırıldı.");
    render(); return;
  }
  if (d.ayrissesornek) {
    const metin = MOCK_METIN_SES;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("Ses kaydı transkribe edildi ve 6 görev tespit edildi.");
    render(); return;
  }
  if (d.ayrissescanli) {
    S.sesKayitAktif = !S.sesKayitAktif;
    if (S.sesKayitAktif) {
      toast("Mikrofon ses kaydı başlatıldı (AI Whisper)... Konuşmanız görev adımlarına dönüştürülüyor.");
    } else {
      const metin = MOCK_METIN_SES;
      S.ayrisSonuc = { metin, liste: ayristir(metin) };
      toast("Ses kaydı tamamlandı, metne dönüştürüldü ve 6 görev çıkarıldı.");
    }
    render(); return;
  }
  if (d.ayrispdfornek) {
    const metin = MOCK_METIN_PDF;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("PDF tutanağından metin okundu ve 6 görev çıkarıldı.");
    render(); return;
  }
  if (d.ayrisexcelornek) {
    const metin = MOCK_METIN_EXCEL;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("Excel tablosundaki görevler okundu ve 6 görev çıkarıldı.");
    render(); return;
  }

  if (d.ayris) {
    const metin = (document.getElementById("ay_t") || {}).value || "";
    const liste = ayristir(metin);
    S.ayrisSonuc = { metin, liste };
    toast(liste.length + " görev tespit edildi.");
    render(); return;
  }
  if (d.ornek) { S.ayrisSonuc = null; document.getElementById("ay_t").value = ORNEK; render(); return; }
  if (d.iptal) { S.ayrisSonuc = null; render(); return; }
  if (d.aysil) { S.ayrisSonuc.liste.splice(+d.aysil, 1); render(); return; }

  if (d.onayla) {
    const l = S.ayrisSonuc.liste;
    let n = 0;
    l.forEach(x => {
      const hedefler = x.tumu ? BIRIM.map(b => b.id) : [x.birim];
      hedefler.forEach(bid => {
        const yeni = {
          id:"GRV-" + (106000 + (TASKS.length + n) * 7), baslik:x.baslik, kategori:x.kategori, birim:bid,
          sorumlu:uOf(bid) ? uOf(bid).id : null, olusturan:S.userId, termin:x.termin, durum:"Bekliyor",
          oncelik:x.oncelik, yuzde:0, sonGun:0, kaynak:"ai", adimlar:adimlarFor(x.baslik), ekler:[], yorumlar:[],
          komisyon:null, altGrup:null, olusturma:iso(TODAY),
          log:[{ tarih:iso(TODAY), kim:S.userId, tip:"olusturma", not:'Yapay zekâ tarafından oluşturuldu.' }]
        };
        TASKS.push(yeni);
        bildir(yeni.sorumlu, yeni.id, "atama", "Yeni görev atandı: " + yeni.baslik);
        n++;
      });
    });
    S.ayrisSonuc = null; terminTara();
    S.view = "gorevler"; toast(n + " görev onaylandı ve atölyelere atandı."); render(); return;
  }

  if (d.hatirlat) {
    const g = TASKS.find(x => x.id === d.hatirlat);
    bildir(g.sorumlu, g.id, "hatirlatma", "Hatırlatma: " + g.baslik);
    g.log.push({ tarih:iso(TODAY), kim:S.userId, tip:"not", not:"Koordinatör hatırlatma iletti." });
    toast("Sorumluya hatırlatma gönderildi."); render(); return;
  }
  if (d.otele) {
    const g = TASKS.find(x => x.id === d.otele);
    g.termin = iso(new Date(D(g.termin).getTime() + 3 * 864e5));
    if (g.durum === "Gecikti") g.durum = "Devam Ediyor";
    g.log.push({ tarih:iso(TODAY), kim:S.userId, tip:"otele", not:"Termin 3 gün ötelendi." });
    toast("Termin 3 gün ötelendi."); render(); return;
  }
  if (d.notekle) {
    const inp = document.getElementById("notInp");
    if (!inp || !inp.value.trim()) { toast("Not boş olamaz."); return; }
    const g = TASKS.find(x => x.id === d.notekle);
    g.log.push({ tarih:iso(TODAY), kim:S.userId, tip:"not", not:inp.value.trim() });
    g.sonGun = 0; toast("İlerleme notu eklendi."); render(); return;
  }
  if (d.not) {
    S.gorevId = d.not; S.view = "gorev"; render();
    setTimeout(() => { const i = document.getElementById("notInp"); if (i) i.focus(); }, 20); return;
  }
  if (d.bitir) {
    const g = TASKS.find(x => x.id === d.bitir);
    g.durum = "Tamamlandı"; g.yuzde = 100; g.sonGun = 0;
    g.log.push({ tarih:iso(TODAY), kim:S.userId, tip:"durum", eski:"Devam Ediyor", yeni:"Tamamlandı", yuzde:100, not:"Tüm kontrol adımları tamamlandı." });
    bildir("u1", g.id, "atama", bIdx[g.birim].il + " · " + g.baslik + " tamamlandı.");
    toast("Görev tamamlandı olarak kapatıldı."); render(); return;
  }

  /* Yoklama */
  if (d.yokbasla) {
    const gruplar = yokGruplari();
    const gid = gruplar.some(x => x.id === S.yokGrup) ? S.yokGrup : (gruplar[0] ? gruplar[0].id : "");
    const tarih = S.yokTarih || iso(TODAY);
    const kayit = {};
    if (gIdx[gid]) gIdx[gid].ogr.forEach(o => kayit[o.id] = "Katıldı");
    S.yokTaslak = { grup:gid, tarih, kayit, gerekce:{}, egitmenDurum:"Katıldı", egitmenGerekce:"" };
    toast("Yoklama başlatıldı. Katılmayanları işaretleyip kaydedin."); render(); return;
  }
  if (d.yokset) {
    S.yokTaslak.kayit[d.yokset] = d.yd;
    render(); return;
  }
  if (d.egtset) {
    S.yokTaslak.egitmenDurum = d.yd;
    render(); return;
  }
  if (d.yokall) {
    Object.keys(S.yokTaslak.kayit).forEach(k => S.yokTaslak.kayit[k] = d.yokall);
    render(); return;
  }
  if (d.yokiptal) { S.yokTaslak = null; render(); return; }
  if (d.yokkaydet) {
    const t2 = S.yokTaslak;
    const kay = { id:"YOK-" + (1000 + yokSeq++), grup:t2.grup, tarih:t2.tarih, egitmen:S.userId,
      kayit:Object.assign({}, t2.kayit), gerekce:Object.assign({}, t2.gerekce),
      egitmenDurum:t2.egitmenDurum, egitmenGerekce:t2.egitmenGerekce, giren:S.userId };
    YOKLAMA.push(kay);
    S.yokTaslak = null; S.yokSekme = "kayit";
    toast("Yoklama başarıyla kaydedildi."); render(); return;
  }
  if (d.yoksekme) { S.yokSekme = d.yoksekme; render(); return; }
  if (d.yoktemizle) { S.yokFilt = { ulke:"", bolge:"", il:"", birim:"", grup:"", bas:"", bit:"" }; render(); return; }
  if (d.yokdetay) { S.yokDetay = d.yokdetay; render(); return; }
  if (d.yokdetaykapat) { S.yokDetay = null; render(); return; }
  if (d.riskdetay) { S.riskDetay = d.riskdetay; render(); return; }
  if (d.riskdetaykapat) { S.riskDetay = null; render(); return; }

  /* Envanter */
  if (d.envtalepac) {
    const u2 = me();
    if (u2.rol === "merkez" || u2.rol === "koord" || u2.rol === "yonetici") {
      toast("Merkez ekibi malzeme talebi gönderemez. Yetki iller/il sorumlularındadır.");
      return;
    }
    S.envTalepFormAcik = !S.envTalepFormAcik; render(); return;
  }
  if (d.envtalepgonder) {
    const u2 = me();
    if (u2.rol === "merkez" || u2.rol === "koord" || u2.rol === "yonetici") {
      toast("Merkez ekibi malzeme talebi gönderemez. Yetki iller/il sorumlularındadır.");
      return;
    }
    const bid = (document.getElementById("tlpBirim") || {}).value || u2.birim || "b1";
    const malzeme = (document.getElementById("tlpMalzeme") || {}).value || "Genel Malzeme Tedariği";
    const adet = parseInt((document.getElementById("tlpAdet") || {}).value, 10) || 10;
    const oncelik = (document.getElementById("tlpOncelik") || {}).value || "Yüksek";
    const gerekce = (document.getElementById("tlpGerekce") || {}).value || "Stok ihtiyacı sebebiyle merkeze talep iletildi.";

    const yeniTalep = {
      id: "TLP-" + (++tlpSeq),
      birim: bid,
      malzeme: malzeme,
      kod: "m_custom",
      adet: adet,
      oncelik: oncelik,
      gerekce: gerekce,
      talepEden: S.userId,
      tarih: iso(TODAY),
      durum: "Bekliyor",
      not: "Merkez tedarik onayı bekliyor."
    };
    MALZEME_TALEPLERI.unshift(yeniTalep);

    const ilAd = bIdx[bid] ? bIdx[bid].il : "İl";
    bildir("u1", null, "talep", "📦 [MALZEME TALEBİ] " + ilAd + " atölyesinden " + adet + " adet '" + malzeme + "' talep edildi.");
    bildir("u2", null, "talep", "📦 [MALZEME TALEBİ] " + ilAd + " atölyesinden " + adet + " adet '" + malzeme + "' talep edildi.");

    const baslik = ilAd + " Atölyesi Malzeme Tedarik Talebi (" + malzeme + " - " + adet + " Adet)";
    TASKS.push({
      id: "GRV-" + (109000 + TASKS.length * 7),
      baslik: baslik,
      kategori: "Atölye Operasyonu",
      birim: bid,
      sorumlu: "u1",
      olusturan: S.userId,
      termin: iso(new Date(TODAY.getTime() + 4 * 864e5)),
      durum: "Bekliyor",
      oncelik: oncelik,
      yuzde: 0,
      sonGun: 0,
      kaynak: "talep",
      adimlar: adimlarFor(baslik),
      ekler: [],
      yorumlar: [],
      komisyon: null,
      altGrup: null,
      olusturma: iso(TODAY),
      log: [{ tarih: iso(TODAY), kim: S.userId, tip: "olusturma", not: ilAd + " tarafından malzeme talebi iletildi: " + gerekce }]
    });

    S.envTalepFormAcik = false;
    toast(ilAd + " atölyesi için malzeme talebi Merkez Operasyona iletildi.");
    render(); return;
  }
  if (d.taleponayla) {
    const t2 = MALZEME_TALEPLERI.find(x => x.id === d.taleponayla);
    if (t2) {
      t2.durum = "Onaylandı (Sevkiyatta)";
      t2.not = "Merkez depodan kargoya verildi. Takip No: T3-" + Math.floor(10000 + Math.random() * 90000);
      bildir(t2.talepEden, null, "talep", "✅ Malzeme talebiniz onaylandı: " + t2.malzeme + " (" + t2.adet + " adet) kargoya verildi.");
      toast(t2.id + " malzeme talebi onaylandı ve kargo sevkiyatına alındı.");
      render();
    }
    return;
  }
  if (d.talepred) {
    const t2 = MALZEME_TALEPLERI.find(x => x.id === d.talepred);
    if (t2) {
      t2.durum = "Reddedildi";
      bildir(t2.talepEden, null, "talep", "❌ Malzeme talebiniz reddedildi: " + t2.malzeme);
      toast(t2.id + " malzeme talebi reddedildi.");
      render();
    }
    return;
  }
  if (d.envdelta) {
    const e2 = ENVANTER.find(x => x.id === d.envdelta);
    e2.adet = Math.max(0, e2.adet + (+d.dv));
    e2.sonSayim = iso(TODAY);
    render(); return;
  }
  if (d.envsayim) {
    envGorunur().forEach(e2 => e2.sonSayim = iso(TODAY));
    toast("Tüm kalemler için sayım tarihi bugüne güncellendi."); render(); return;
  }
  if (d.envekleac) { S.envEkleAcik = !S.envEkleAcik; render(); return; }
  if (d.envekle) {
    const u2 = me(), sel = document.getElementById("ekKod");
    if (!sel || !sel.value) return;
    const m = mIdx[sel.value];
    const adet = parseInt((document.getElementById("ekAdet") || {}).value, 10) || m.min;
    ENVANTER.push({ id:"ENV-y" + (++ENV_SEQ), birim:u2.birim, kod:m.kod, adet, sonSayim:iso(TODAY) });
    S.envEkleAcik = false;
    toast(m.ad + " atölye envanterine tanımlandı."); render(); return;
  }
  if (d.envbildir) {
    const e2 = ENVANTER.find(x => x.id === d.envbildir);
    const bid = e2.birim, il = uOf(bid);
    const baslik = "Atölye malzeme ihtiyacının bildirilmesi";
    const yeni2 = {
      id:"GRV-" + (107000 + TASKS.length * 7), baslik, kategori:"Atölye Operasyonu", birim:bid,
      sorumlu:il ? il.id : null, olusturan:S.userId,
      termin:iso(new Date(TODAY.getTime() + 5 * 864e5)), durum:"Bekliyor",
      oncelik:"Yüksek", yuzde:0, sonGun:0, kaynak:"envanter", adimlar:adimlarFor(baslik), ekler:[], yorumlar:[],
      komisyon:null, altGrup:null, olusturma:iso(TODAY),
      log:[{ tarih:iso(TODAY), kim:S.userId, tip:"olusturma", not:envAd(e2) + " için tedarik görevi açıldı." }]
    };
    TASKS.push(yeni2);
    toast("Malzeme tedarik görevi oluşturuldu."); render(); return;
  }

  if (d.gelismis) { S.gelismis = !S.gelismis; render(); return; }
  if (d.katf !== undefined) { S.filt.kat = d.katf; render(); return; }
  if (d.ayar) { S.ayar[d.ayar] = !S.ayar[d.ayar]; render(); return; }

  /* Ekler & Yorumlar */
  if (d.eksil) {
    const [tid, eid] = d.eksil.split("|");
    const t2 = TASKS.find(x => x.id === tid);
    const i = t2.ekler.findIndex(x => x.id === eid);
    if (i >= 0) { t2.ekler.splice(i, 1); toast("Belge kaldırıldı."); render(); }
    return;
  }
  if (d.yorumgonder || d.revizyon) {
    const tid = d.yorumgonder || d.revizyon;
    const t2 = TASKS.find(x => x.id === tid);
    const el2 = document.getElementById("yorumInp-" + tid);
    const metin = el2 ? el2.value.trim() : "";
    if (!metin) return;
    const rev = !!d.revizyon;
    t2.yorumlar.push({ id:"y" + (++YORUM_SEQ), kim:S.userId, metin, tip: rev ? "revizyon" : "yorum", tarih:iso(TODAY), cozuldu:!rev });
    if (rev && t2.durum === "Tamamlandı") t2.durum = "Devam Ediyor";
    toast(rev ? "Revizyon talebi iletildi." : "İleti gönderildi."); render(); return;
  }
  if (d.yorumcoz) {
    const [tid, yid] = d.yorumcoz.split("|");
    const t2 = TASKS.find(x => x.id === tid);
    const y2 = t2.yorumlar.find(x => x.id === yid);
    if (y2) { y2.cozuldu = true; toast("Revizyon kapatıldı."); render(); }
    return;
  }

  /* Duyuru */
  if (d.duyuruac) { S.duyuruYeniAcik = !S.duyuruYeniAcik; render(); return; }
  if (d.duyuruyayin) {
    const b = (document.getElementById("dyBaslik") || {}).value || "";
    const m = (document.getElementById("dyMetin") || {}).value || "";
    if (!b.trim()) return;
    duyuruOlustur(b.trim(), m.trim(), "Sistem duyurusu", { kapsam:"tumu" }, S.userId, 0, false);
    S.duyuruYeniAcik = false; toast("Duyuru yayınlandı."); render(); return;
  }
  if (d.duyuruoku) {
    const dy = DUYURU.find(x => x.id === d.duyuruoku);
    if (dy && !dy.okuyan.includes(S.userId)) dy.okuyan.push(S.userId);
    render(); return;
  }

  if (d.kom) { S.komId = d.kom; render(); return; }
  if (d.profil) { S.profilId = d.profil; S.view = "profil"; render(); return; }
  if (d.aktar) { aktar(d.aktar); render(); return; }
  if (d.aktarkapat) { S.aktarim = null; render(); return; }

  if (d.sorq || d.sorgonder) {
    const q = d.sorq || (document.getElementById("sorInp") || {}).value;
    if (!q || !q.trim()) return;
    S.sorGecmis.push({ q:q.trim(), c:sorCevap(q.trim()) });
    S.sor = true; render(); return;
  }
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.adim !== undefined) {
    const g = TASKS.find(x => x.id === el.dataset.adim);
    g.adimlar[+el.dataset.ai].tamam = el.checked;
    g.yuzde = adimYuzde(g);
    if (g.durum === "Bekliyor" && g.yuzde > 0) g.durum = "Devam Ediyor";
    render(); return;
  }
  if (el.dataset.ef !== undefined) {
    S.envFilt[el.dataset.ef] = el.type === "checkbox" ? el.checked : el.value;
    render(); return;
  }
  if (el.dataset.ekyukle !== undefined) {
    const t2 = TASKS.find(x => x.id === el.dataset.ekyukle);
    Array.from(el.files || []).forEach(f => {
      t2.ekler.push({ id:"e" + (++EK_SEQ), kim:S.userId, ad:f.name, tur:f.type, boyut:f.size, tarih:iso(TODAY) });
    });
    toast("Belgeler yüklendi."); render(); return;
  }
  if (el.dataset.ayrissesyukle !== undefined) {
    const fn = el.files && el.files[0] ? el.files[0].name : "ses_kaydi.mp3";
    const metin = "[AI SES TRANSKRİPTİ — " + fn + "]\n" + ORNEK;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("'" + fn + "' ses kaydı yapay zekâ ile metne dönüştürüldü ve 6 görev çıkarıldı.");
    render(); return;
  }
  if (el.dataset.ayrispdfyukle !== undefined) {
    const fn = el.files && el.files[0] ? el.files[0].name : "tutanak.pdf";
    const metin = "[AI DOKÜMAN — " + fn + "]\n" + ORNEK;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("'" + fn + "' PDF tutanağındaki kararlar okundu ve 6 görev çıkarıldı.");
    render(); return;
  }
  if (el.dataset.ayrisexcelyukle !== undefined) {
    const fn = el.files && el.files[0] ? el.files[0].name : "gorevler.xlsx";
    const metin = "[AI TABLO — " + fn + "]\n" + ORNEK;
    S.ayrisSonuc = { metin, liste: ayristir(metin) };
    toast("'" + fn + "' Excel çalışma sayfasındaki görevler aktarıldı.");
    render(); return;
  }
  if (el.dataset.f !== undefined) { S.filt[el.dataset.f] = el.value; render(); return; }
  if (el.dataset.yf !== undefined) {
    const k = el.dataset.yf;
    S.yokFilt[k] = el.value;
    if (k === "bolge") { S.yokFilt.il = ""; S.yokFilt.birim = ""; S.yokFilt.grup = ""; }
    else if (k === "il") { S.yokFilt.birim = ""; S.yokFilt.grup = ""; }
    else if (k === "birim") { S.yokFilt.grup = ""; }
    render(); return;
  }
  if (el.dataset.yokgrup !== undefined) { S.yokGrup = el.value; S.yokTaslak = null; render(); return; }
  if (el.dataset.yoktarih !== undefined) { S.yokTarih = el.value; S.yokTaslak = null; render(); return; }
  if (el.dataset.rolsec !== undefined) {
    S.userId = el.value; S.view = ILK[me().rol]; S.gorevId = null; render(); return;
  }
  if (el.dataset.durum) {
    const g = TASKS.find(x => x.id === el.dataset.durum);
    g.durum = el.value;
    if (el.value === "Tamamlandı") g.yuzde = 100;
    else if (el.value === "Devam Ediyor" && g.yuzde === 0) g.yuzde = 25;
    g.log.push({ tarih:iso(TODAY), kim:S.userId, tip:"durum", eski:"", yeni:el.value, yuzde:g.yuzde, not:"Durum güncellendi." });
    toast("Durum güncellendi: " + el.value); render(); return;
  }
  if (el.dataset.ay !== undefined) {
    const x = S.ayrisSonuc.liste[+el.dataset.ay];
    x[el.dataset.k] = el.value;
    if (el.dataset.k === "birim") x.belirsiz = !el.value;
    render(); return;
  }
});

document.addEventListener("input", e => {
  if (e.target.dataset.ay !== undefined && e.target.dataset.k === "baslik")
    S.ayrisSonuc.liste[+e.target.dataset.ay].baslik = e.target.value;
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (e.target.id === "sorInp") { e.preventDefault(); (document.querySelector("[data-sorgonder]") || {}).click(); }
    if (e.target.id === "notInp") { e.preventDefault(); (document.querySelector("[data-notekle]") || {}).click(); }
  }
  if (e.key === "Escape" && S.sor) { S.sor = false; render(); }
});

/* İlk Başlatma */
terminTara();
sayimTara();
render();
