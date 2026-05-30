const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

// Add pinned columns if they don't exist yet
const alterMigrations = [
  'ALTER TABLE posts ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0',
  'ALTER TABLE comments ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0',
];
alterMigrations.forEach(sql => {
  db.query(sql, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Migration:', err.message);
  });
});

// Create post_likes table if it doesn't exist
db.query(`CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`, (err) => {
  if (err) console.error('post_likes table error:', err.message);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (do t'i shtojme gradualisht)
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/posts',      require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags',       require('./routes/tags'));
app.use('/api/comments',   require('./routes/comments'));
app.use('/api/pages',      require('./routes/pages'));
app.use('/api/media',      require('./routes/media'));
app.use('/api/settings',   require('./routes/settings'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/contact',    require('./routes/contact'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));