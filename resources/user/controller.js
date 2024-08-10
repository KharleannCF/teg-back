import UserModel from './model.js';
import { generateToken } from '../../utils/auth.js';
import { userDashboard } from './services.js';

export const UserController = {
  create(req, res) {
    console.log(req.body);
    const user = new UserModel(req.body);
    user
      .save()
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },
  list(req, res) {
    UserModel.find({})
      .lean()
      .exec()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  retrieve(req, res) {
    UserModel.findById(req.params.id)
      .lean()
      .exec()
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  update(req, res) {
    UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .lean()
      .exec()
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
  destroy(req, res) {
    UserModel.findByIdAndRemove(req.params.id)
      .lean()
      .exec()
      .then((user) => {
        res.status(204).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    const same = await user.checkPassword(password);
    if (!same) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.send({ token });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

export const dashboard = async (req, res) => {
  try {
    const data = await userDashboard(req.user);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};
