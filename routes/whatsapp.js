const router = require("express").Router();
const controller = require("../controllers/whatsapp-controller");
const { upload } = require("../middlewares/upload-file");

router.get("/status", controller.getStatus);
router.get("/qrcode", controller.getQrCode);
router.get("/broadcast/history", controller.getBroadcastHistories);
router.post("/broadcast", upload.single("gambar"), controller.broadcastMessage);

module.exports = router;