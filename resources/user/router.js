import { Router } from 'express';
import {
  UserController,
  login,
  dashboard,
  cargar_titulos,
  olvido_clave,
  cambiar_clave,
  getMe,
  updateMe,
  borrar_titulos,
  verifyEmail,
} from './controller.js';
import { validateSessionMiddleware } from './middleware.js';
import { upload, uploadFileMiddleware } from '../../utils/uploader.js';

const router = Router();

router.get('/', (req, res) => {
  UserController.list(req, res);
});

router.get('/dashboard', validateSessionMiddleware, (req, res) => {
  dashboard(req, res);
});

router
  .route('/me')
  .get(validateSessionMiddleware, (req, res) => {
    getMe(req, res);
  })
  .put(validateSessionMiddleware, upload.single('foto'), (req, res) => {
    updateMe(req, res);
  });

router.post('/login', (req, res) => {
  login(req, res);
});

router.get('/verifyEmail', verifyEmail);

router.post('/forgot-password', olvido_clave);

router.post('/cambiar_clave', cambiar_clave);

router.get('/health', validateSessionMiddleware, (req, res) => {
  try {
    res.status(200).send({ valid: !!req.user });
  } catch (err) {
    res.status(500).send({ valid: false });
  }
});

router.post(
  '/titulos',
  validateSessionMiddleware,
  upload.array('titulos', 10),
  cargar_titulos
);

router.delete('/titulos/:id', validateSessionMiddleware, borrar_titulos);

router.get('/:id', (req, res) => {
  UserController.retrieve(req, res);
});

router.put('/:id', validateSessionMiddleware, (req, res) => {
  UserController.update(req, res);
});

router.delete('/:id', (req, res) => {
  UserController.destroy(req, res);
});

router.post('/', uploadFileMiddleware, (req, res) => {
  UserController.create(req, res);
});

export default router;
