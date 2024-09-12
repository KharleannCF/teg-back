import { Router } from 'express';
import {
  UserController,
  login,
  dashboard,
  cargar_titulos,
  olvido_clave,
  cambiar_clave,
} from './controller.js';
import { validateSessionMiddleware } from './middleware.js';
import { replaceOrUploadFile, upload } from '../../utils/uploader.js';

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

router.post('/forgot-password', olvido_clave);

router.post('/cambiar_clave', cambiar_clave);

router.post(
  '/titulos',
  validateSessionMiddleware,
  upload.array('titulos', 10),
  cargar_titulos
);

router.get('/:id', (req, res) => {
  UserController.retrieve(req, res);
});

router.put('/:id', replaceOrUploadFile, (req, res) => {
  UserController.update(req, res);
});

router.delete('/:id', (req, res) => {
  UserController.destroy(req, res);
});

router.post('/', upload.single('profileImage'), (req, res) => {
  UserController.create(req, res);
});

export default router;
