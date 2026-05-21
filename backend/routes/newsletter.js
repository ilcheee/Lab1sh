const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ─── GET ALL (admin) ─────────────────────────────────────
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM newsletter_subscribers ORDER BY data_abonimit DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── SUBSCRIBE (publik) ──────────────────────────────────
router.post('/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email është i detyrueshëm' });
  }

  db.query(
    'INSERT INTO newsletter_subscribers (email) VALUES (?)',
    [email],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ky email është abonuar tashmë' });
        return res.status(500).json({ message: 'Gabim në server', error: err });
      }
      res.status(201).json({ message: 'U abonuat me sukses', id: result.insertId });
    }
  );
});

// ─── DELETE ──────────────────────────────────────────────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Abonuesi nuk u gjet' });
    res.json({ message: 'Abonuesi u fshi me sukses' });
  });
});

module.exports = router;