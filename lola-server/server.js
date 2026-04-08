require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');

const app           = express();
const PORT          = process.env.PORT          || 3001;
const IMAGES_DIR    = process.env.IMAGES_DIR    || '/home/villanoeva/cosmo_images';
const UPLOAD_PASS   = process.env.UPLOAD_PASSWORD;
const TAGS_FILE     = path.join(IMAGES_DIR, 'tags.json');

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://ccoossmmoo.com',
    'https://www.ccoossmmoo.com',
    /\.vercel\.app$/
  ]
}));

app.use(express.json());

// ── Images (static) ────────────────────────────────────────────────────────
app.use('/images', express.static(IMAGES_DIR));

// ── Helpers ────────────────────────────────────────────────────────────────
function readTags() {
  return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8'));
}

function writeTags(data) {
  fs.writeFileSync(TAGS_FILE, JSON.stringify(data, null, 2));
}

// ── API ────────────────────────────────────────────────────────────────────

// GET /api/projects?tag=culture
app.get('/api/projects', (req, res) => {
  const data     = readTags();
  const EXCLUDE  = ['unknown', 'exclude'];
  let projects   = data.projects.filter(p => !EXCLUDE.includes(p.project));
  if (req.query.tag) {
    projects = projects.filter(p => p.tags.includes(req.query.tag));
  }
  res.json(projects);
});

// GET /api/tags
app.get('/api/tags', (req, res) => {
  res.json(readTags().tag_taxonomy);
});

// ── Upload (password protected) ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: IMAGES_DIR,
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Serve the upload form
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

// Handle upload submission
app.post('/api/upload', upload.array('images'), (req, res) => {
  const { password, project, label, tags, description, nav_code } = req.body;

  if (!UPLOAD_PASS || password !== UPLOAD_PASS) {
    return res.status(401).json({ error: 'Wrong password.' });
  }

  if (!project || !label) {
    return res.status(400).json({ error: 'project and label are required.' });
  }

  const data      = readTags();
  const tagList   = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const images    = req.files.map(f => f.filename);
  const existing  = data.projects.find(p => p.project === project);

  if (existing) {
    existing.images.push(...images);
    if (tagList.length)  existing.tags        = tagList;
    if (description)     existing.description = description;
    if (nav_code)        existing.nav_code    = nav_code;
  } else {
    data.projects.push({ project, label, nav_code: nav_code || null, description: description || '', tags: tagList, images });
  }

  writeTags(data);
  res.json({ ok: true, project, images_added: images.length });
});

// ── Boot ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Cosmo server running on :${PORT}`);
  console.log(`Images: ${IMAGES_DIR}`);
});
