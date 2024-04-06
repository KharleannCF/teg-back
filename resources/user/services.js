import User from './model.js';

export const userDashboard = async (userID) => {
  try {
    const user = await User.findById(userID).lean().exec();
   
    return {
      user,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};
