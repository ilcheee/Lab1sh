const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// ─── GET ALL ─────────────────────────────────────────────
router.get('/', verifyToken, checkRole('settings.manage'), (req, res) => {
  db.query('SELECT * FROM settings', (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
    res.json(results);
  });
});

// ─── UPDATE ──────────────────────────────────────────────
router.put('/:id', verifyToken, checkRole('settings.manage'), (req, res) => {
  const { vlera } = req.body;

  db.query(
    'UPDATE settings SET vlera=? WHERE id=?',
    [vlera, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Gabim në server', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Setting nuk u gjet' });
      res.json({ message: 'Setting u përditësua me sukses' });
    }
  );
});

module.exports = router;