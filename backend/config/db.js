const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('DB lidhja deshtoi:', err);
    return;
  }
  console.log('✅ MySQL u lidh me sukses');
  connection.release();
});

module.exports = db;