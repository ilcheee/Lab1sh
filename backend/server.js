const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/db');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));