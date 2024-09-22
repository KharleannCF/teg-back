import express, { text } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { connect } from './utils/db.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import { config } from 'dotenv';
import { validateSessionMiddleware } from './resources/user/middleware.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import empresaRouter from './resources/empresa/router.js';
import userRouter from './resources/user/router.js';
import proyectoRouter from './resources/proyecto/router.js';
import chatRouter from './resources/chat/router.js';
import Chat from './resources/chat/model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config();

const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// Configuración del socket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('joinChat', ({ chatId, userId }) => {
    // Validación básica
    if (!chatId || !userId) {
      console.error('Error: chatId o userId no proporcionado');
      socket.emit(
        'error',
        'El ID del chat y el ID del usuario son requeridos para unirse a un chat.'
      );
      return;
    }

    socket.join(chatId);
    console.log(`Usuario ${userId} se unió al chat ${chatId}`);
  });

  socket.on('sendMessage', async ({ chatId, sender, content }) => {
    // Validación básica
    console.log('Mensaje recibido:', { chatId, sender, content });
    try {
      if (!chatId || !sender || !content) {
        console.error('Error: Datos faltantes en el envío del mensaje');
        socket.emit(
          'error',
          'chatId, sender y content son requeridos para enviar un mensaje.'
        );
        return;
      }

      const chat = await Chat.findById(chatId);

      if (!chat) {
        console.error(`Error: Chat con ID ${chatId} no encontrado`);
        socket.emit('error', 'El chat especificado no existe.');
        return;
      }

      // Guardar el mensaje en la base de datos
      const message = { sender, content, date: new Date() };
      await Chat.findByIdAndUpdate(chatId, {
        $push: {
          mensajes: {
            fecha: message.date,
            texto: message.content,
            usuario_id: message.sender,
          },
        },
      });

      // Emitir el mensaje a la sala
      io.to(chatId).emit('newMessage', {
        fecha: message.date,
        texto: message.content,
        usuario_id: message.sender,
        leido: false,
      });

      // Emitir una notificación al otro usuario
      const userId = chat.users.find((user) => user !== sender);

      io.to(userId).emit('notification', { chatId });
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      socket.emit(
        'error',
        'Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.'
      );
    }
  });

  socket.on('notification', ({ userId }) => {
    console.log('Notificación para el usuario:', userId);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const swaggerDocument = JSON.parse(
  fs.readFileSync('./utils/scripts/swagger-output.json')
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRouter);
app.use('/api/empresa', validateSessionMiddleware, empresaRouter);
app.use('/api/proyectos', validateSessionMiddleware, proyectoRouter);
app.use('/api/chats', validateSessionMiddleware, chatRouter);

server.listen(process.env.PORT, async () => {
  await connect();
  console.log(`App listening on port ${process.env.PORT}`);
});
