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

// ── role_id guard helper ──────────────────────────────────
const requireRoleMax = (maxRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Jo i autorizuar' });
  if (req.user.role_id > maxRole) return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
  next();
};

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

// ─── GET PENDING POSTS (redaktor+) ───────────────────────
router.get('/pending', verifyToken, requireRoleMax(3), (req, res) => {
  const sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.statusi = 'pending'
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

// ─── GET ALL POSTS ────────────────────────────────────────
router.get('/', (req, res) => {
  const { statusi, category_id, user_id, limit, admin } = req.query;

  let sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const values = [];

  if (admin === 'true') {
    // Admin view: no default status filter; optional explicit statusi still applies
    if (statusi) { sql += ' AND p.statusi = ?'; values.push(statusi); }
  } else if (statusi) {
    if (statusi === 'published') {
      sql += " AND p.statusi IN ('published', 'publikuar')";
    } else {
      sql += ' AND p.statusi = ?';
      values.push(statusi);
    }
  } else {
    // Public default: published only
    sql += " AND p.statusi = 'publikuar'";
  }

  if (category_id) { sql += ' AND p.category_id = ?'; values.push(parseInt(category_id)); }
  if (user_id) { sql += ' AND p.user_id = ?'; values.push(parseInt(user_id)); }

  sql += ' ORDER BY p.pinned DESC, p.created_at DESC';
  if (limit) { sql += ' LIMIT ?'; values.push(parseInt(limit)); }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

// ─── SEARCH POSTS ────────────────────────────────────────
router.get('/search', (req, res) => {
  const { q, category_id } = req.query;
  let sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.statusi = 'publikuar'
  `;
  const values = [];
  if (q) {
    sql += ` AND (p.titulli LIKE ? OR p.permbajtja LIKE ?)`;
    values.push(`%${q}%`, `%${q}%`);
  }
  if (category_id) {
    sql += ` AND p.category_id = ?`;
    values.push(category_id);
  }
  sql += ` ORDER BY p.created_at DESC`;
  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json(results);
  });
});

// ─── TRENDING POSTS ──────────────────────────────────────
router.get('/trending', (req, res) => {
  const sql = `
    SELECT p.*, u.emri AS autori, c.emertimi AS kategoria,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.statusi = 'publikuar'
    ORDER BY like_count DESC, p.created_at DESC
    LIMIT 10
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error' });
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
router.post('/', verifyToken, requireRoleMax(6), checkRole('posts.create'), (req, res) => {
  console.log('POST /posts body:', req.body);
  const { titulli, permbajtja, category_id, category_name, statusi, data_publikimit, imazhi } = req.body;

  if (!titulli || !permbajtja)
    return res.status(400).json({ message: 'Title and content are required' });

  // role <= 4 (admin/redaktor/editor) can publish directly; author/contributor → pending
  const canPublish = req.user.role_id <= 4;
  let finalStatus = statusi || 'draft';
  if (!canPublish && (finalStatus === 'publikuar' || finalStatus === 'published')) {
    finalStatus = 'pending';
  }

  const insertPost = (cat_id) => {
    db.query(
      'INSERT INTO posts (titulli, permbajtja, user_id, category_id, statusi, data_publikimit, imazhi) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulli, permbajtja, req.user.id, cat_id || null, finalStatus, data_publikimit || null, imazhi || null],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        res.status(201).json({ message: 'Post created', id: result.insertId, statusi: finalStatus });
      }
    );
  };

  // category_id provided as number → use directly
  if (category_id && !isNaN(category_id)) {
    return insertPost(parseInt(category_id));
  }

  // category_name provided as text → find or create
  if (category_name && category_name.trim()) {
    const name = category_name.trim();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    db.query(
      'SELECT id FROM categories WHERE emertimi = ? OR slug = ?',
      [name, slug],
      (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        if (rows.length > 0) return insertPost(rows[0].id);
        db.query(
          'INSERT INTO categories (emertimi, slug) VALUES (?, ?)',
          [name, slug],
          (err2, result2) => {
            if (err2) return insertPost(null);
            insertPost(result2.insertId);
          }
        );
      }
    );
    return;
  }

  insertPost(null);
});

// ─── APPROVE / REJECT POST (role <= 3) ───────────────────
router.put('/:id/approve', verifyToken, requireRoleMax(3), (req, res) => {
  const { approved, reason } = req.body;
  const newStatus = approved ? 'publikuar' : 'rejected';
  const sql = 'UPDATE posts SET statusi = ?, rejection_reason = ? WHERE id = ?';
  db.query(sql, [newStatus, approved ? null : (reason || null), req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: approved ? 'Post approved' : 'Post rejected', statusi: newStatus });
  });
});

// ─── TOGGLE PIN POST (redaktor/admin only) ───────────────
router.put('/:id/pin', verifyToken, requireRoleMax(3), (req, res) => {
  db.query('SELECT pinned FROM posts WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!rows.length) return res.status(404).json({ message: 'Post not found' });
    const newPinned = rows[0].pinned ? 0 : 1;
    db.query('UPDATE posts SET pinned = ? WHERE id = ?', [newPinned, req.params.id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      res.json({ pinned: newPinned === 1 });
    });
  });
});

// ─── UPDATE POST ──────────────────────────────────────────
router.put('/:id', verifyToken, checkPostOwnership('posts.edit_all', 'posts.edit_own'), (req, res) => {
  const { titulli, permbajtja, category_id, statusi, data_publikimit, imazhi } = req.body;
  console.log('Updating post', req.params.id, 'with statusi:', statusi);

  db.query(
    `UPDATE posts SET titulli=?, permbajtja=?, category_id=?, statusi=?, data_publikimit=?, imazhi=? WHERE id=?`,
    [titulli, permbajtja, category_id || null, statusi, data_publikimit || null, imazhi || null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
      res.json({ message: 'Post updated successfully' });
    }
  );
});

// ─── DELETE POST ──────────────────────────────────────────
router.delete('/:id', verifyToken, checkPostOwnership('posts.delete_all', 'posts.delete_own'), (req, res) => {
  // Super Admin posts cannot be deleted by non-super-admins
  if (req.user.role_id !== 1) {
    db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows.length) return res.status(404).json({ message: 'Post not found' });
      if (rows[0].user_id === 1) {
        // check if that user is super_admin
        db.query('SELECT role_id FROM users WHERE id = ?', [rows[0].user_id], (err2, users) => {
          if (err2) return res.status(500).json({ message: 'Server error' });
          if (users.length && users[0].role_id === 1) {
            return res.status(403).json({ message: 'Cannot delete a Super Admin post' });
          }
          performDelete(req.params.id, res);
        });
        return;
      }
      performDelete(req.params.id, res);
    });
    return;
  }
  performDelete(req.params.id, res);
});

function performDelete(postId, res) {
  db.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  });
}

// ─── TOGGLE LIKE ─────────────────────────────────────────
// Requires: CREATE TABLE IF NOT EXISTS post_likes (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   post_id INT NOT NULL, user_id INT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   UNIQUE KEY unique_like (post_id, user_id),
//   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// );
router.post('/:id/toggle-like', verifyToken, (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.id;

  db.query(
    'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
    [post_id, user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error' });

      if (results.length > 0) {
        // Already liked → unlike
        db.query(
          'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
          [post_id, user_id],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Error' });
            db.query(
              'UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
              [post_id, post_id],
              () => res.json({ liked: false })
            );
          }
        );
      } else {
        // Not liked → like
        db.query(
          'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
          [post_id, user_id],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Error' });
            db.query(
              'UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
              [post_id, post_id],
              () => res.json({ liked: true })
            );
          }
        );
      }
    }
  );
});

// ─── LIKE STATUS ──────────────────────────────────────────
router.get('/:id/like-status', verifyToken, (req, res) => {
  db.query(
    'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error' });
      res.json({ liked: results.length > 0 });
    }
  );
});

module.exports = router;
