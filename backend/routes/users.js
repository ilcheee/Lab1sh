const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role_id !== 1) return res.status(403).json({ message: 'Admin access required' });
  next();
};

// GET /api/users/me — own profile (auth required)
router.get('/me', verifyToken, (req, res) => {
  db.query('SELECT id, emri, email, role_id, created_at FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// PUT /api/users/me — update own profile
router.put('/me', verifyToken, (req, res) => {
  const { emri, email } = req.body;
  if (!emri || !email) return res.status(400).json({ message: 'Name and email are required' });
  db.query('UPDATE users SET emri = ?, email = ? WHERE id = ?', [emri, email, req.user.id], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already in use' });
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Profile updated' });
  });
});

// GET /api/users — list all users (admin only)
router.get('/', verifyToken, adminOnly, (req, res) => {
  db.query('SELECT id, emri, email, role_id, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

// GET /api/users/:id — public user info
router.get('/:id', (req, res) => {
  db.query('SELECT id, emri, role_id, created_at FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// PUT /api/users/:id — update user role (admin only)
router.put('/:id', verifyToken, adminOnly, (req, res) => {
  const { role_id } = req.body;
  if (!role_id) return res.status(400).json({ message: 'role_id is required' });
  db.query('UPDATE users SET role_id = ? WHERE id = ?', [parseInt(role_id), req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated' });
  });
});

// DELETE /api/users/:id — delete user (admin only)
router.delete('/:id', verifyToken, adminOnly, (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;
