import User from './model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const userDashboard = async (userID) => {
  try {
    const user = await User.findById(userID).lean().exec();

    return {
      user,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const titulosCarga = async (req) => {
  const { dates, areas, levels } = req.body;
  const { files } = req;
  try {
    const user = await User.findById(req.user).exec();

    const dates_arr = dates;
    const areas_arr = areas;
    const level_arr = levels;
    const titulos = [];

    for (let i = 0; i < files.length; i++) {
      //Upload file somewhere
      const foto = files[i].path;
      titulos.push({
        f_graduacion: dates_arr[i],
        nivel: level_arr[i],
        area: areas_arr[i],
        foto: foto,
      });
    }
    user.titulos = user.titulos ? user.titulos.concat(titulos) : titulos;
    delete user.clave;
    await user.save();

    return 'Titulos cargados exitosamente';
  } catch (err) {
    throw err;
  }
};

export const cambioDeClave = async (token, clave) => {
  if (!token || !clave) {
    throw new Error('Clave o usuario no existen');
  }

  // Verificar el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  // Buscar al usuario por ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  // Actualizar la contraseña del usuario
  user.clave = clave;
  await user.save();
};
