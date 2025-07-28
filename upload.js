import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Simple file upload endpoint - FIXED: No TypeScript types
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Project upload endpoint - FIXED: No TypeScript types  
router.post('/upload-project', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No project file uploaded' 
      });
    }

    // Basic project file validation
    const allowedExtensions = ['.zip', '.tar', '.gz'];
    const fileExtension = req.file.originalname.toLowerCase().slice(-4);
    
    if (!allowedExtensions.some(ext => req.file.originalname.toLowerCase().endsWith(ext))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only .zip, .tar, .gz files are allowed' 
      });
    }

    res.json({
      success: true,
      message: 'Project uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (error) {
    console.error('Project upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Project upload failed' 
    });
  }
});

export default router;
