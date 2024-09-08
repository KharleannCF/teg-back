import { Router } from 'express';
import { upload } from '../../utils/uploader.js';
import {
  createProyecto,
  getProyectos,
  getProyectoById,
  updateProyecto,
  deleteProyecto,
  postularCandidato,
  cambiarEstadoCandidato,
} from './controller.js';

const router = Router();

// Ruta para crear un nuevo proyecto
router.post('/', upload.single('foto'), createProyecto);

// Ruta para obtener todos los proyectos
router.get('/', getProyectos);

// Ruta para postular un candidato a un proyecto
router.get('/candidato/:id', postularCandidato);

// Ruta para cambiar el estado de un candidato
router.post('/candidato/:id', cambiarEstadoCandidato);

// Ruta para obtener un proyecto por ID
router.get('/:id', getProyectoById);

// Ruta para actualizar un proyecto por ID
router.put('/:id', upload.single('foto'), updateProyecto);

// Ruta para eliminar un proyecto por ID
router.delete('/:id', deleteProyecto);

export default router;
