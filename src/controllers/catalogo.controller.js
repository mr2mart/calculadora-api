const catalogoService = require('../services/catalogo.service');

const getUnidades = async (req, res, next) => {
  try {
    const result = await catalogoService.getUnidades();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getPaises = async (req, res, next) => {
  try {
    const result = await catalogoService.getPaises();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getTipoProducto = async (req, res, next) => {
  try {
    const result = await catalogoService.getTipoProducto();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUnidades, getPaises, getTipoProducto };
