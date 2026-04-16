const prisma = require('../config/prisma');

const getByNombre = async (nombre) => {
  const config = await prisma.configuracion.findUnique({
    where: { nombre }
  });
  if (!config) throw new Error(`Configuración '${nombre}' no encontrada`);
  return config.valor;
};

module.exports = { getByNombre };