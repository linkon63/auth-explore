// server/server.js

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const uploadRoute = require('./routes/upload');
const dotenv = require('dotenv');
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");


dotenv.config();

const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/upload', uploadRoute);

// simple root
app.get('/', (req, res) => res.json({ ok: true, msg: 'Notes API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
