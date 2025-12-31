const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
const dataPath = path.join(__dirname, 'data.json');

// Ensure folders/files exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]', 'utf8');

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'mathLibrary.html'));
});

// Get library data
app.get('/files', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  res.json(data);
});

// Multer setup
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Upload files
app.post('/upload', upload.array('files'), (req, res) => {
  const { title, cardId } = req.body;
  if (!title || !cardId) return res.sendStatus(400);

  const files = req.files.map(f => f.originalname);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  data.push({ title, cardId, files });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ success: true });
});

// DELETE FILE (THIS IS WHAT YOU WERE MISSING)
app.delete('/delete-file', (req, res) => {
  const { filename, cardId } = req.body;

  let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  data = data.map(entry => {
    if (entry.cardId !== cardId) return entry;
    return {
      ...entry,
      files: entry.files.filter(f => f !== filename)
    };
  }).filter(entry => entry.files.length > 0);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  res.json({ success: true });
});

// Serve uploads
app.use('/uploads', express.static(uploadsDir));

app.listen(3000, () =>
  console.log('✅ Server running at http://localhost:3000')
);
