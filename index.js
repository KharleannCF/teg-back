import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { connect } from './utils/db.js';
import userRouter from './resources/user/router.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import { config } from 'dotenv';
import { validateSessionMiddleware } from './resources/user/middleware.js';

config();

const app = express();

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

app.listen(process.env.PORT, async () => {
  await connect();
  console.log(`Example app listening on port ${process.env.PORT}`);
});
