// server/routes/notes.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// get all notes for current user
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  console.log('page', page, 'limit', limit, 'offset', offset);

  const rows = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?')
    .all(req.user.id, limit, offset);

  const countResult = db
    .prepare('SELECT COUNT(*) AS total FROM notes WHERE user_id = ?')
    .get(req.user.id);

  const totalCount = countResult.total;
  const totalPages = Math.ceil(totalCount / limit);

  console.log('totalCount', totalCount);
  console.log('totalPages', totalPages);

  res.json({ notes: rows, count: totalCount, totalPages });
});

// get single note
router.get('/:id', authenticateToken, (req, res) => {
  const row = db.prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ note: row });
});

// create note
router.post('/', authenticateToken, (req, res) => {
  try {
    console.log('Creating note with token', req.body);
    const { title, content } = req.body;
    console.log('Creating note with token', title, content);
    const stmt = db.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)');
    const info = stmt.run(req.user.id, title, content);
    const note = db.prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

// update note
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;
    const stmt = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const info = stmt.run(title, content, req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'not found or no permission' });
    const note = db.prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?').get(req.params.id);
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

// delete note
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
    const info = stmt.run(req.params.id, req.user.id);
    console.log('Deleted note with token', req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'not found or no permission' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
