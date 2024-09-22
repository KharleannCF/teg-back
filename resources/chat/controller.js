import Chat from './model.js';
import User from '../user/model.js';
import Proyecto from '../proyecto/model.js';

// Listar chats del usuario
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user })
      .populate('users')
      .lean()
      .exec();
    chats.forEach((elem) => {
      elem.users = elem.users.filter((subElem) => {
        return subElem._id.toString() !== req.user.toString();
      });
    });

    res.status(200).json({ chats, userID: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener los chats', error });
  }
};
