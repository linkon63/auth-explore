// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");



const router = express.Router();
const prisma = new PrismaClient().$extends(withAccelerate())


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_dev_key'; // change in prod
const TOKEN_EXP = '1h'; // access token expiry

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('Register request:', { email, password });
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const password_hash = await bcrypt.hash(password, 10);
    const info = await prisma.user.create({
      data: { email, password:password_hash, name },
    });
    console.log('Register info:', info);

    const user = { id: info.id, email };
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXP });
    console.log('Register response:', { token, user });
    res.json({ token, user });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('Login user:', user);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    console.log('Login match:', match);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXP });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
