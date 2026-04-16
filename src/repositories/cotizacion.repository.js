const prisma = require('../config/prisma');

const findAllByUsuarioId = (usuario_id) => {
  return prisma.cotizacion.findMany({
    where: { usuario_id, activo: true },
    include: { unidad: true, pais: true, tipo_producto: true },
    orderBy: { fecha_registro: 'desc' }
  });
};

const findById = (id) => {
  return prisma.cotizacion.findUnique({
    where: { id },
    include: { unidad: true, pais: true, tipo_producto: true }
  });
};

const create = (data) => {
  return prisma.cotizacion.create({ data });
};

const update = (id, data) => {
  return prisma.cotizacion.update({
    where: { id },
    data: {
      ...data,
      fecha_modificacion: new Date()
    }
  });
};

const remove = (id, usuario_modificacion) => {
  return prisma.cotizacion.update({
    where: { id },
    data: {
      activo: false,
      usuario_modificacion,
      fecha_modificacion: new Date()
    }
  });
};

module.exports = { findAllByUsuarioId, findById, create, update, remove };
