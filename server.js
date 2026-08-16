const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// SƏS FAYLLARI
// ==========================================

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ==========================================
// YADDAŞ
// ==========================================

let cagirislar = [];
let sesler = [];

// ==========================================
// TİBB BACILARI
// ==========================================

const istifadeciler = [
    {
        id: 1,
        ad: "Hüseyn",
        username: "huseyn",
        password: "huseyn123"
    },
    {
        id: 2,
        ad: "Xalid",
        username: "xalid",
        password: "xalid123"
    }
];

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "İstifadəçi adı və şifrə daxil edin."
        });
    }

    const user = istifadeciler.find(
        x =>
            x.username === username &&
            x.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "İstifadəçi adı və ya şifrə yanlışdır."
        });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            ad: user.ad,
            username: user.username
        }
    });
});

// ==========================================
// XƏSTƏ ÇAĞIRIŞ GÖNDƏRİR
// ==========================================

app.post("/api/cagir", (req, res) => {

    const {
        palata,
        istek,
        dil
    } = req.body;

    if (!palata || !istek) {
        return res.status(400).json({
            success: false,
            message: "Palata və istək məlumatı çatışmır."
        });
    }

    const cagiris = {
        id: Date.now(),

        palata: String(palata),

        istek: istek,

        dil: dil || "az",

        status: "new",

        qebulEden: null,

        vaxt: new Date().toISOString()
    };

    cagirislar.push(cagiris);

    console.log("🔔 YENİ ÇAĞIRIŞ");
    console.log("Palata:", cagiris.palata);
    console.log("İstək:", cagiris.istek);

    res.json({
        success: true,
        cagiris: cagiris
    });
});

// ==========================================
// ÇAĞIRIŞLARI GÖTÜR
// ==========================================

app.get("/api/cagirislar", (req, res) => {

    const palata = req.query.palata;

    let netice = cagirislar;

    if (palata) {

        netice = cagirislar.filter(
            x => x.palata === String(palata)
        );

    }

    res.json({
        success: true,
        cagirislar: netice
    });
});

// ==========================================
// ÇAĞIRIŞI QƏBUL ET
// ==========================================

app.put("/api/cagir/:id/qebul", (req, res) => {

    const id = Number(req.params.id);

    const {
        qebulEden
    } = req.body;

    const cagiris =
        cagirislar.find(
            x => x.id === id
        );

    if (!cagiris) {

        return res.status(404).json({
            success: false,
            message: "Çağırış tapılmadı."
        });

    }

    cagiris.status = "accepted";

    cagiris.qebulEden =
        qebulEden || "Tibb bacısı";

    cagiris.qebulVaxt =
        new Date().toISOString();

    console.log(
        "✅ Çağırış qəbul edildi:",
        id
    );

    res.json({
        success: true,
        message: "Çağırış qəbul edildi.",
        cagiris: cagiris
    });
});

// ==========================================
// ÇAĞIRIŞI SİL
// ==========================================

app.delete("/api/cagir/:id", (req, res) => {

    const id = Number(req.params.id);

    const index =
        cagirislar.findIndex(
            x => x.id === id
        );

    if (index === -1) {

        return res.status(404).json({
            success: false,
            message: "Çağırış tapılmadı."
        });

    }

    const silinen =
        cagirislar.splice(index, 1)[0];

    console.log(
        "🗑️ Çağırış silindi:",
        silinen.id
    );

    res.json({
        success: true,
        message: "Çağırış serverdən silindi."
    });
});

// ==========================================
// SƏS GÖNDƏR
// ==========================================

app.post(
    "/api/ses-gonder",
    upload.single("ses"),
    (req, res) => {

        try {

            const {
                palata,
                dil
            } = req.body;

            if (!palata) {

                return res.status(400).json({
                    success: false,
                    message: "Palata məlumatı yoxdur."
                });

            }

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Səs faylı göndərilməyib."
                });

            }

            const ses = {

                id: Date.now(),

                palata: String(palata),

                dil: dil || "az",

                filename:
                    req.file.originalname,

                mimetype:
                    req.file.mimetype,

                size:
                    req.file.size,

                audio:
                    req.file.buffer.toString("base64"),

                vaxt:
                    new Date().toISOString()

            };

            sesler.push(ses);

            console.log("🎙️ YENİ SƏS");

            console.log(
                "Palata:",
                ses.palata
            );

            res.json({

                success: true,

                message:
                    "Səs uğurla qəbul edildi.",

                ses: {

                    id: ses.id,

                    palata:
                        ses.palata,

                    dil:
                        ses.dil,

                    filename:
                        ses.filename,

                    mimetype:
                        ses.mimetype,

                    size:
                        ses.size,

                    vaxt:
                        ses.vaxt

                }

            });

        } catch (error) {

            console.error(
                "Səs xətası:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Səsi qəbul etmək mümkün olmadı."

            });

        }

    }
);

// ==========================================
// SƏSLƏRİ GÖTÜR
// ==========================================

app.get("/api/sesler", (req, res) => {

    const palata = req.query.palata;

    let netice = sesler;

    if (palata) {

        netice = sesler.filter(
            x => x.palata === String(palata)
        );

    }

    res.json({
        success: true,
        sesler: netice
    });
});

// ==========================================
// SƏSİ SİL
// ==========================================

app.delete("/api/ses/:id", (req, res) => {

    const id = Number(req.params.id);

    const index =
        sesler.findIndex(
            x => x.id === id
        );

    if (index === -1) {

        return res.status(404).json({
            success: false,
            message: "Səs tapılmadı."
        });

    }

    sesler.splice(index, 1);

    console.log(
        "🗑️ Səs silindi:",
        id
    );

    res.json({
        success: true,
        message: "Səs serverdən silindi."
    });
});

// ==========================================
// SERVER TEST
// ==========================================

app.get("/", (req, res) => {

    res.send(
        "Medistyle Hospital backend işləyir ✅"
    );

});

// ==========================================
// SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Medistyle server ${PORT} portunda işləyir ✅`
        );

    }
);
