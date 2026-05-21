const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ─── GET COMMENTS (për një post) ─────────────────────────
router.get('/', (req, res) => {
  const { post_id } = req.query;
  
  let sql = `
    SELECT c.*, u.emri AS autori 
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
  `;
  const values = [];

  if (post_id) {
    sql += ' WHERE c.post_id = ?';
    values.push(post_id);
  }

  sql += ' ORDER BY c.data DESC';

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── CREATE ──────────────────────────────────────────────
router.post('/', verifyToken, (req, res) => {
  const { post_id, permbajtja } = req.body;

  if (!post_id || !permbajtja) {
    return res.status(400).json({ message: 'post_id dhe përmbajtja janë të detyrueshme' });
  }

  db.query(
    'INSERT INTO comments (post_id, user_id, permbajtja) VALUES (?, ?, ?)',
    [post_id, req.user.id, permbajtja],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      res.status(201).json({ message: 'Komenti u shtua me sukses', id: result.insertId });
    }
  );
});

// ─── UPDATE (statusi) ────────────────────────────────────
router.put('/:id', verifyToken, (req, res) => {
  const { permbajtja, statusi } = req.body;

  db.query(
    'UPDATE comments SET permbajtja=?, statusi=? WHERE id=?',
    [permbajtja, statusi || 'pending', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Komenti nuk u gjet' });
      res.json({ message: 'Komenti u përditësua me sukses' });
    }
  );
});

// ─── DELETE ──────────────────────────────────────────────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM comments WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Komenti nuk u gjet' });
    res.json({ message: 'Komenti u fshi me sukses' });
  });
});

module.exports = router;