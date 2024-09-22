import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    ],
    proyecto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'proyecto' /* required: true  */,
    },
    estado: { type: String, required: true, maxlength: 50 },
    mensajes: [
      {
        texto: { type: String, required: true, maxlength: 500 },
        usuario_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
        leido: { type: Boolean, default: false },
        fecha: { type: Date, default: Date.now },
        contenido_adjunto: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('chat', ChatSchema);
