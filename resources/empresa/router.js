import { Router } from 'express';
import { empresaController } from './controller.js';
import { upload } from '../../utils/uploader.js';

const router = Router();

router.post('/', upload.single('logo'), (req, res) => {
  empresaController.create(req, res);
});

router.put('/:id', upload.single('logo'), (req, res) => {
  empresaController.update(req, res);
});

export default router;
