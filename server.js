const express = require("express");
const cors = require("cors");

const app = express();

// Render kimi internet serverlərində verilən PORT-dan istifadə edir
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Çağırışları müvəqqəti yadda saxlayır
let cagirislar = [];

// Xəstə çağırış göndərir
app.post("/api/cagir", (req, res) => {
    const { palata, istek } = req.body;

    if (!palata || !istek) {
        return res.status(400).json({
            success: false,
            message: "Palata və istək məlumatı çatışmır"
        });
    }

    const cagiris = {
        id: Date.now(),
        palata: palata,
        istek: istek,
        vaxt: new Date().toISOString()
    };

    cagirislar.push(cagiris);

    console.log("🔔 Yeni çağırış");
    console.log("Palata:", palata);
    console.log("İstək:", istek);

    res.json({
        success: true,
        message: "Çağırış qəbul edildi",
        cagiris: cagiris
    });
});

// Tibb bacısı bütün çağırışları görə bilər
app.get("/api/cagirislar", (req, res) => {
    res.json(cagirislar);
});

// Test üçün
app.get("/", (req, res) => {
    res.send("MedLive backend işləyir ✅");
});

// Serveri başladır
app.listen(PORT, "0.0.0.0", () => {
    console.log(`MedLive server ${PORT} portunda işləyir ✅`);
});