const config = {
    vps: {
        // DI VERCEL: Gunakan localhost atau kosongkan karena Vercel 
        // menggunakan URL deployment otomatis (misal: proyekku.vercel.app)
        ip: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost',
        port: process.env.PORT || 3000
    },
    
    android: {
        minSdkVersion: 21,
        targetSdkVersion: 33,
        compileSdkVersion: 33,
        versionCode: 1,
        versionName: "1.0"
    },
    
    build: {
        // PENTING: Di Vercel cache harus false karena storage bersifat sementara (ephemeral)
        enableCache: false, 
        maxConcurrentBuilds: 1, // Vercel Free terbatas, jangan banyak-banyak
        timeoutMinutes: 1 // Vercel Free timeout biasanya hanya 10-60 detik
    },
    
    // Telegram download history settings
    telegram: {
        enableHistory: false, // Matikan jika tidak pakai database eksternal, karena di Vercel history akan hilang tiap restart
        maxHistoryEntries: 10
    }
};

module.exports = config;
// Konfigurasi ini sudah dioptimasi untuk Vercel Serverless
