import { Router } from 'express';
import { getChats } from './controller.js';
import { upload } from '../../utils/uploader.js';

const router = Router();

// Ruta para obtener todos los chats
router.get('/', getChats);

export default router;
