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
