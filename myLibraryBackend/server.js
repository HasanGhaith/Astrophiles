// server.js
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Paths
const uploadsDir = path.join(__dirname, "uploads");
const dataPath = path.join(__dirname, "data.json");

// Ensure folders/files exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]");

// Serve static frontend if needed
app.use(express.static(path.join(__dirname, "../docs")));
app.use("/uploads", express.static(uploadsDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// GET all files/cards
app.get("/files", (_, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  res.json(data);
});

// UPLOAD endpoint
app.post("/upload", upload.array("files"), (req, res) => {
  const { title, category } = req.body;
  if (!title || !category) return res.status(400).json({ error: "Missing data" });

  const files = req.files.map((f) => f.filename);
  const cardId = `${category}_${title.replace(/\W/g, "_")}`;

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  data.push({ title, cardId, category, files });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// DELETE endpoint
app.delete("/delete-file", (req, res) => {
  const { filename, cardId } = req.body;

  let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  data = data
    .map((card) => {
      if (card.cardId !== cardId) return card;
      return { ...card, files: card.files.filter((f) => f !== filename) };
    })
    .filter((card) => card.files.length > 0);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  fs.unlink(path.join(uploadsDir, filename), () => {});
  res.json({ success: true });
});

// Use dynamic port for Render, fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));