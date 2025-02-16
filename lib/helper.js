const path = require("path");
const fs = require("fs");
const { client, MessageMedia } = require("../whatsapp");
const dayjs = require("dayjs");
const _ = require("lodash");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.resolve(__dirname, "../database", "data.db")
);

const getWhatsappRecipient = (phoneNumber) => {
  let cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");
  if (cleanedNumber.startsWith("+")) {
    cleanedNumber = cleanedNumber.substring(1);
  } else if (cleanedNumber.startsWith("0")) {
    cleanedNumber = "62" + cleanedNumber.substring(1);
  }

  return `${cleanedNumber}@c.us`;
};

const getBroadcastHistories = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM broadcast_histories ORDER BY unixtime DESC LIMIT 10",
      [],
      (err, rows) => {
        if (err) {
          console.error("Gagal mengambil data dari database:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const addBroadcastHistory = (newHistory) => {
  return new Promise((resolve, reject) => {
    const {
      id,
      waktu,
      unixtime,
      jumlahPenerima,
      jumlahTerkirim,
      gambar,
      caption,
    } = newHistory;
    db.run(
      `INSERT INTO broadcast_histories (id, waktu, unixtime, jumlahPenerima, jumlahTerkirim, gambar, caption) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, waktu, unixtime, jumlahPenerima, jumlahTerkirim, gambar, caption],
      function (err) {
        if (err) {
          console.error("Gagal menambahkan broadcast history:", err.message);
          reject(err);
        } else {
          console.log("Broadcast history berhasil ditambahkan.");
          resolve(true);
        }
      }
    );
  });
};

const updateBroadcastHistory = (id, jumlahTerkirim) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE broadcast_histories SET jumlahTerkirim = ? WHERE id = ?`,
      [jumlahTerkirim, id],
      function (err) {
        if (err) {
          console.error("Gagal memperbarui broadcast history:", err.message);
          reject(err);
        } else if (this.changes === 0) {
          console.warn(`Broadcast history dengan ID ${id} tidak ditemukan.`);
          resolve(false);
        } else {
          console.log(`Broadcast history dengan ID ${id} berhasil diperbarui.`);
          resolve(true);
        }
      }
    );
  });
};

const broadcastMessage = async (
  io,
  gambar,
  caption,
  phoneNumbers = [],
  res
) => {
  if (!phoneNumbers.length) {
    return res
      .status(400)
      .json({ error: "No recipients found", status: false });
  }

  let decodedCaption = decodeURIComponent(caption)?.replace(/\\n/g, "\n");

  const broadcastId = Math.random().toString(32).substring(2, 9);

  addBroadcastHistory({
    id: broadcastId,
    waktu: dayjs().format("DD/MM/YYYY HH:mm"),
    unixtime: dayjs().unix(),
    jumlahPenerima: phoneNumbers.length,
    jumlahTerkirim: 0,
    gambar: gambar ? `/uploads/${path.basename(gambar)}` : null,
    caption: decodedCaption,
  });

  res
    .status(200)
    .json({
      message: `Sedang mengirimkan pesan ke ${phoneNumbers?.length} user`,
      status: true,
      broadcastId,
    });

  (async () => {
    let sentCount = 0;
    const delayOptions = [3, 5, 7];
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const phone of phoneNumbers) {
      const formattedPhone = getWhatsappRecipient(phone);

      try {
        if (gambar) {
          const mediaPath = path.resolve(
            __dirname,
            "../uploads",
            path.basename(gambar)
          );
          if (fs.existsSync(mediaPath)) {
            const media = MessageMedia.fromFilePath(mediaPath);
            await client.sendMessage(formattedPhone, media, {
              caption: decodedCaption,
            });
          } else {
            console.error(`Image not found: ${gambar}`);
          }
        } else {
          await client.sendMessage(formattedPhone, decodedCaption);
        }

        console.log(`Pesan terkirim ke ${formattedPhone}`);
        sentCount++;
        updateBroadcastHistory(broadcastId, sentCount);
        io.emit("broadcastState", { broadcastId, sentCount });
      } catch (sendError) {
        console.error(
          `Gagal mengirim pesan ke ${formattedPhone}: ${sendError.message}`
        );
      }

      const randomDelay =
        delayOptions[Math.floor(Math.random() * delayOptions.length)] * 1000;
      await delay(randomDelay);
    }
  })();
};

module.exports = {
  getWhatsappRecipient,
  broadcastMessage,
  getBroadcastHistories,
  addBroadcastHistory,
  updateBroadcastHistory,
};
