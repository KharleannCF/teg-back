import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

const proyectoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, maxlength: 120 },
    f_inicio: { type: Date, required: true },
    duracion: { type: Number, required: true },
    num_participantes: { type: Number, required: true },
    descripcion: { type: String, required: true, maxlength: 200 },
    requisitos: [{ type: String, required: true, maxlength: 200 }],
    contratacion: {
      type: String,
      enum: ['fijo', 'temporal', 'practica', 'medio tiempo', 'por hora'],
      default: 'fijo',
    },
    costo: { type: Number },
    lider: { type: String, required: true, maxlength: 100 },
    imagen: { type: String, default: null },
    estado: {
      type: String,
      enum: ['pendiente', 'en progreso', 'terminado'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Nombre del modelo del usuario
    },
    participantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Nombre del modelo del usuario
      },
    ],
    candidatos: [
      {
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user', // Nombre del modelo del usuario
        },
        status: {
          type: String,
          enum: ['pendiente', 'aceptado', 'rechazado'],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
export default mongoose.model('proyecto', proyectoSchema);
