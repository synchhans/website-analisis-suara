# 🗣️ Analisis Suara AI - Analisis Kepribadian dari Ucapan

Selamat datang di Analisis Suara AI, sebuah aplikasi web modern yang menggunakan kecerdasan buatan untuk menganalisis transkripsi suara Anda dan memberikan wawasan tentang kepribadian Anda berdasarkan model Big Five (OCEAN).

**URL Aplikasi:** [https://analisis-suara.vercel.app](https://analisis-suara.vercel.app)

![Screenshot Aplikasi Analisis Suara](https://imgkub.com/images/2025/07/25/Screenshot-2025-07-26-012800.png)

## ✨ Fitur Utama

- **Transkripsi Suara:** Rekam suara Anda langsung dari browser dan dapatkan transkripsi akurat dalam Bahasa Indonesia.
- **Analisis Kepribadian Berbasis AI:** Dapatkan skor dan penjelasan untuk 5 sifat kepribadian utama (OCEAN) dari hasil transkripsi.
- **Autentikasi Aman dengan Google:** Login dengan mudah dan aman menggunakan akun Google Anda.
- **Dashboard Pengguna:** Lihat riwayat semua analisis yang pernah Anda lakukan, diurutkan dari yang terbaru.
- **Rate Limiting:** Pengguna anonim memiliki batas 5 analisis per hari untuk menjaga efisiensi API.
- **Admin Panel Profesional:**
  - Mengelola daftar pengguna yang diizinkan untuk login (Tambah & Update Role).
  - Mengubah dan menyempurnakan _prompt_ AI secara dinamis tanpa perlu mengubah kode.

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Bahasa:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) dengan Mongoose
- **Autentikasi:** [NextAuth.js (Auth.js)](https://next-auth.js.org/)
- **Layanan AI:**
  - **Transkripsi (Suara ke Teks):** [Deepgram](https://deepgram.com/)
  - **Analisis (Teks ke Kepribadian):** [OpenRouter](https://openrouter.ai/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Cara Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan aplikasi ini di komputer Anda.

### 1. Prasyarat

- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- Akun MongoDB Atlas, Google Cloud Platform, Deepgram, dan OpenRouter untuk mendapatkan API keys.

### 2. Instalasi

Clone repositori ini dan instal semua dependensi:

```bash
git clone https://github.com/synchhans/website-analisis-suara.git
cd website-analisis-suara
npm install
```

### 3. Konfigurasi Variabel Lingkungan

Buat file `.env.local` di root proyek dan isi dengan kredensial Anda, bisa hubungi developer via Instagram yang ada di bio untuk mengetahui kredensial yang dibutuhkan.

### 4. Jalankan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

Dibuat oleh **Muhamad Farhan**.
