const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── REGISTER ───────────────────────────────────────────
router.post('/register', (req, res) => {
  const { emri, email, fjalekalimi, role_id } = req.body;

  if (!emri || !email || !fjalekalimi) {
    return res.status(400).json({ message: 'Të gjitha fushat janë të detyrueshme' });
  }

  const hash = bcrypt.hashSync(fjalekalimi, 10);

  const sql = 'INSERT INTO users (emri, email, fjalekalimi, role_id) VALUES (?, ?, ?, ?)';
  // Public registration always creates a member (7); role escalation requires admin action
  db.query(sql, [emri, email, hash, 7], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ky email ekziston tashmë' });
      }
      return res.status(500).json({ message: 'Gabim në server', error: err });
    }
    res.status(201).json({ message: 'Përdoruesi u regjistrua me sukses', id: result.insertId });
  });
});

// ─── LOGIN ──────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, fjalekalimi } = req.body;

  if (!email || !fjalekalimi) {
    return res.status(400).json({ message: 'Email dhe fjalëkalimi janë të detyrueshme' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Gabim në server' });
    if (results.length === 0) return res.status(401).json({ message: 'Email ose fjalëkalim i gabuar' });

    const user = results[0];
    const valid = bcrypt.compareSync(fjalekalimi, user.fjalekalimi);
    if (!valid) return res.status(401).json({ message: 'Email ose fjalëkalim i gabuar' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login i suksesshëm',
      token,
      user: { id: user.id, emri: user.emri, email: user.email, role_id: user.role_id }
    });
  });
});

module.exports = router;