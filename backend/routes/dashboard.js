const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ─── PUBLIC STATS (no auth) ──────────────────────────────
router.get('/public-stats', (req, res) => {
  const stats = {};
  const queries = [
    { key: 'posts',      sql: 'SELECT COUNT(*) AS total FROM posts' },
    { key: 'categories', sql: 'SELECT COUNT(*) AS total FROM categories' },
    { key: 'users',      sql: 'SELECT COUNT(*) AS total FROM users' },
    { key: 'comments',   sql: 'SELECT COUNT(*) AS total FROM comments' },
  ];
  let completed = 0;
  let sent = false;
  queries.forEach(({ key, sql }) => {
    db.query(sql, (err, results) => {
      if (sent) return;
      if (err) { sent = true; return res.status(500).json({ message: 'Server error', error: err }); }
      stats[key] = results[0].total;
      if (++completed === queries.length) { sent = true; res.json(stats); }
    });
  });
});

// ─── DASHBOARD STATS ─────────────────────────────────────
router.get('/stats', verifyToken, (req, res) => {
  const stats = {};
  const queries = [
    { key: 'posts',       sql: 'SELECT COUNT(*) AS total FROM posts' },
    { key: 'categories',  sql: 'SELECT COUNT(*) AS total FROM categories' },
    { key: 'tags',        sql: 'SELECT COUNT(*) AS total FROM tags' },
    { key: 'comments',    sql: 'SELECT COUNT(*) AS total FROM comments' },
    { key: 'users',       sql: 'SELECT COUNT(*) AS total FROM users' },
    { key: 'media',       sql: 'SELECT COUNT(*) AS total FROM media' },
    { key: 'newsletter',  sql: 'SELECT COUNT(*) AS total FROM newsletter_subscribers' },
    { key: 'pages',       sql: 'SELECT COUNT(*) AS total FROM pages' },
  ];
  let completed = 0;
  let sent = false;
  queries.forEach(({ key, sql }) => {
    db.query(sql, (err, results) => {
      if (sent) return;
      if (err) { sent = true; return res.status(500).json({ message: 'Server error', error: err }); }
      stats[key] = results[0].total;
      if (++completed === queries.length) { sent = true; res.json(stats); }
    });
  });
});

module.exports = router;