const db = require('./db');
console.log('Users:', db.prepare('SELECT * FROM users').all());
console.log('Notes:', db.prepare('SELECT * FROM notes').all());
