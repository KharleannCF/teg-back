import UserModel from './model.js';
import { generateToken } from '../../utils/auth.js';
import {
  userDashboard,
  titulosCarga,
  cambioDeClave,
  titulosBorrar,
} from './services.js';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import jwt from 'jsonwebtoken';

async function sendVerificationEmail(token, user) {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY; // Use your Brevo API key

  // Create an instance of the Brevo API
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  // Email content for email verification
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = 'Email Verification';
  sendSmtpEmail.htmlContent = `
      <html>
  <body>
    <h1>Verificación de Correo Electrónico</h1>
    <p>Gracias por registrarte. Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
    <a href="${process.env.URL_LINK}/verifyemail?token=${token}">Verificar mi correo</a>
    <p>Si el enlace no funciona, copia y pega la siguiente URL en tu navegador:</p>
    <p>${process.env.URL_LINK}/verifyemail?token=${token}</p>
  </body>
</html>
    `;
  sendSmtpEmail.sender = {
    name: 'No Responder',
    email: 'kharleann@gmail.com',
  };
  sendSmtpEmail.to = [
    { email: user.correo, name: `${user.nombre} ${user.apellido}` },
  ];

  // Send the verification email using Brevo API
  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

export const UserController = {
  async create(req, res) {
    try {
      req.body.foto = req?.file ? req?.file?.path : null;
      req.body.habilidades = req.body.habilidades
        ? req.body.habilidades.split(',')
        : [];

      const userFind = await UserModel.find({ correo: req.body.correo }).exec();
      if (userFind.length > 0) {
        return res.status(400).json({ message: 'Correo ya registrado' });
      }

      const user = new UserModel(req.body);
      await user.save();

      // Generate a verification token
      const token = generateToken(user);

      // Send verification email
      await sendVerificationEmail(token, {
        correo: req.body.correo,
        nombre: user.nombre,
        apellido: user.apellido,
      });

      // Send the token in the response or success message
      res.status(201).json({
        message: 'User created successfully. Verification email sent.',
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
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
      .populate('empresa')
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
    if (req.user !== req.params.id) {
      return res
        .status(401)
        .json({ message: 'No tienes permiso para realizar esta acción.' });
    }
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

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user)
      .populate('empresa')
      .select('-clave')
      .lean()
      .exec();

    console.log(user);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const updateMe = async (req, res) => {
  if (req.file) {
    req.body.foto = req.file.path;
  }
  UserModel.findByIdAndUpdate(req.user, req.body, { new: true })
    .lean()
    .exec()
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ correo: email }).exec();
    if (!user) {
      return res.status(401).send({ error: 'Correo o contraseña inválidos' });
    }
    const same = await user.checkPassword(password);
    if (!same) {
      return res.status(401).send({ error: 'Correo o contraseña inválidos' });
    }
    const token = generateToken(user);

    if (!user.valido) {
      await sendVerificationEmail(token, user);

      return res
        .status(401)
        .send({
          error: 'Correo no verificado, se reenvió un correo de verificación',
        });
    }
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

export const borrar_titulos = async (req, res) => {
  try {
    const date = await titulosBorrar(req);
    res.status(201).json(date);
  } catch (error) {
    console.error('Error en borrar los títulos:', error);
    return res.status(error.statusCode || 400).json({ message: error });
  }
};

export const olvido_clave = async (req, res) => {
  try {
    // Find the user by email
    const user = await UserModel.findOne({ correo: req.body.email }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate a token for the user
    const token = generateToken(user);

    // Brevo API configuration
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = provess.env.BREVO_API_KEY; // Store your Brevo API key in an environment variable

    // Create an instance of the Brevo transactional email API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Email content setup
    sendSmtpEmail.subject = 'Solicitud de Cambio de Contraseña';
    sendSmtpEmail.htmlContent = `
      <html>
      <body>
        <h1>Solicitud de Cambio de Contraseña</h1>
        <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.</p>
        <p>Si no solicitaste un cambio de contraseña, por favor ignora este correo.</p>
        <p>Haz clic en el enlace de abajo para cambiar tu contraseña:</p>
        <a href="${process.env.URL_LINK}/recuperarClave?token=${token}">Cambiar mi contraseña</a>
        <p>Si el enlace no funciona, copia y pega la siguiente URL en tu navegador:</p>
        <p>${process.env.URL_LINK}/recuperarClave?token=${token}</p>
      </body>
      </html>
    `;
    sendSmtpEmail.sender = {
      name: 'No Responder',
      email: 'kharleann@gmail.com',
    };
    sendSmtpEmail.to = [
      { email: req.body.email, name: `${user.nombre} ${user.apellido}` },
    ];

    // Send email using Brevo API
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return res.status(200).json({ message: 'Correo Enviado' });
  } catch (error) {
    console.error('Error en enviarCorreoCambioContraseña: ', error);
    return res.status(error.statusCode || 400).json({ message: error.message });
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

export const verifyEmail = async (req, res) => {
  try {
    // Extract token from request
    const token = req.query.token; // Assumes token is sent via query parameter, adjust if token is sent differently (e.g., in headers)
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user by the decoded token's user ID
    const user = await UserModel.findById(decoded.id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set the 'valido' property to true
    user.valido = true;
    await user.save();
    const logToken = generateToken(user);

    // Send success response
    return res
      .status(200)
      .json({ message: 'User verified successfully', token: logToken });
  } catch (error) {
    console.error('Error in verifyEmail endpoint:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
