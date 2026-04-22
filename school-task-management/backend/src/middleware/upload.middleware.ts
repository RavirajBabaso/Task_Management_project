import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const uploadDirectory = path.resolve(__dirname, '../../uploads');
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'attachment'));
    return;
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
