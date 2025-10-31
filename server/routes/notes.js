// server/routes/notes.js
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

const express = require('express');

const authenticateToken = require('../middleware/auth');

const router = express.Router();

const prisma = new PrismaClient().$extends(withAccelerate())

// get all notes for current user
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  console.log('page', page, 'limit', limit, 'offset', offset);

  const notes = await prisma.note.findMany({
    where: {
      userId: Number(req.user.id),
    },
    take: limit,
    skip: offset,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const count = await prisma.note.count({
    where: {
      userId: Number(req.user.id),
    },
  });

  const totalPages = Math.ceil(count / limit);

  console.log('notes', notes);
  console.log('count', count);
  console.log('totalPages', totalPages);

  res.json({ notes, count, totalPages });
});

// get single note
router.get('/:id', authenticateToken, async(req, res) => {
  const note = await prisma.note.findUnique({
    where: {
      id: Number(req.params.id),
      userId: Number(req.user.id),
    },
  })
  console.log('note', note);
  if (!note) return res.status(404).json({ error: 'not found' });
  res.json({ note });
});

// create note
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Creating note with token', req.body);
    const { title, content, file } = req.body;
    console.log('Creating note with token', title, content, file);
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: Number(req.user.id),
        file
      },
    });
    console.log('note', note);
    res.status(201).json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

// update note
router.put('/:id', authenticateToken, async(req, res) => {
  try {
    const { title, content, file } = req.body;
    const note = await prisma.note.update({
      where: {
        id: Number(req.params.id),
        userId: Number(req.user.id),
      },
      data: {
        title,
        content,
        file,
      },
    });
    console.log('note', note);
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

// delete note
router.delete('/:id', authenticateToken, async(req, res) => {
  try {
    console.log('Deleting note with token', req.params.id, req.user.id);
    const note = await prisma.note.delete({
      where: {
        id: Number(req.params.id),
        userId: Number(req.user.id),
      },
    })
    console.log("note", note)
    console.log('Deleted note with token', req.params.id, req.id);
    if (!note) return res.status(404).json({ error: 'not found or no permission' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
