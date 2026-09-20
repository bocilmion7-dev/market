import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = req.query.folder as string || 'general';
    const dest = path.join(__dirname, '../../uploads', folder);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WebP, GIF) yang diperbolehkan'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', authenticate, upload.single('file'), (req: any, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'Tidak ada file yang diupload' } });
      return;
    }
    const folder = (req.query.folder as string) || 'general';
    const url = `/api/uploads/${folder}/${req.file.filename}`;
    res.json({ success: true, data: { url, filename: req.file.filename } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/multiple', authenticate, upload.array('files', 10), (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: { message: 'Tidak ada file yang diupload' } });
      return;
    }
    const folder = (req.query.folder as string) || 'general';
    const urls = files.map((f) => ({
      url: `/api/uploads/${folder}/${f.filename}`,
      filename: f.filename,
    }));
    res.json({ success: true, data: urls });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
