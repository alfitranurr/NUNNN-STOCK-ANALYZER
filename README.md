# 📈 NUNNN STOCK ANALYZER

**NUNNN STOCK ANALYZER** adalah platform web modern dan interaktif yang dirancang khusus untuk membantu investor dan trader saham (khususnya di Bursa Efek Indonesia / BEI) dalam melakukan analisis fundamental, teknikal, sentimen berita berbasis kecerdasan buatan (AI), serta mengoptimalkan strategi investasi melalui kalkulator finansial dan manajemen portofolio.

Platform ini mengintegrasikan data pasar real-time dari Yahoo Finance dengan kemampuan analisis bahasa alami dari Google Gemini API untuk menyajikan ringkasan berita yang akurat, obyektif, dan bebas bias.

---

## 🚀 Fitur Utama

### 1. 🧮 Kalkulator Average Down (Rata-Rata Turun)
*   **Perhitungan Presisi**: Mensimulasikan pembelian saham bertahap (average down) untuk menghitung rata-rata harga beli baru, total modal, dan target persentase kenaikan yang dibutuhkan untuk titik impas (BEP).
*   **Real-time Price Refresh**: Dilengkapi dengan tombol penyegaran harga cepat (refresh button) langsung dari Yahoo Finance API untuk memastikan perhitungan menggunakan harga saham terkini.
*   **Histori Rencana**: Menyimpan riwayat kalkulasi rencana investasi Anda langsung ke database agar dapat ditinjau kembali kapan saja.

### 2. 📰 Berita & Sentimen Pasar (Gemini AI Summary)
*   **Real-time News Aggregator**: Menampilkan berita terbaru terkait emiten tertentu dari Google News RSS dan Yahoo Finance Headline.
*   **Full-Text Scraping**: Sistem secara otomatis mendekode redirect URL Google News (protokol `batchexecute`) ke URL penerbit asli, mengunduh konten teks lengkap artikel, dan membersihkan boilerplate HTML.
*   **AI Summary & Sentiment**: Meringkas berita secara komprehensif dalam Bahasa Indonesia (Highlight Utama, Konteks Singkat, Key Findings, dan Key Takeaways) dengan struktur JSON schema bawaan Gemini.
*   **Multi-Model Fallback Chain**: Mekanisme ketahanan tingkat tinggi. Jika model utama (`gemini-2.5-flash`) terkena batas kuota harian (429) atau sedang sibuk (503), sistem akan otomatis mencoba model cadangan:
    $$\text{gemini-2.5-flash} \rightarrow \text{gemini-2.5-flash-lite} \rightarrow \text{gemini-3.1-flash-lite} \rightarrow \text{gemini-flash-lite-latest} \rightarrow \text{gemini-3-flash-preview}$$

### 3. 📊 Analisis Saham Komprehensif
*   **Analisis Teknikal**: Visualisasi grafik harga saham historis menggunakan Recharts, lengkap dengan indikator tren pergerakan harga.
*   **Analisis Fundamental**: Menampilkan informasi valuasi utama seperti P/E Ratio, PBV, Market Cap, EPS, Revenue, dan Dividend Yield.
*   **Aggregated Sentiment**: Menganalisis sekumpulan berita terbaru untuk menentukan skor sentimen emiten (Bullish, Bearish, atau Netral) menggunakan AI.

### 4. 💼 Manajemen Portofolio Saya
*   **Pelacakan Kepemilikan**: Simpan daftar saham yang Anda miliki beserta harga beli rata-rata dan jumlah lot.
*   **Realized & Unrealized PnL**: Menghitung potensi keuntungan atau kerugian (Profit/Loss) secara real-time berdasarkan harga pasar terkini.

### 5. 🛡️ Keamanan & Autentikasi (Supabase)
*   Integrasi login aman menggunakan Supabase Authentication.
*   Mendukung masuk lewat Email-Password dan opsi masuk cepat via **Google OAuth**.

### 6. ⚙️ Admin Panel
*   Halaman khusus admin untuk memonitor data aplikasi, pengguna terdaftar, dan audit log sistem.

---

## 🛠️ Tech Stack & Arsitektur

Platform ini dibangun menggunakan teknologi mutakhir untuk performa optimal dan estetika premium:

*   **Frontend**: Next.js 16 (React 19) dengan App Router dan Turbopack.
*   **Styling**: Tailwind CSS & Custom CSS dengan skema warna harmonis gelap (*Harmonious Dark Mode*).
*   **Database & Auth**: Supabase (PostgreSQL & Supabase Auth Go-library).
*   **AI Engine**: Google Gemini API (v1beta SDK) dengan fallback ke OpenAI GPT-3.5-turbo (opsional).
*   **Sumber Data**: Yahoo Finance API (menargetkan ticker `.JK` untuk Indonesia) & Google News RSS Feed.

---

## 📋 Struktur Direktori Proyek

```text
NUNNN-STOCK-ANALYZER/
├── src/
│   ├── app/                    # Routing & API Handlers (App Router)
│   │   ├── api/
│   │   │   ├── analysis/       # Endpoint Analisis Fundamental, Teknikal, & Sentimen
│   │   │   ├── news/           # Endpoint Aggregator & AI Summary Berita
│   │   │   └── ticker/         # Fetcher Data Yahoo Finance & Pencarian Emiten
│   │   ├── globals.css         # Styling Global & Variabel Tema
│   │   ├── layout.tsx          # Root Layout & Provider Context
│   │   └── page.tsx            # Dashboard Utama (Tab Switcher & Main Layout)
│   ├── components/             # Reusable UI Components
│   │   ├── calculator-form.tsx # Form Kalkulator Average Down & Tombol Refresh
│   │   ├── analysis-tab.tsx    # Panel Analisis Teknikal & Fundamental
│   │   ├── news-tab.tsx        # Feed Berita & Tampilan Hasil AI Summary
│   │   ├── portfolio-tab.tsx   # Dashboard Manajemen Portofolio Pengguna
│   │   ├── admin-panel-tab.tsx # Panel Manajemen Data & Admin
│   │   ├── auth-modal.tsx      # Modal Login & Pendaftaran User
│   │   └── sidebar.tsx         # Sidebar Navigasi Utama
│   └── lib/                    # Utilitas, Helper, & Klien Supabase
├── public/                     # Aset Gambar, Ikon, & Favicon
├── .env.local                  # Konfigurasi Environment (Abaikan di Git)
├── package.json                # Dependensi Proyek
└── README.md                   # Dokumentasi Utama
```

---

## ⚙️ Panduan Instalasi & Jalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan, >= 18.x)
*   [Git](https://git-scm.com/)

### 2. Kloning Repository
```bash
git clone https://github.com/alfitranurr/NUNNN-STOCK-ANALYZER.git
cd NUNNN-STOCK-ANALYZER
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env.local` di root direktori proyek, lalu masukkan kunci berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Credentials (untuk login Google)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini API Key untuk AI News & Sentiment Summary
GEMINI_API_KEY=your-gemini-api-key

# OpenAI API Key (Opsional fallback)
OPENAI_API_KEY=your-openai-api-key

# Konfigurasi Akun Administrator Utama
NEXT_PUBLIC_ADMIN_EMAIL=alfitranurr@gmail.com
```

### 5. Jalankan Development Server
Jalankan perintah berikut untuk memulai server lokal:
```bash
npm run dev
```

Server akan aktif pada **[http://localhost:3000](http://localhost:3000)**. Buka tautan tersebut di browser Anda untuk melihat aplikasi berjalan.

---

## 🔌 API Endpoints Penting

### 1. `/api/ticker?symbol=[SYMBOL]`
Mengambil data terkini dan riwayat harga emiten saham dari Yahoo Finance.
*   **Method**: `GET`
*   **Contoh**: `/api/ticker?symbol=BBCA`

### 2. `/api/news/summary`
Mengambil berita terbaru dari URL rss, mendekode URL, mengambil teks penuh berita, dan menghasilkan ringkasan terstruktur berbasis AI.
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "title": "Judul Berita",
      "source": "Penerbit Berita",
      "link": "https://news.google.com/rss/articles/..."
    }
    ```

### 3. `/api/analysis/news?symbol=[SYMBOL]`
Menganalisis akumulasi sentimen dari 10 berita terbaru terkait emiten.
*   **Method**: `GET`

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Jika Anda ingin meningkatkan performa kalkulator, menambahkan grafik indikator teknikal baru, atau mengoptimalkan model prompt AI:

1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b fitur/fitur-baru`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. Push ke branch Anda (`git push origin fitur/fitur-baru`).
5. Buat Pull Request di GitHub.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Hak Cipta © 2026 **alfitranurr**.
