const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { checkRole, hasPermission } = require('../middleware/checkRole');

// ── Middleware: manage_all OR own comment ─────────────────
const checkCommentOwnership = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Jo i autorizuar' });
  if (hasPermission(req.user.role_id, 'comments.manage_all')) return next();
  if (hasPermission(req.user.role_id, 'comments.edit_own')) {
    db.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Gabim në server' });
      if (!rows.length) return res.status(404).json({ message: 'Komenti nuk u gjet' });
      if (rows[0].user_id !== req.user.id)
        return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
      next();
    });
    return;
  }
  return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
};

// ─── GET COMMENTS (public) ────────────────────────────────
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  const { post_id } = req.query;
  let sql = `
    SELECT c.id, c.post_id, c.user_id, c.permbajtja,
           c.data, c.statusi, c.pinned,
           u.emri AS autori, u.role_id
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
  `;
  const values = [];
  if (post_id) { sql += ' WHERE c.post_id = ?'; values.push(post_id); }
  sql += ' ORDER BY c.pinned DESC, c.data ASC';

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error', error: err });
    res.json(results);
  });
});

// ─── CREATE ───────────────────────────────────────────────
router.post('/', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 6) {
    return res.status(403).json({ message: 'No permission to comment' });
  }
  const { post_id, permbajtja } = req.body;
  console.log('Comment received:', { post_id, permbajtja, user: req.user.id });
  if (!post_id || !permbajtja || permbajtja.trim() === '') {
    return res.status(400).json({ message: 'Komenti nuk mund të jetë bosh' });
  }
  db.query(
    'INSERT INTO comments (post_id, user_id, permbajtja) VALUES (?, ?, ?)',
    [post_id, req.user.id, permbajtja.trim()],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error', error: err });
      res.status(201).json({ message: 'Komenti u shtua', id: result.insertId });
    }
  );
});

// ─── UPDATE ───────────────────────────────────────────────
router.put('/:id', verifyToken, checkCommentOwnership, (req, res) => {
  const { permbajtja, statusi } = req.body;
  const setClauses = [];
  const values = [];
  if (permbajtja !== undefined) { setClauses.push('permbajtja = ?'); values.push(permbajtja); }
  if (statusi !== undefined)    { setClauses.push('statusi = ?');    values.push(statusi); }
  if (!setClauses.length) return res.status(400).json({ message: 'No fields to update' });
  values.push(req.params.id);
  db.query(
    `UPDATE comments SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      if (!result.affectedRows) return res.status(404).json({ message: 'Komenti nuk u gjet' });
      res.json({ message: 'Komenti u përditësua me sukses' });
    }
  );
});

// ─── DELETE ───────────────────────────────────────────────
router.delete('/:id', verifyToken, checkCommentOwnership, (req, res) => {
  db.query('DELETE FROM comments WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Komenti nuk u gjet' });
    res.json({ message: 'Komenti u fshi me sukses' });
  });
});

// ─── TOGGLE PIN COMMENT (redaktor/admin only) ────────────
router.put('/:id/pin', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 3) return res.status(403).json({ message: 'Nuk ke privilegje' });
  db.query('SELECT pinned FROM comments WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!rows.length) return res.status(404).json({ message: 'Comment not found' });
    const newPinned = rows[0].pinned ? 0 : 1;
    db.query('UPDATE comments SET pinned = ? WHERE id = ?', [newPinned, req.params.id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Server error' });
      res.json({ pinned: newPinned === 1 });
    });
  });
});

module.exports = router;
