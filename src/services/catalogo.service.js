const catalogoRepository = require('../repositories/catalogo.repository');

const getUnidades     = () => catalogoRepository.findAllUnidades();
const getPaises       = () => catalogoRepository.findAllPaises();
const getTipoProducto = () => catalogoRepository.findAllTipoProducto();

module.exports = { getUnidades, getPaises, getTipoProducto };
