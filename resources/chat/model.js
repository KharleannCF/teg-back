import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    users: [{ type: Number, ref: 'Usuario', required: true }],
    proyecto_id: { type: Number, ref: 'Proyecto', required: true },
    estado: { type: String, required: true, maxlength: 50 },
    mensajes: [
      {
        texto: { type: String, required: true, maxlength: 500 },
        usuario_id: { type: Number, ref: 'Usuario', required: true },
        leido: { type: Boolean, default: false },
        fecha: { type: Date, default: Date.now },
        contenido_adjunto: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('chat', ChatSchema);
