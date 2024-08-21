import { Router } from 'express';
import { UserController, login, dashboard } from './controller.js';
import { validateSessionMiddleware } from './middleware.js';
import {
  replaceOrUploadFile,
  upload,
  uploadFileMiddleware,
} from '../../utils/uploader.js';

const router = Router();

router.get('/', (req, res) => {
  UserController.list(req, res);
});

router.get('/dashboard', validateSessionMiddleware, (req, res) => {
  dashboard(req, res);
});

router.post('/login', (req, res) => {
  login(req, res);
});

router.post('/', upload.single('file'), (req, res) => {
  UserController.create(req, res);
});

router.get('/:id', (req, res) => {
  UserController.retrieve(req, res);
});

router.put('/:id', replaceOrUploadFile, (req, res) => {
  UserController.update(req, res);
});

router.delete('/:id', (req, res) => {
  UserController.destroy(req, res);
});

export default router;
