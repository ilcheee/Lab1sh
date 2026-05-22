const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// GET /api/users/me — own profile
router.get('/me', verifyToken, (req, res) => {
  db.query('SELECT id, emri, email, role_id, created_at FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// PUT /api/users/me — update own profile
router.put('/me', verifyToken, checkRole('profile.edit'), (req, res) => {
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

// GET /api/users — list all users (users.manage)
router.get('/', verifyToken, checkRole('users.manage'), (req, res) => {
  db.query('SELECT id, emri, email, role_id, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

// GET /api/users/:id — public user info
router.get('/:id', (req, res) => {
  db.query('SELECT id, emri, role_id, created_at FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// PUT /api/users/:id — change role (users.change_role)
router.put('/:id', verifyToken, checkRole('users.change_role'), (req, res) => {
  const { role_id } = req.body;
  if (!role_id) return res.status(400).json({ message: 'role_id is required' });

  const newRole = parseInt(role_id);

  // Admin (role 2) cannot assign super_admin (1) or admin (2)
  if (req.user.role_id === 2 && newRole <= 2) {
    return res.status(403).json({ message: 'Admin cannot assign Super Admin or Admin roles' });
  }

  // Non-super-admin cannot modify admin/super_admin accounts
  if (req.user.role_id !== 1) {
    db.query('SELECT role_id FROM users WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows.length) return res.status(404).json({ message: 'User not found' });
      if (rows[0].role_id <= 2) {
        return res.status(403).json({ message: 'Cannot modify Super Admin or Admin accounts' });
      }
      performUpdate(newRole, req.params.id, res);
    });
    return;
  }

  performUpdate(newRole, req.params.id, res);
});

function performUpdate(newRole, userId, res) {
  db.query('UPDATE users SET role_id = ? WHERE id = ?', [newRole, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated' });
  });
}

// DELETE /api/users/:id — delete user (users.manage)
router.delete('/:id', verifyToken, checkRole('users.manage'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  // Admin cannot delete super_admin accounts
  if (req.user.role_id !== 1) {
    db.query('SELECT role_id FROM users WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows.length) return res.status(404).json({ message: 'User not found' });
      if (rows[0].role_id === 1) {
        return res.status(403).json({ message: 'Cannot delete a Super Admin account' });
      }
      performDelete(req.params.id, res);
    });
    return;
  }

  performDelete(req.params.id, res);
});

function performDelete(userId, res) {
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  });
}

module.exports = router;
