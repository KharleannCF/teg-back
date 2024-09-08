import mongoose from 'mongoose';

export const connect = () => {
  return mongoose
    .connect(process.env.DB_LINK)
    .then((_res) => console.log('connected to DB'))
    .catch((err) => console.log('error with db:', err));
};
