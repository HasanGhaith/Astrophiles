const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
const dataPath = path.join(__dirname, 'data.json');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Ensure data.json exists
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]', 'utf8');

// Serve frontend files from separate folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Optional: serve mathLibrary.html as default for /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'mathLibrary.html'));
});

// Return list of uploaded files (with title & cardId)
app.get('/files', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to read uploaded files' });
  }
});

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Handle file uploads
app.post('/upload', upload.array('files'), (req, res) => {
  const { title, cardId } = req.body;
  if (!title || !cardId) return res.status(400).json({ error: 'Title and cardId are required' });

  const files = req.files.map(f => f.originalname);

  // Read existing data
  let currentData = [];
  try {
    currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error("Error reading data.json:", err);
  }

  // Add new entry
  currentData.push({ title, cardId, files });

  // Write back to data.json
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf8');

  res.json({ message: 'Files uploaded!', files });
});

// Serve uploaded files for viewing/downloading
app.use('/uploads', express.static(uploadsDir));

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
