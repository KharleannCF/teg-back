import UserModel from '../user/model.js';
import EmpresaModel from './model.js';

export const empresaController = {
  async create(req, res) {
    try {
      const empresa = new EmpresaModel(req.body);
      empresa.logo = req?.file ? req?.file?.path : null;
      const createdEmpresa = await empresa.save();
      await UserModel.findByIdAndUpdate(req.user, {
        empresa: createdEmpresa._id,
      });
      res.status(201).json({
        message: 'Empresa creada exitosamente',
        empresa: createdEmpresa,
      });
    } catch (err) {
      console.error(err); // Use a proper logging mechanism in production
      res.status(400).json(err);
    }
  },
  async list(req, res) {
    try {
      const empresas = await EmpresaModel.find({}).exec();
      res.status(200).json(empresas);
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  },
  async retrieve(req, res) {
    try {
      const empresa = await EmpresaModel.findById(req.params.id).exec();
      res.status(200).json(empresa);
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  },
  async update(req, res) {
    try {
      if (req?.file) {
        req.body.logo = req?.file?.path;
      } else {
        delete req.body.logo;
      }
      const updatedEmpresa = await EmpresaModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).exec();
      res.status(200).json(updatedEmpresa);
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  },
  async destroy(req, res) {
    try {
      await EmpresaModel.findByIdAndRemove(req.params.id).exec();
      res.status(204).json({ message: 'Empresa eliminada exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  },
};
