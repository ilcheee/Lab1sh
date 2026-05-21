const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ─── MULTER CONFIG ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ─── GET ALL ─────────────────────────────────────────────
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM media ORDER BY data_ngarkimit DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── UPLOAD ──────────────────────────────────────────────
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nuk u ngarkua asnjë skedar' });
  }

  const { originalname, mimetype, filename } = req.file;
  const rruga = '/uploads/' + filename;

  db.query(
    'INSERT INTO media (emri_skedarit, lloji, rruga, user_id) VALUES (?, ?, ?, ?)',
    [originalname, mimetype, rruga, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      res.status(201).json({ message: 'Skedari u ngarkua me sukses', id: result.insertId, rruga });
    }
  );
});

// ─── DELETE ──────────────────────────────────────────────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM media WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Media nuk u gjet' });
    res.json({ message: 'Media u fshi me sukses' });
  });
});

module.exports = router;