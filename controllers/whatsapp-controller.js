const Yup = require("yup");
const fs = require("fs").promises;
const path = require("path");
const {
  broadcastMessage: blastingMessage,
  getBroadcastHistories,
} = require("../lib/helper");

const whatsappStatusFile = path.resolve(__dirname, "../file-data", "whatsapp-status.json");
const whatsappQrCodeFile = path.resolve(__dirname, "../file-data", "whatsapp-qrcode.txt");

const validationSchema = Yup.object().shape({
  caption: Yup.string().required("Caption harus diisi"),
  penerima: Yup.mixed().required("Penerima harus diisi"),
});

const controller = {
  getStatus: async (req, res) => {
    try {
      const data = await fs.readFile(whatsappStatusFile, { encoding: "utf8" });
      const status = JSON.parse(data);
  
      return res.json({
        status: true,
        state: status
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: error?.message
      });
    }
  },
  getQrCode: async (req, res) => {
    try {
      const qrCode = await fs.readFile(whatsappQrCodeFile, { encoding: "utf-8"});
      return res.json({
        status: true,
        qrcode: qrCode
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: error?.message
      });
    }
  },
  getBroadcastHistories: async (req, res) => {
    try {
      const result = await getBroadcastHistories();
      return res.json({
        status: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        error: error?.message,
        status: false,
      });
    }
  },
  broadcastMessage: async (req, res) => {
    try {
      const io = req.io;
      const { caption, penerima } = req.body;
      const gambar = req.file?.path;
      await validationSchema.validate({
        caption: caption,
        penerima,
      });

      const phoneNumbers = penerima?.split(",").map(phone => phone.trim());

      if (!phoneNumbers.length) {
        return res
          .status(400)
          .json({ error: "No recipients found", status: false });
      }

      await blastingMessage(io, gambar, caption, phoneNumbers, res);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ 
        error: error.message, 
        status: false 
      });
    }
  },
};

module.exports = controller;