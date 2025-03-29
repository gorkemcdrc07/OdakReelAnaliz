const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();

// CORS ayarları
app.use(cors()); // Tüm isteklere izin verir, OPTIONS da dahil
app.use(express.json());

// API URL ve token
const API_URL = "https://api.odaklojistik.com.tr/api/tmsorders/getall";
const TOKEN = "49223653afa4b7e22c3659762c835dcdef9725a401e928fd46f697be8ea2597273bf4479cf9d0f7e5b8b03907c2a0b4d58625692c3e30629ac01fc477774de75";

// 📌 Sadece POST isteklerini kabul eden proxy
app.post("/proxy/tmsorders", async (req, res) => {
    try {
        console.log("📡 API isteği gönderiliyor...");
        console.log("📨 Gönderilen Veri:", req.body);

        // API isteği gönderme
        const response = await axios.post(API_URL, req.body, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log("✅ API Yanıtı Başarıyla Alındı:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("🔴 API Hatası:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: "API isteği başarısız",
            error: error.message,
            details: error.response?.data || "Detay yok",
        });
    }
});

// 🚨 Yanlışlıkla GET isteği atılırsa hata döndür
app.get("/proxy/tmsorders", (req, res) => {
    res.status(405).json({ message: "Bu endpoint sadece POST isteklerini kabul eder." });
});

// React frontend build dosyasını sunma
app.use(express.static("build"));

// React routing: Tüm yolları index.html'e yönlendir
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 📡 WebSocket kurulumu
const PORT = process.env.PORT || 10000; // 🌐 Render ile uyumlu hale getirildi
const server = http.createServer(app); // HTTP server'ı oluşturduk

// WebSocket server'ı oluşturduk ve 10000 portunda çalışacak şekilde ayarladık
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
    console.log("🔌 Yeni WebSocket bağlantısı kuruldu");

    ws.on("message", (message) => {
        console.log("📩 Mesaj alındı:", message);
        ws.send(`Sunucudan cevap: "${message}" alındı.`);
    });

    ws.send("🖐️ WebSocket bağlantısı başarıyla kuruldu.");
});

// 🚀 Sunucuyu başlat
server.listen(PORT, () => {
    console.log(`✅ Sunucu ${PORT} portunda çalışıyor (Render uyumlu).`);
});
