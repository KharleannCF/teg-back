import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { connect } from './utils/db.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import { config } from 'dotenv';
import { validateSessionMiddleware } from './resources/user/middleware.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import empresaRouter from './resources/empresa/router.js';
import userRouter from './resources/user/router.js';
import proyectoRouter from './resources/proyecto/router.js';
import chatRouter from './resources/chat/router.js';

config();

const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// Configuración del socket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('joinChat', ({ chatId, userId }) => {
    socket.join(chatId);
    console.log(`Usuario ${userId} se unió al chat ${chatId}`);
  });

  socket.on('sendMessage', async ({ chatId, sender, content }) => {
    /*  await Chat.findByIdAndUpdate(chatId, {
      $push: {
        messages: {
          sender,
          content,
          date: new Date(),
        },
      },
    }); */
    const message = { sender, content };
    io.to(chatId).emit('newMessage', message);
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
