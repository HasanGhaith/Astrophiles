const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

import cors from 'cors';
app.use(cors());

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
const dataPath = path.join(__dirname, 'data.json');

// ensure folders/files
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');

app.use(express.static(path.join(__dirname, '../docs')));
app.use('/uploads', express.static(uploadsDir));

// multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET all cards
app.get('/files', (_, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  res.json(data);
});

// UPLOAD
app.post('/upload', upload.array('files'), (req, res) => {
  const { title, category } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const files = req.files.map(f => f.filename);
  const cardId = `${category}_${title.replace(/\W/g, '_')}`;

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.push({ title, cardId, category, files });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// DELETE file
app.delete('/delete-file', (req, res) => {
  const { filename, cardId } = req.body;

  let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  data = data.map(card => {
    if (card.cardId !== cardId) return card;
    return { ...card, files: card.files.filter(f => f !== filename) };
  }).filter(card => card.files.length > 0);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  fs.unlink(path.join(uploadsDir, filename), () => {});
  res.json({ success: true });
});

app.listen(3000, () =>
  console.log('✅ Server running at http://localhost:3000')
);  