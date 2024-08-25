import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema({
  cedula: {
    type: Number,
    required: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
    maxlength: 100,
  },
  segundo_nombre: {
    type: String,
    maxlength: 100,
  },
  apellido: {
    type: String,
    required: true,
    maxlength: 100,
  },
  segundo_apellido: {
    type: String,
    maxlength: 100,
  },
  correo: {
    type: String,
    required: true,
    maxlength: 100,
  },
  clave: {
    type: String,
    required: true,
    maxlength: 20,
  },
  telefono: {
    type: Number,
    required: true,
  },
  f_nac: {
    type: Date,
    required: true,
  },
  rol: {
    type: String,
    //required: true,
    maxlength: 100,
  },
  habilidades: {
    type: String,
    required: true,
    maxlength: 200,
  },
  foto: {
    type: String,
    default: null,
  },
  tipo: {
    type: String,
    enum: [
      'estudiante',
      'docente',
      'jubilado',
      'administrativo',
      'obrero',
      'egresado',
      'empresa',
    ],
    required: true,
  },
  titulo: [
    {
      f_graduacion: { type: Date, required: true },
      nivel: { type: String, maxlength: 100 },
      area: { type: String, maxlength: 50 },
      foto: { type: String },
    },
  ],
  empresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'empresa', // Nombre del modelo de empresa
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('clave')) {
    return next();
  }

  bcrypt.hash(this.clave, 8, (err, hash) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    this.correo = this.correo.toLowerCase();
    this.clave = hash;
    next();
  });
});

userSchema.methods.checkPassword = function (password) {
  const passwordHash = this.clave;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err);
      }

      resolve(same);
    });
  });
};

export default mongoose.model('user', userSchema);
