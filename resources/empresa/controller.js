import UserModel from '../user/model.js';
import EmpresaModel from './model.js';

export const empresaController = {
  create(req, res) {
    //TODO MONTAR IMAGEN EN HOSTING
    const empresa = new EmpresaModel(req.body);
    empresa
      .save()
      .then((empresa) => {
        UserModel.findByIdAndUpdate(req.user, { empresa: empresa._id }).then(
          (res) => {
            return res
              .status(201)
              .json({ message: 'Empresa creada exitosamente' });
          }
        );
        res.status(201).json(token);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },
  list(req, res) {
    EmpresaModel.find({})
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
    EmpresaModel.findById(req.params.id)
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
    EmpresaModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
    EmpresaModel.findByIdAndRemove(req.params.id)
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
