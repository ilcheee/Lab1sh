const router = require('express').Router();
const db = require('../config/db');
const path = require('path');
const multer = require('multer');
const verifyToken = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, Date.now() + '-' + safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ─── UPLOAD MEDIA ────────────────────────────────────────
router.post('/upload', verifyToken, upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── GET ALL POSTS (with optional filters) ───────────────
// Query params: ?statusi=published&category_id=1&user_id=2&limit=6
router.get('/', (req, res) => {
  const { statusi, category_id, user_id, limit } = req.query;

  let sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const values = [];

  if (statusi) {
    if (statusi === 'published') {
      sql += " AND p.statusi IN ('published', 'publikuar')";
    } else {
      sql += ' AND p.statusi = ?';
      values.push(statusi);
    }
  }
  if (category_id) { sql += ' AND p.category_id = ?'; values.push(parseInt(category_id)); }
  if (user_id) { sql += ' AND p.user_id = ?'; values.push(parseInt(user_id)); }

  sql += ' ORDER BY p.created_at DESC';

  if (limit) { sql += ' LIMIT ?'; values.push(parseInt(limit)); }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

// ─── GET SINGLE POST ─────────────────────────────────────
router.get('/:id', (req, res) => {
  const sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(results[0]);
  });
});

// ─── CREATE POST ─────────────────────────────────────────
router.post('/', verifyToken, (req, res) => {
  const { titulli, permbajtja, category_id, statusi, data_publikimit, imazhi } = req.body;

  if (!titulli || !permbajtja) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const sql = `
    INSERT INTO posts (titulli, permbajtja, user_id, category_id, statusi, data_publikimit, imazhi)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    titulli,
    permbajtja,
    req.user.id,
    category_id || null,
    statusi || 'draft',
    data_publikimit || null,
    imazhi || null,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.status(201).json({ message: 'Post created', id: result.insertId });
  });
});

// ─── UPDATE POST ─────────────────────────────────────────
router.put('/:id', verifyToken, (req, res) => {
  const { titulli, permbajtja, category_id, statusi, data_publikimit, imazhi } = req.body;

  const sql = `
    UPDATE posts
    SET titulli=?, permbajtja=?, category_id=?, statusi=?, data_publikimit=?, imazhi=?
    WHERE id=?
  `;
  const values = [titulli, permbajtja, category_id || null, statusi, data_publikimit || null, imazhi || null, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post updated' });
  });
});

// ─── DELETE POST ─────────────────────────────────────────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM posts WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  });
});

// ─── LIKE POST ───────────────────────────────────────────
router.post('/:id/like', (req, res) => {
  db.query(
    'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
      db.query('SELECT likes FROM posts WHERE id = ?', [req.params.id], (err2, rows) => {
        res.json({ likes: rows?.[0]?.likes || 0 });
      });
    }
  );
});

module.exports = router;
