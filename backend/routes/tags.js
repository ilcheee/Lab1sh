const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ─── GET ALL ─────────────────────────────────────────────
router.get('/', (req, res) => {
  db.query('SELECT * FROM tags ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── GET SINGLE ──────────────────────────────────────────
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM tags WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Tagu nuk u gjet' });
    res.json(results[0]);
  });
});

// ─── CREATE ──────────────────────────────────────────────
router.post('/', verifyToken, (req, res) => {
  const { emertimi, slug } = req.body;

  if (!emertimi || !slug) {
    return res.status(400).json({ message: 'Emërtimi dhe slug janë të detyrueshme' });
  }

  db.query(
    'INSERT INTO tags (emertimi, slug) VALUES (?, ?)',
    [emertimi, slug],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ky slug ekziston tashmë' });
        return res.status(500).json({ message: 'Gabim në server', error: err });
      }
      res.status(201).json({ message: 'Tagu u krijua me sukses', id: result.insertId });
    }
  );
});

// ─── UPDATE ──────────────────────────────────────────────
router.put('/:id', verifyToken, (req, res) => {
  const { emertimi, slug } = req.body;

  db.query(
    'UPDATE tags SET emertimi=?, slug=? WHERE id=?',
    [emertimi, slug, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Tagu nuk u gjet' });
      res.json({ message: 'Tagu u përditësua me sukses' });
    }
  );
});

// ─── DELETE ──────────────────────────────────────────────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM tags WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Tagu nuk u gjet' });
    res.json({ message: 'Tagu u fshi me sukses' });
  });
});

module.exports = router;