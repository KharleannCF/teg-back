import User from './model.js';

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

export const titulosUpload = async ({ files, fechas, areas, nivel }) => {
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

/* titulo: [
    {
      f_graduacion: { type: Date, required: true },
      nivel: { type: String, maxlength: 100 },
      area: { type: String, maxlength: 50 },
      foto: { type: String },
    },
  ], */
