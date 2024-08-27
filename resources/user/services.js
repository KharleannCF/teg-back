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

export const titulosCarga = async ({ files, fechas, areas, nivel }) => {
  try {
    const user = await User.findById(req.user).lean().exec();

    const fechas_arr = fechas.split(',');
    const areas_arr = areas.split(',');
    const nivel_arr = nivel.split(',');
    const titulos = [];

    for (const i = 0; i < files.length; i++) {
      //Upload file somewhere
      //TODO: MONTAR ARCHIVO EN ALGUN HOSTING
      const foto = files[i].name;
      titulos.push({
        f_graduacion: fechas_arr[i],
        nivel: nivel_arr[i],
        area: areas_arr[i],
        foto: foto,
      });
    }

    user.titulo = user.titulo ? user.titulo.concat(titulos) : titulos;
    await user.save();

    return 'Titulos cargados exitosamente';
  } catch (err) {
    return err;
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
  user.clave = nuevaClave;
  await user.save();
};

/* titulo: [
    {
      f_graduacion: { type: Date, required: true },
      nivel: { type: String, maxlength: 100 },
      area: { type: String, maxlength: 50 },
      foto: { type: String },
    },
  ], */
