const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// ==================================
// ƏSAS AYARLAR
// ==================================

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

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
// TİBB İŞÇİLƏRİ
// ==================================
// Sonradan bunları database-ə keçirəcəyik.
// ==================================

const tibbiIsci = [
    {
        username: "huseyn",
        password: "1234",
        ad: "Hüseyn",
        palatalar: [407, 408]
    },

    {
        username: "xalid",
        password: "1234",
        ad: "Xalid",
        palatalar: [407, 408]
    }
];

// ==================================
// ANA SƏHİFƏ
// ==================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "medistyle-tibb.html")
    );

});

// ==================================
// LOGIN
// ==================================

app.post("/api/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({

            success: false,

            message:
                "İstifadəçi adı və şifrə tələb olunur."

        });

    }

    const user =
        tibbiIsci.find(
            item =>
                item.username === username &&
                item.password === password
        );

    if (!user) {

        return res.status(401).json({

            success: false,

            message:
                "İstifadəçi adı və ya şifrə yanlışdır."

        });

    }

    console.log(
        "🔐 Giriş:",
        user.ad
    );

    res.json({

        success: true,

        user: {

            username: user.username,

            ad: user.ad,

            palatalar: user.palatalar

        }

    });

});

// ==================================
// XƏSTƏ ÇAĞIRIŞI GÖNDƏR
// ==================================

app.post("/api/cagir", (req, res) => {

    const {
        palata,
        istek,
        dil
    } = req.body;

    if (!palata || !istek) {

        return res.status(400).json({

            success: false,

            message:
                "Palata və istək məlumatı çatışmır."

        });

    }

    const palataNomresi =
        Number(palata);

    const cagiris = {

        id: Date.now(),

        palata: palataNomresi,

        istek: istek,

        dil: dil || "az",

        vaxt:
            new Date().toISOString(),

        status: "new",

        qebulEden: null

    };

    cagirislar.push(cagiris);

    console.log("🔔 Yeni çağırış");
    console.log(
        "Palata:",
        palataNomresi
    );
    console.log(
        "İstək:",
        istek
    );

    res.json({

        success: true,

        message:
            "Çağırış qəbul edildi.",

        cagiris: cagiris

    });

});

// ==================================
// ÇAĞIRIŞLARI GƏTİR
// ==================================
// ?palata=407 göndərilərsə
// yalnız 407 gəlir.
// ==================================

app.get("/api/cagirislar", (req, res) => {

    const palata =
        req.query.palata
            ? Number(req.query.palata)
            : null;

    let netice =
        cagirislar;

    if (palata) {

        netice =
            cagirislar.filter(
                item =>
                    Number(item.palata) === palata
            );

    }

    res.json({

        success: true,

        cagirislar: netice

    });

});

// ==================================
// ÇAĞIRIŞI QƏBUL ET
// ==================================

app.put("/api/cagir/:id/qebul", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        qebulEden,
        palata
    } = req.body;

    const cagiris =
        cagirislar.find(
            item =>
                item.id === id
        );

    if (!cagiris) {

        return res.status(404).json({

            success: false,

            message:
                "Çağırış tapılmadı."

        });

    }

    // Əgər palata göndərilibsə,
    // başqa palatanın çağırışını
    // qəbul etməyə icazə vermirik.

    if (
        palata &&
        Number(palata) !==
        Number(cagiris.palata)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Bu çağırış seçilmiş palataya aid deyil."

        });

    }

    cagiris.status =
        "accepted";

    cagiris.qebulEden =
        qebulEden || null;

    cagiris.qebulVaxt =
        new Date().toISOString();

    console.log(
        "✅ Qəbul edildi:",
        cagiris.id
    );

    console.log(
        "👤 Qəbul edən:",
        qebulEden
    );

    console.log(
        "🛏️ Palata:",
        cagiris.palata
    );

    res.json({

        success: true,

        message:
            "Çağırış qəbul edildi.",

        cagiris:
            cagiris

    });

});

// ==================================
// ALTERNATİV QƏBUL
// ==================================

app.put(
    "/api/cagirislar/:id/accept",
    (req, res) => {

        const id =
            Number(req.params.id);

        const {
            qebulEden
        } = req.body;

        const cagiris =
            cagirislar.find(
                item =>
                    item.id === id
            );

        if (!cagiris) {

            return res.status(404).json({

                success: false,

                message:
                    "Çağırış tapılmadı."

            });

        }

        cagiris.status =
            "accepted";

        cagiris.qebulEden =
            qebulEden || null;

        cagiris.qebulVaxt =
            new Date().toISOString();

        res.json({

            success: true,

            message:
                "Çağırış qəbul edildi.",

            cagiris:
                cagiris

        });

    }
);

// ==================================
// ÇAĞIRIŞI SİL
// ==================================

app.delete("/api/cagir/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const index =
        cagirislar.findIndex(
            item =>
                item.id === id
        );

    if (index === -1) {

        return res.status(404).json({

            success: false,

            message:
                "Çağırış tapılmadı."

        });

    }

    const silinen =
        cagirislar.splice(
            index,
            1
        )[0];

    console.log(
        "🗑️ Çağırış silindi:",
        silinen.id
    );

    res.json({

        success: true,

        message:
            "Çağırış silindi.",

        id: id

    });

});

// ==================================
// ALTERNATİV SİLMƏ
// ==================================

app.delete(
    "/api/cagirislar/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        const index =
            cagirislar.findIndex(
                item =>
                    item.id === id
            );

        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "Çağırış tapılmadı."

            });

        }

        cagirislar.splice(
            index,
            1
        );

        res.json({

            success: true,

            message:
                "Çağırış silindi.",

            id: id

        });

    }
);

// ==================================
// SƏS GÖNDƏR
// ==================================

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

                    message:
                        "Palata məlumatı yoxdur."

                });

            }

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Səs faylı göndərilməyib."

                });

            }

            const ses = {

                id: Date.now(),

                palata:
                    Number(palata),

                dil:
                    dil || "az",

                filename:
                    req.file.originalname,

                mimetype:
                    req.file.mimetype,

                size:
                    req.file.size,

                audio:
                    req.file.buffer.toString(
                        "base64"
                    ),

                vaxt:
                    new Date().toISOString()

            };

            sesler.push(ses);

            console.log(
                "🎙️ Yeni səs mesajı"
            );

            console.log(
                "🛏️ Palata:",
                ses.palata
            );

            res.json({

                success: true,

                message:
                    "Səs uğurla qəbul edildi.",

                ses: {

                    id:
                        ses.id,

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

        }

        catch (error) {

            console.error(
                "❌ Səs xətası:",
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

// ==================================
// SƏSLƏRİ GƏTİR
// ==================================

app.get("/api/sesler", (req, res) => {

    const palata =
        req.query.palata
            ? Number(req.query.palata)
            : null;

    let netice =
        sesler;

    if (palata) {

        netice =
            sesler.filter(
                item =>
                    Number(item.palata) === palata
            );

    }

    res.json({

        success: true,

        sesler: netice

    });

});

// ==================================
// SƏSİ SİL
// ==================================

app.delete("/api/ses/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const index =
        sesler.findIndex(
            item =>
                item.id === id
        );

    if (index === -1) {

        return res.status(404).json({

            success: false,

            message:
                "Səs tapılmadı."

        });

    }

    sesler.splice(
        index,
        1
    );

    res.json({

        success: true,

        message:
            "Səs silindi.",

        id: id

    });

});

// ==================================
// SERVER TEST
// ==================================

app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message:
            "MedLive backend işləyir ✅",

        cagirisSayi:
            cagirislar.length,

        sesSayi:
            sesler.length

    });

});

// ==================================
// PALATALAR
// ==================================

app.get("/api/palatalar", (req, res) => {

    res.json({

        success: true,

        palatalar: [
            407,
            408
        ]

    });

});

// ==================================
// SERVERİ BAŞLAT
// ==================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `MedLive server ${PORT} portunda işləyir ✅`
        );

    }
);