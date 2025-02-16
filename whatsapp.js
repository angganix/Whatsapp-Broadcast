const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs");

let io;

// Create a new client instance
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./auth-session",
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

function initialize(socketIo) {
  io = socketIo;

  const whatsappStatusFile = path.resolve(
    __dirname,
    "file-data",
    "whatsapp-status.json"
  );
  const whatsappQrcodeFile = path.resolve(
    __dirname,
    "file-data",
    "whatsapp-qrcode.txt"
  );

  // Loading screen
  client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
    io.emit("whatsappState", {
      status: "loading",
      message: `Loading Screen...${percent}%`,
    });

    const statusContent = {
      status: "loading",
      message: `Loading Screen... ${percent}%`,
    };
    fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
      if (err) {
        console.error("Error to write whatsapp status to file:", err);
      }
    });
  });

  // Berhasil Terotentikasi
  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
    io.emit("whatsappState", {
      status: "authenticated",
      message: "Authenticated",
    });

    const statusContent = {
      status: "authenticated",
      message: "Authenticated",
    };
    fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
      if (err) {
        console.error("Error to write whatsapp status to file:", err);
      }
    });
  });

  // Siap menerima pesan
  client.on("ready", async () => {
    console.log("READY");
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    client.pupPage.on("pageerror", function (err) {
      console.log("Page error: " + err.toString());
      io.emit("whatsappState", {
        status: "disconnected",
        message: "Disconnected",
      });
    });

    client.pupPage.on("error", function (err) {
      console.log("Page error: " + err.toString());
      io.emit("whatsappState", {
        status: "disconnected",
        message: "Disconnected",
      });
    });

    io.emit("whatsappState", { status: "ready", message: "Ready" });

    const statusContent = {
      status: "ready",
      message: "Whatsapp Ready to Use",
    };
    fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
      if (err) {
        console.error("Error to write whatsapp status to file:", err);
      }
    });
  });

  // Gagal Terotentikasi
  client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
    io.emit("whatsappState", {
      status: "auth_failure",
      message: "Authentication Failure",
    });

    const statusContent = {
      status: "auth_failure",
      message: "Authentication Failure",
    };
    fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
      if (err) {
        console.error("Error to write whatsapp status to file:", err);
      }
    });
  });

  // When the client received QR-Code
  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.log("Error generating QR code", err);
        io.emit("whatsappState", {
          status: "error_qrcode",
          message: "Error generating QR code",
        });
        fs.writeFile(whatsappQrcodeFile, "", (err) => {
          if (err) {
            console.error("Gagal mengosongkan file:", err);
          } else {
            console.log("File berhasil dikosongkan");
          }
        });
        return;
      }
      io.emit("whatsappState", { status: "qrcode", message: url });
      fs.writeFile(whatsappQrcodeFile, url, (err) => {
        if (err) {
          console.error("Cannot write qrcode to file:", err);
        } else {
          console.log("QRCode updated to file");
        }
      });

      const statusContent = {
        status: "qrcode",
        message: "Scan QR Code di atas menggunakan ponsel",
      };
      fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
        if (err) {
          console.error("Error to write whatsapp status to file:", err);
        }
      });
    });
  });

  // Ketika ter-logout
  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
    io.emit("whatsappState", {
      status: "disconnected",
      message: "Disconnected",
    });

    const statusContent = {
      status: "loading",
      message: `Loading Screen...`,
    };

    fs.writeFile(whatsappStatusFile, JSON.stringify(statusContent), (err) => {
      if (err) {
        console.error("Error to write whatsapp status to file:", err);
      }
    });
    fs.writeFile(whatsappQrcodeFile, "", (err) => {
      if (err) {
        console.error("Gagal mengosongkan file:", err);
      } else {
        console.log("File berhasil dikosongkan");
      }
    });
  });

  // Ketika menerima pesan
  client.on("message", (message) => {
    console.log({ message });
  });

  client.on("message_create", (message) => {
    console.log({ message });
  });

  // Start your client
  client.initialize();
}

module.exports = { initialize, client, MessageMedia };
