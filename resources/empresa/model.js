import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

const empresaSchema = new mongoose.Schema(
  {
    rif: {
      type: String,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: true,
      maxlength: 100,
    },

    logo: {
      type: String,
      default: null,
    },
    web: {
      type: String,
      default: null,
    },
    direccion: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('empresa', empresaSchema);
