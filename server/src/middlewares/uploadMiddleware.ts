// src/middlewares/uploadMiddleware.ts


import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';


// Ensure the uploads directory exists
const uploadDir = 'uploads/degrees/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    cb(null, uniqueSuffix + '-' + Date.now() + path.extname(file.originalname));
  },
});


const fileFilter = function (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Accept only PDF files
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);


  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};


export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max file size: 5MB
  },
});
