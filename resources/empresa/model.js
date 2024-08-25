import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

const empresaSchema = new mongoose.Schema({
  rif: {
    type: Number,
    required: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
    maxlength: 100,
  },

  foto: {
    type: String,
    default: null,
  },
});

export default mongoose.model('empresa', empresaSchema);
