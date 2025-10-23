// server/db.js
const Database = require('better-sqlite3');
const db = new Database('./data/notes.db');

module.exports = db;
