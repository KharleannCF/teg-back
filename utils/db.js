import mongoose from 'mongoose';

export const connect = () => {
  return mongoose.connect(process.env.DB_LINK)
}
