import UserModel from './model.js';
import { validateToken } from '../../utils/auth.js';

export const validateSessionMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const user = validateToken(token);
    req.user = user.id;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: 'Invalid token' });
  }
};
