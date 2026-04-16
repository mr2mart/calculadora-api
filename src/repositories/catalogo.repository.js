const prisma = require('../config/prisma');

const findAllUnidades = () => prisma.unidad.findMany({ where: { activo: true }, orderBy: { id: 'asc' } });
const findAllPaises = () => prisma.pais.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } });
const findAllTipoProducto = () => prisma.tipoProducto.findMany({ where: { activo: true }, orderBy: { id: 'asc' } });

module.exports = { findAllUnidades, findAllPaises, findAllTipoProducto };
