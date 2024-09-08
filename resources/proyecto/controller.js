import Proyecto from './model.js';
import User from '../user/model.js';
import mongoose from 'mongoose';

// Crear un nuevo proyecto
export const createProyecto = async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    const savedProyecto = await proyecto.save();
    res.status(201).json(savedProyecto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el proyecto', error });
  }
};

// Obtener todos los proyectos
export const getProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().populate(
      'user participantes candidatos'
    );
    res.status(200).json(proyectos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los proyectos', error });
  }
};

// Obtener un proyecto por ID
export const getProyectoById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de proyecto inválido' });
  }

  try {
    const proyecto = await Proyecto.findById(id).populate(
      'user participantes candidatos'
    );
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json(proyecto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el proyecto', error });
  }
};

// Actualizar un proyecto
export const updateProyecto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de proyecto inválido' });
  }

  try {
    const updatedProyecto = await Proyecto.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate('user participantes candidatos');
    if (!updatedProyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json(updatedProyecto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el proyecto', error });
  }
};

// Eliminar un proyecto
export const deleteProyecto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de proyecto inválido' });
  }

  try {
    const deletedProyecto = await Proyecto.findByIdAndDelete(id);
    if (!deletedProyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json({ message: 'Proyecto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el proyecto', error });
  }
};

export const postularCandidato = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto desde la ruta
    const userId = req.user._id; // ID del usuario autenticado desde req.user

    // Buscar el proyecto por ID
    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar si el usuario ya está postulado como candidato
    if (
      proyecto.candidatos.filter((elem) => elem.userID === userId).length > 0
    ) {
      return res
        .status(400)
        .json({ message: 'El usuario ya está postulado como candidato' });
    }

    // Añadir el usuario a la lista de candidatos
    proyecto.candidatos.push({ userID: userId, status: 'pendiente' });
    await proyecto.save();

    return res
      .status(200)
      .json({ message: 'Usuario postulado como candidato exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambia el estado de un candidato
export const cambiarEstadoCandidato = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { candidatoId, nuevoEstado } = req.body; // ID del candidato y nuevo estado

  try {
    // Buscar el proyecto por ID
    const proyecto = await Proyecto.findById(id);

    // Verificar que el proyecto existe
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar que el usuario que solicita la operación es el propietario del proyecto
    if (proyecto.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para realizar esta acción' });
    }

    // Buscar al candidato en la lista de candidatos del proyecto
    const candidato = proyecto.candidatos.find(
      (cand) => cand.userID.toString() === candidatoId
    );

    // Verificar que el candidato existe
    if (!candidato) {
      return res.status(404).json({ message: 'Candidato no encontrado' });
    }

    // Actualizar el estado del candidato
    candidato.status = nuevoEstado;

    // Si el nuevo estado es "aceptado", mover el candidato al arreglo de participantes
    if (nuevoEstado === 'aceptado') {
      // Verificar si el usuario ya es participante
      const yaParticipante = proyecto.participantes.some(
        (part) => part.toString() === candidatoId
      );

      if (!yaParticipante) {
        proyecto.participantes.push(candidatoId);
      }
    }

    // Guardar los cambios en el proyecto
    await proyecto.save();

    return res
      .status(200)
      .json({ message: 'Estado del candidato actualizado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
