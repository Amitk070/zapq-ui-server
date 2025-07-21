// File: upload.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // tmp storage

router.post('/upload-project', upload.single('file'), (req, res) => {
  const zipPath = req.file?.path;
  const projectName = req.body.name || `project-${Date.now()}`;
  const extractPath = path.join('projects', projectName);

  try {
    const zip = new AdmZip(zipPath);
    fs.mkdirSync(extractPath, { recursive: true });
    zip.extractAllTo(extractPath, true);
    fs.unlinkSync(zipPath); // cleanup uploaded zip

    const files = listFilesRecursively(extractPath);
    res.json({ success: true, files, path: extractPath });
  } catch (err) {
    console.error('❌ Zip extraction failed:', err);
    res.status(500).json({ success: false, error: 'Extraction failed' });
  }
});

function listFilesRecursively(dir: string, prefix = ''): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.join(prefix, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(listFilesRecursively(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }

  return results;
}

export default router;
