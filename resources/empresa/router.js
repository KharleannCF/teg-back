import { Router } from 'express';
import { empresaController } from './controller.js';
import { upload } from '../../utils/uploader.js';

const router = Router();

router.post('/', upload.single('file'), (req, res) => {
  empresaController.create(req, res);
});

export default router;
