import Chat from './model.js';
import User from '../user/model.js';
import Proyecto from '../proyecto/model.js';

// Listar chats del usuario
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id }).populate('users');
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los chats', error });
  }
};
