import Proyecto from './model.js';
import User from '../user/model.js';
import Chat from '../chat/model.js';
import mongoose from 'mongoose';
import e from 'express';

// Crear un nuevo proyecto
export const createProyecto = async (req, res) => {
  try {
    req.body.user = req.user;
    req.body.requisitos = req.body.requisitos.split(',');
    req.body.imagen = req.file.path;
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
    let proyectos = await Proyecto.find().populate(
      'user participantes candidatos'
    );
    proyectos = proyectos.map(elem=>({
      ...elem, isOwner: elem.user._id.toString() === req.user
    }))

    
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
    const proyecto = await Proyecto.findById(id)
      .populate('user participantes candidatos')
      .lean()
      .exec();
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    const isOwner = proyecto?.user?._id.toString() === req?.user.toString();
    const isCandidate = !!proyecto?.candidatos?.find(
      (elem) => elem._id.toString() === req.user.toString()
    );
    const isParticipant = !!proyecto?.participantes?.find(
      (elem) => elem._id.toString() === req.user.toString()
    );
    res.status(200).json({ ...proyecto, isOwner, isCandidate, isParticipant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el proyecto', error });
  }
};

// Actualizar un proyecto
export const updateProyecto = async (req, res) => {
  const { id } = req.params;
  req.body.requisitos = req.body.requisitos.split(',');
  if (req.file) {
    req.body.imagen = req.file.path;
  }
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
    console.log(error);
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
    const deletedProyecto = await Proyecto.findOneAndDelete({
      _id: id,
      user: req.user,
    });
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
    const userId = req.user; // ID del usuario autenticado desde req.user

    // Buscar el proyecto por ID
    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    console.log(proyecto.candidatos, userId);
    // Verificar si el usuario ya está postulado como candidato
    if (
      proyecto.candidatos.filter((elem) => elem.userID.toString() === userId)
        .length > 0
    ) {
      return res
        .status(400)
        .json({ message: 'El usuario ya está postulado como candidato' });
    }

    // Añadir el usuario a la lista de candidatos
    proyecto.candidatos.push({ userID: userId, status: 'pendiente' });

    const chat = new Chat({
      users: [userId, proyecto.user],
      proyecto_id: proyecto._id,
      estado: 'pendiente',
    });

    await chat.save();

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
    if (proyecto.user.toString() !== req.user.toString()) {
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

    await Chat.findOneAndDelete({
      users: [candidatoId, req.user],
      proyecto_id: proyecto._id,
    });

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

export const searchProyectos = async (req, res) => {
  const { search } = req.body; // Assuming search term comes from the request body

  try {
    // Construct a case-insensitive search for `titulo`, `requisitos`, and `contratacion`
    const searchQuery = {
      $or: [
        { titulo: { $regex: search, $options: 'i' } }, // Search in 'titulo'
        { requisitos: { $regex: search, $options: 'i' } }, // Search in 'requisitos'
        { contratacion: { $regex: search, $options: 'i' } }, // Search in 'contratacion'
        { descripcion: { $regex: search, $options: 'i' } }, // Search in 'descripcion'
      ],
    };

    // Perform the search and sort results with 'terminado' projects at the end
    const proyectos = await Proyecto.find(searchQuery)
      .sort({
        estado: 1, // Sort by estado, where 'terminado' (as it's the highest value) goes at the end
      })
      .exec();

    // Return the filtered and sorted projects
    res.status(200).json(proyectos);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ message: 'Server error while searching projects' });
  }
};
