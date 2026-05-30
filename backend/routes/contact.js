const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

db.query(`CREATE TABLE IF NOT EXISTS contact_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emri VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  lloji VARCHAR(100) NOT NULL,
  mesazhi TEXT NOT NULL,
  statusi ENUM('pending','aprovuar','refuzuar') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => { if (err) console.error('contact_requests table error:', err.message); });

router.get('/pending-count', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 3) return res.json({ count: 0 });
  db.query("SELECT COUNT(*) AS count FROM contact_requests WHERE statusi = 'pending'", (err, results) => {
    if (err) return res.json({ count: 0 });
    res.json({ count: results[0].count || 0 });
  });
});

router.get('/', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 3) return res.status(403).json({ message: 'No permission' });
  db.query('SELECT * FROM contact_requests ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { emri, email, lloji, mesazhi } = req.body;
  if (!emri || !email || !lloji || !mesazhi)
    return res.status(400).json({ message: 'All fields are required' });
  db.query(
    'INSERT INTO contact_requests (emri, email, lloji, mesazhi) VALUES (?, ?, ?, ?)',
    [emri, email, lloji, mesazhi],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err });
      res.status(201).json({ message: 'Request submitted successfully', id: result.insertId });
    }
  );
});

router.put('/:id', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 3) return res.status(403).json({ message: 'No permission' });
  const { statusi } = req.body;
  db.query('UPDATE contact_requests SET statusi = ? WHERE id = ?', [statusi, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Status updated' });
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  if (!req.user || req.user.role_id > 2) return res.status(403).json({ message: 'No permission' });
  db.query('DELETE FROM contact_requests WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
