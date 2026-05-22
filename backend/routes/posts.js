const router = require('express').Router();
const db = require('../config/db');
const path = require('path');
const multer = require('multer');
const verifyToken = require('../middleware/auth');
const { checkRole, hasPermission } = require('../middleware/checkRole');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, Date.now() + '-' + safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ── Middleware: broad permission OR ownership ─────────────
const checkPostOwnership = (broadPerm, ownPerm) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Jo i autorizuar' });
  if (hasPermission(req.user.role_id, broadPerm)) return next();
  if (hasPermission(req.user.role_id, ownPerm)) {
    db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows.length) return res.status(404).json({ message: 'Post not found' });
      if (rows[0].user_id !== req.user.id)
        return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
      next();
    });
    return;
  }
  return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
};

// ─── UPLOAD MEDIA ────────────────────────────────────────
router.post('/upload', verifyToken, checkRole('media.upload'), upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── GET ALL POSTS ────────────────────────────────────────
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

// ─── GET SINGLE POST ──────────────────────────────────────
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
    if (!results.length) return res.status(404).json({ message: 'Post not found' });
    res.json(results[0]);
  });
});

// ─── CREATE POST ──────────────────────────────────────────
router.post('/', verifyToken, checkRole('posts.create'), (req, res) => {
  const { titulli, permbajtja, category_id, statusi, data_publikimit, imazhi } = req.body;

  if (!titulli || !permbajtja)
    return res.status(400).json({ message: 'Title and content are required' });

  const requestedStatus = statusi || 'draft';
  // Contributors (no publish_own or publish) cannot set status to published
  if (requestedStatus === 'published' &&
      !hasPermission(req.user.role_id, 'posts.publish') &&
      !hasPermission(req.user.role_id, 'posts.publish_own')) {
    return res.status(403).json({ message: 'Nuk ke privilegje për të publikuar' });
  }

  const sql = `
    INSERT INTO posts (titulli, permbajtja, user_id, category_id, statusi, data_publikimit, imazhi)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [titulli, permbajtja, req.user.id, category_id || null, requestedStatus, data_publikimit || null, imazhi || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.status(201).json({ message: 'Post created', id: result.insertId });
  });
});

// ─── UPDATE POST ──────────────────────────────────────────
router.put('/:id', verifyToken, checkPostOwnership('posts.edit_all', 'posts.edit_own'), (req, res) => {
  const { titulli, permbajtja, category_id, statusi, data_publikimit, imazhi } = req.body;

  // Publishing requires publish or publish_own permission
  if (statusi === 'published' &&
      !hasPermission(req.user.role_id, 'posts.publish') &&
      !hasPermission(req.user.role_id, 'posts.publish_own')) {
    return res.status(403).json({ message: 'Nuk ke privilegje për të publikuar' });
  }

  const sql = `
    UPDATE posts
    SET titulli=?, permbajtja=?, category_id=?, statusi=?, data_publikimit=?, imazhi=?
    WHERE id=?
  `;
  db.query(sql, [titulli, permbajtja, category_id || null, statusi, data_publikimit || null, imazhi || null, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post updated' });
  });
});

// ─── DELETE POST ──────────────────────────────────────────
router.delete('/:id', verifyToken, checkPostOwnership('posts.delete_all', 'posts.delete_own'), (req, res) => {
  db.query('DELETE FROM posts WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  });
});

// ─── LIKE POST (public) ───────────────────────────────────
router.post('/:id/like', (req, res) => {
  db.query(
    'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err });
      if (!result.affectedRows) return res.status(404).json({ message: 'Post not found' });
      db.query('SELECT likes FROM posts WHERE id = ?', [req.params.id], (err2, rows) => {
        res.json({ likes: rows?.[0]?.likes || 0 });
      });
    }
  );
});

module.exports = router;
