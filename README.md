# ASTRO · DENEYAP Görev Takip ve Operasyon Sistemi

**ASTRO**, DENEYAP Türkiye Teknoloji Atölyeleri için geliştirilmiş, 81 ildeki atölye operasyonlarını, eğitmen/öğrenci devamsızlık takibini, görev ve süreç yönetimini, envanter tüketim analizini ve genel risk değerlendirmesini tek bir merkezden yöneten **web tabanlı operasyon ve görev takip sistemidir**.

---

## 🌟 Ana Özellikler ve Modüller

### 1. 📊 Genel Operasyon Panosu (Dashboard)
- 81 İl, 7 Bölge ve Atölyeler bazında anlık durum özetleri.
- Tamamlanan, devam eden ve geciken görevlerin grafiksel gösterimi.
- Türkiye geneli canlı operasyonel metrikler ve sistem uyarıları.

### 2. 📋 Görev ve Süreç Yönetimi
- **Hiyerarşik Görev Atama:** Merkez Operasyon, İl Sorumluları ve Eğitmenler arası görev dağılımı.
- **Görev Kanıtı & Medya Yükleme:** Görev tamamlama aşamasında fotoğraf, PDF ve doküman yükleme desteği.
- **Görev İçi İletişim:** Görev detayında canlı yorumlaşma ve yöneticiler için **"Revizyon İste"** butonu.
- **Komisyon Görevleri:** Yayın, Etkinlik, Eğitim, Lojistik vb. komisyonlara özel ayrıştırılmış görev paneli.
- **Gelişmiş Filtreleme:** İl, Bölge, Atölye, Komisyon ve Kategori bazlı anında arama ve süzme.

### 3. 🎓 Yoklama ve Katılım Takibi
- **Eğitmen ve Öğrenci Yoklaması:** Hem öğrenci gruplarının hem de görevli eğitmenlerin derse katılım takibi.
- **Mazeret ve Açıklama Girdisi:** "Gelmedi" veya "Mazeretli" durumları için detaylı gerekçe alanı.
- **Risk Uyarısı ve Limitler:** Devamsızlık sınırına yaklaşan kişiler için otomatik **"Yüksek Risk"** uyarı sistemi.
- **Geçmiş Yoklama Denetimi (Audit Log):** Geçmiş gün ve haftaların yoklama kayıtlarına kolay erişim ve inceleme.

### 4. 📦 Envanter ve Malzeme Yönetimi
- **Aylık Tüketim & Harcama Analizi:** Atölye bazında malzeme harcama tutarları ve tüketim hızları.
- **Sarf Tüketimi vs. Kayıp / Hasar:** Asgari stok seviyesi altına düşen ürünlerde *"Sarf Tüketimi"* veya *"Kayıp / Hasar / Kırılma"* kırılımı.

### 5. ⚠️ Genel Risk Analizi Panosu
- Tüm birimlerin teslim gecikmelerini, devamsızlık oranlarını ve malzeme eksikliklerini tek ekranda toplayan **Yönetici Risk Analiz Dashboard'u**.
- **Yapay Zeka Destekli Faz Analizi:** DENEYAP'ın 36 Eğitim Fazı (Havacılık, Robotik vb.) için atölyelerin donanım ve altyapı hazır bulunurluk analizi.

### 6. 📢 Duyuru Sistemi
- Merkez ve İl Sorumluları tarafından 81 İl, İl Sorumluları, Eğitmenler veya Komisyonlar hedef alınarak yayınlanan duyuru paneli.

---

## 🛠️ Teknolojiler

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, Vanilla CSS3 (Custom Properties, Flexbox, Grid).
- **Icons:** FontAwesome 6.4.0 (CDN).
- **Charts:** Chart.js 4.4.0 (CDN).
- **Design System:** Responsive Light Corporate Design (Inter Font Family).

---

## 🚀 Hızlı Başlangıç

Proje herhangi bir derleme (build) aşaması gerektirmeyen modüler bir HTML5/JS uygulamasıdır.

1. Depoyu klonlayın veya indirin:
   ```bash
   git clone https://github.com/enesbakkar/astro-deneyap-sistemi.git
   cd astro-deneyap-sistemi
   ```

2. Standard bir web sunucusu ile `index.html` dosyasını çalıştırın veya doğrudan tarayıcıda açın:
   - **VS Code:** Live Server eklentisini kullanabilirsiniz.
   - **Node.js (npx):**
     ```bash
     npx serve .
     ```
   - **Python:**
     ```bash
     python -m http.server 8080
     ```

3. Tarayıcınızda `http://localhost:8080` adresine gidin.

---

## 📄 Lisans

Bu proje **T3 Vakfı DENEYAP Türkiye Teknoloji Atölyeleri** operasyonel süreçlerini desteklemek amacıyla geliştirilmiştir.
