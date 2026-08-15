const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==================================
// MULTER - SƏS FAYLLARI
// ==================================

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ==================================
// YADDAŞ
// ==================================

let cagirislar = [];
let sesler = [];

// ==================================
// XƏSTƏ ÇAĞIRIŞI
// ==================================

app.post("/api/cagir", (req, res) => {

    const { palata, istek, dil } = req.body;

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
        dil: dil || "az",
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

// ==================================
// BÜTÜN ÇAĞIRIŞLAR
// ==================================

app.get("/api/cagirislar", (req, res) => {

    res.json(cagirislar);

});

// ==================================
// SƏS GÖNDƏR
// ==================================

app.post(
    "/api/ses-gonder",
    upload.single("ses"),
    (req, res) => {

        try {

            const { palata, dil } = req.body;

            if (!palata) {

                return res.status(400).json({
                    success: false,
                    message: "Palata məlumatı yoxdur"
                });

            }

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Səs faylı göndərilməyib"
                });

            }

            const ses = {

                id: Date.now(),

                palata: palata,

                dil: dil || "az",

                filename: req.file.originalname,

                mimetype: req.file.mimetype,

                size: req.file.size,

                audio: req.file.buffer.toString("base64"),

                vaxt: new Date().toISOString()

            };

            sesler.push(ses);

            console.log("🎙️ Yeni səs mesajı");
            console.log("Palata:", palata);
            console.log("Dil:", dil);
            console.log("Ölçü:", req.file.size);

            res.json({

                success: true,

                message: "Səs uğurla qəbul edildi",

                ses: {

                    id: ses.id,

                    palata: ses.palata,

                    dil: ses.dil,

                    filename: ses.filename,

                    mimetype: ses.mimetype,

                    size: ses.size,

                    vaxt: ses.vaxt

                }

            });

        } catch (error) {

            console.error("Səs xətası:", error);

            res.status(500).json({

                success: false,

                message: "Səsi qəbul etmək mümkün olmadı"

            });

        }

    }
);

// ==================================
// TİBB BACISI - SƏSLƏR
// ==================================

app.get("/api/sesler", (req, res) => {

    const cavab = sesler.map(ses => ({

        id: ses.id,

        palata: ses.palata,

        dil: ses.dil,

        filename: ses.filename,

        mimetype: ses.mimetype,

        size: ses.size,

        vaxt: ses.vaxt,

        audio: ses.audio

    }));

    res.json(cavab);

});

// ==================================
// SERVER TEST
// ==================================

app.get("/", (req, res) => {

    res.send("MedLive backend işləyir ✅");

});

// ==================================
// SERVERİ BAŞLAT
// ==================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `MedLive server ${PORT} portunda işləyir ✅`
    );

});