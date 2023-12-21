const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'a',
  database: 'best'
})

const CREATE_TABLE_USER = `
  CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
  );
`

const CREATE_TABLE_PROJECT = `
  CREATE TABLE IF NOT EXISTS projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    project_name VARCHAR(255) NOT NULL,
    history LONGTEXT NOT NULL, -- Store the serialized element array as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picture LONGTEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );
`

pool.query(CREATE_TABLE_USER, function (err, result) {
  if (err) {
    console.log('[CREATE table user]', err)
    return
  }

  pool.query(CREATE_TABLE_PROJECT, function (err, result) {
    if (err) {
      console.log('[create table project', err)
      return
    }
  })
})

module.exports = pool
