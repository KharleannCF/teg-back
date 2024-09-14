import UserModel from './model.js';
import { generateToken } from '../../utils/auth.js';
import { userDashboard, titulosCarga, cambioDeClave } from './services.js';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
const mailgun = new Mailgun(formData);

export const UserController = {
  create(req, res) {
    req.body.foto = req?.file ? req?.file?.path : null;
    const user = new UserModel(req.body);
    user
      .save()
      .then((user) => {
        const token = generateToken(user);
        res.status(201).json(token);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },
  list(req, res) {
    UserModel.find({})
      .lean()
      .exec()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  retrieve(req, res) {
    UserModel.findById(req.params.id)
      .lean()
      .exec()
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  update(req, res) {
    UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .lean()
      .exec()
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  destroy(req, res) {
    UserModel.findByIdAndRemove(req.params.id)
      .lean()
      .exec()
      .then((user) => {
        res.status(204).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    const same = await user.checkPassword(password);
    if (!same) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.send({ token });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

export const dashboard = async (req, res) => {
  try {
    const data = await userDashboard(req.user);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const cargar_titulos = async (req, res) => {
  try {
    const date = await titulosCarga(req);
    res.status(201).json(date);
  } catch (error) {
    console.error('Error en cargarTitulos:', error);
    return res.status(error.statusCode || 400).json({ message: error });
  }
};

export const olvido_clave = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).exec();
    const token = generateToken(user);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
    const data = {
      from: 'No Responder <mailgun@sandboxb982d00d7b334ebda4bab10136ebd10d.mailgun.org>', // Dirección de correo desde donde se enviará
      to: req.body.email, // Correo electrónico del destinatario
      subject: 'Solicitud de Cambio de Contraseña', // Asunto del correo
      html: `
        <h1>Solicitud de Cambio de Contraseña</h1>
        <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.</p>
        <p>Si no solicitaste un cambio de contraseña, por favor ignora este correo.</p>
        <p>Haz clic en el enlace de abajo para cambiar tu contraseña:</p>
        <a href="http://${process.env.URL_LINK}/recuperarClave?token=${token}">Cambiar mi contraseña</a>
        <p>Si el enlace no funciona, copia y pega la siguiente URL en tu navegador:</p>
        <p>http://${process.env.URL_LINK}/recuperarClave?token=${token}</p>
      `,
    };
    // Enviar el correo electrónico usando Mailgun
    mg.messages
      .create('sandboxb982d00d7b334ebda4bab10136ebd10d.mailgun.org', data)
      .then((body) => {
        console.log('Correo enviado: ', body);
        return res.status(200).json({ message: 'Correo Enviado' });
      })
      .catch((err) => {
        console.error('Error al enviar el correo: ', err);
        return res.status(500).json({ message: 'Error al enviar el correo.' });
      });
  } catch (error) {
    console.error('Error en enviarCorreoCambioContraseña: ', error);
    return res.status(error.statusCode || 400).json({ message: error });
  }
};

export const cambiar_clave = async (req, res) => {
  try {
    const { token, nuevaClave } = req.body;

    const response = await cambioDeClave(token, nuevaClave);

    // Enviar respuesta de éxito
    res.status(200).json({ message: 'Contraseña cambiada exitosamente.' });
  } catch (err) {
    console.error('Error al cambiar la contraseña:', err);

    // Verificar si el error es un Token inválido o expirado
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token inválido.' });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'El token ha expirado.' });
    }

    // Manejo de errores específicos de base de datos
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
      return res.status(500).json({
        error: 'Error en la base de datos. Por favor, inténtelo de nuevo.',
      });
    }

    // Manejo de cualquier otro error no especificado
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
