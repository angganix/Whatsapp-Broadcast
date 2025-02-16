require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const whatsapp = require("./whatsapp");
const cors = require("cors");
const authentication = require("./middlewares/authentication");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = process.env.BASE_PORT || 2004;

// Set view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// starting whatsapp with socket io
whatsapp.initialize(io);

// Demo Page route
app.get("/", (req, res) => {
  res.render("index", {
    baseUrl:
      process.env.ENVIRONMENT === "development"
        ? `${process.env.BASE_URL}:${port}`
        : `${process.env.BASE_URL}`,
    apiUrl:
      process.env.ENVIRONMENT === "development"
        ? `${process.env.BASE_URL}:${port}/api`
        : `${process.env.BASE_URL}/api`,
    token: process.env.AUTH_TOKEN,
  });
});

// Route Endpoint
const whatsappRoutes = require("./routes/whatsapp");

// API endpoint
app.get("/api", authentication, (req, res) => {
  res.json({ message: "There is nothing here!" });
});

app.use(
  "/api/whatsapp",
  authentication,
  (req, res, next) => {
    req.io = io;
    req.whatsapp = whatsapp;
    return next();
  },
  whatsappRoutes
);

server.listen(port, () => {
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
  console.log(`Backend server running at http://localhost:${port}`);
});
