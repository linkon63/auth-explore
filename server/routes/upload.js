// routes/uploads.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const authenticateToken = require('../middleware/auth');


// Serve uploaded files via URL
const uploadDir = path.join(__dirname, '../uploads');

// Upload files
router.post('/', authenticateToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileInfos = req.files.map((file) => ({
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    }));
    res.status(201).json({ files: fileInfos });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete file
router.delete('/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted successfully' });
});

module.exports = router;
