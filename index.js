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

config();

const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// Manejar conexiones de clientes
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Manejar mensajes del cliente
  socket.on('create-something', (message) => {
    console.log('Mensaje recibido:', message);

    // Enviar mensaje a todos los clientes, incluido el que envió el mensaje
    io.emit('message', message);
  });

  // Manejar desconexiones
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

server.listen(process.env.PORT, async () => {
  await connect();
  console.log(`App listening on port ${process.env.PORT}`);
});
