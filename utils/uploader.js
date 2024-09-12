import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const uploadDir = path.join(__dirname, '..', 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileName = `${randomString}-${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

export const upload = multer({ storage: storage });

/**
 * Middleware to handle file upload, or pass control if no file is being uploaded.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function uploadFileMiddleware(req, res, next) {
  // Usamos el middleware de Multer para procesar un solo archivo en el campo 'profileImage'
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'File upload failed', error: err });
    }
    if (req.file) {
      // Si hay un archivo, asignamos la ruta
      req.filePath = path.join('uploads', req.file.filename);
    }
    next(); // Pasamos al siguiente middleware
  });
}
/**
 * Middleware to replace an existing file with a new one, or upload it if it doesn't exist.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function replaceOrUploadFile(req, res, next) {
  if (!req.file) {
    return next(); // No file uploaded, so pass control to the next middleware
  }

  const oldFilePath = path.join(uploadDir, req.body.oldFileName);

  if (fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath); // Delete the old file if it exists
  }

  // Continue to the next middleware after replacing/uploading the file
  next();
}

/**
 * Middleware to delete a file.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function deleteFile(req, res, next) {
  const filePath = path.join(uploadDir, req.body.fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  } else {
    return res.status(404).json({
      message: 'File not found',
    });
  }

  // Continue to the next middleware after deleting the file
  next();
}
