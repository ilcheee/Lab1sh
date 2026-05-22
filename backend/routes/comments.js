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

// ─── GET COMMENTS ─────────────────────────────────────────
router.get('/', (req, res) => {
  const { post_id } = req.query;
  let sql = `
    SELECT c.*, u.emri AS autori
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
  `;
  const values = [];
  if (post_id) { sql += ' WHERE c.post_id = ?'; values.push(post_id); }
  sql += ' ORDER BY c.data DESC';

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── CREATE ───────────────────────────────────────────────
router.post('/', verifyToken, checkRole('comments.create'), (req, res) => {
  const { post_id, permbajtja } = req.body;
  if (!post_id || !permbajtja)
    return res.status(400).json({ message: 'post_id dhe përmbajtja janë të detyrueshme' });

  db.query(
    'INSERT INTO comments (post_id, user_id, permbajtja) VALUES (?, ?, ?)',
    [post_id, req.user.id, permbajtja],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      res.status(201).json({ message: 'Komenti u shtua me sukses', id: result.insertId });
    }
  );
});

// ─── UPDATE ───────────────────────────────────────────────
router.put('/:id', verifyToken, checkCommentOwnership, (req, res) => {
  const { permbajtja, statusi } = req.body;
  db.query(
    'UPDATE comments SET permbajtja=?, statusi=? WHERE id=?',
    [permbajtja, statusi || 'pending', req.params.id],
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

module.exports = router;
