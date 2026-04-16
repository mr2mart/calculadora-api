const cotizacionService = require('../services/cotizacion.service');
const catalogoRepository = require('../repositories/catalogo.repository');

const getAll = async (req, res, next) => {
  try {
    const result = await cotizacionService.getAll(req.usuario.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const result = await cotizacionService.getById(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Obtenemos el factor del tipo de producto para el cálculo LCL
    let factor = 1;
    if (req.body.tipo_cotizacion === 'LCL' && req.body.tipo_producto_id) {
      const tipos = await catalogoRepository.findAllTipoProducto();
      const tipo = tipos.find(t => t.id === req.body.tipo_producto_id);
      factor = tipo ? parseFloat(tipo.factor) : 1;
    }

    const result = await cotizacionService.create(req.body, req.usuario, factor);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let factor = 1;
    if (req.body.tipo_cotizacion === 'LCL' && req.body.tipo_producto_id) {
      const tipos = await catalogoRepository.findAllTipoProducto();
      const tipo = tipos.find(t => t.id === req.body.tipo_producto_id);
      factor = tipo ? parseFloat(tipo.factor) : 1;
    }

    const result = await cotizacionService.update(parseInt(req.params.id), req.body, req.usuario, factor);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await cotizacionService.remove(parseInt(req.params.id), req.usuario);
    res.json({ message: 'Cotización eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

const descargarPDF = async (req, res, next) => {
  try {
    const { pdfBuffer, archivo } = await cotizacionService.getPDF(parseInt(req.params.id));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${archivo}"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, descargarPDF };