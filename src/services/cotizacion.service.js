const pdfService = require('./pdf.service');
const mailService = require('./mail.service');
const cotizacionRepository = require('../repositories/cotizacion.repository');

// ─── Cálculo FCL ───────────────────────────────────────────────────────────────
const calcularFCL = (data) => {
  const fob_total = parseFloat(data.costo_unitario) * parseFloat(data.cantidad);

  // Valores PPD: por ahora en 0 hasta que se definan
  const flete_maritimo  = data.flete_maritimo  || 3000;
  const seguro          = data.seguro          || ((fob_total + flete_maritimo) * 0.01); // 1% CIF
  const arancel         = data.arancel         || ((fob_total + flete_maritimo) * 0.15); // 15% si no hay HS Code clasificado
  const agente_aduanal  = data.agente_aduanal  || 300;
  const transporte_local= data.transporte_local|| 4000;
  const otros_gastos    = data.otros_gastos    || 200;

  const ddp_total   = fob_total + flete_maritimo + seguro + arancel + agente_aduanal + transporte_local + otros_gastos;
  const ddp_unitario= ddp_total / parseFloat(data.cantidad);

  return {
    fob_total:        parseFloat(fob_total.toFixed(2)),
    flete_maritimo:   parseFloat(flete_maritimo),
    seguro:           parseFloat(seguro),
    arancel:          parseFloat(parseFloat(arancel).toFixed(2)),
    agente_aduanal:   parseFloat(agente_aduanal),
    transporte_local: parseFloat(transporte_local),
    otros_gastos:     parseFloat(otros_gastos),
    ddp_total:        parseFloat(ddp_total.toFixed(2)),
    ddp_unitario:     parseFloat(ddp_unitario.toFixed(2)),
    costo_x_m3:       0,
    cbm_x_costo:      0,
    peso_x_costo:     0,
  };
};

// ─── Cálculo LCL ───────────────────────────────────────────────────────────────
const calcularLCL = (data, factor) => {
  const costo_x_m3  = parseFloat(process.env.COSTO_X_M3 || 750);
  const cbm_x_costo = parseFloat(data.cbm) * costo_x_m3;
  const peso_x_costo = parseFloat(data.peso) * factor * costo_x_m3;
  const fob_total   = parseFloat(data.costo_unitario) * parseFloat(data.cantidad);
  const ddp_total   = cbm_x_costo + fob_total;
  const ddp_unitario= ddp_total / parseFloat(data.cantidad);

  return {
    fob_total:        parseFloat(fob_total.toFixed(2)),
    flete_maritimo:   0,
    seguro:           0,
    arancel:          0,
    agente_aduanal:   0,
    transporte_local: 0,
    otros_gastos:     0,
    ddp_total:        parseFloat(ddp_total.toFixed(2)),
    ddp_unitario:     parseFloat(ddp_unitario.toFixed(2)),
    costo_x_m3,
    cbm_x_costo:     parseFloat(cbm_x_costo.toFixed(2)),
    peso_x_costo:     parseFloat(peso_x_costo.toFixed(2))
  };
};

// ─── CRUD ──────────────────────────────────────────────────────────────────────
const getAll = (usuario_id) => {
  return cotizacionRepository.findAllByUsuarioId(usuario_id);
};

const getById = async (id) => {
  const cotizacion = await cotizacionRepository.findById(id);
  if (!cotizacion) throw { status: 404, message: 'Cotización no encontrada' };
  return cotizacion;
};

const create = async (data, usuario, factor) => {
  const calculos = data.tipo_cotizacion === 'FCL'
    ? calcularFCL(data)
    : calcularLCL(data, factor);

  const cotizacion = await cotizacionRepository.create({
    ...data,
    factor: factor,
    ...calculos,
    usuario_id: usuario.id,
    usuario_registro: usuario.correo
  });

  // Obtener cotización completa con relaciones para el PDF
  const cotizacionCompleta = await cotizacionRepository.findById(cotizacion.id);

  // Generar PDF y enviar correo — no bloqueamos la respuesta si falla
  try {
    const pdfBuffer = await pdfService.generarPDF(cotizacionCompleta);
    const archivo   = pdfService.nombreArchivo(cotizacionCompleta);

    await mailService.enviarCorreo({
      destinatario: usuario.correo,
      asunto: `Cotización generada - ${cotizacion.producto}`,
      mensaje: `Se ha generado la cotización satisfactoriamente.\n\nProducto: ${cotizacion.producto}\nDDP Total: ${cotizacion.ddp_total} USD\nDDP Unitario: ${cotizacion.ddp_unitario} USD`,
      esHtml: false,
      adjuntos: [{ filename: archivo, content: pdfBuffer }]
    });
  } catch (err) {
    console.error('Error al enviar correo:', err.message);
  }

  return cotizacionCompleta;
};

const update = async (id, data, usuario, factor) => {
  const existe = await cotizacionRepository.findById(id);
  if (!existe) throw { status: 404, message: 'Cotización no encontrada' };

  const calculos = data.tipo_cotizacion === 'FCL'
    ? calcularFCL(data)
    : calcularLCL(data, factor);

  return cotizacionRepository.update(id, {
    ...data,
    ...calculos,
    usuario_modificacion: usuario.correo
  });
};

const remove = async (id, usuario) => {
  const existe = await cotizacionRepository.findById(id);
  if (!existe) throw { status: 404, message: 'Cotización no encontrada' };
  return cotizacionRepository.remove(id, usuario.correo);
};

const getPDF = async (id) => {
  const cotizacion = await cotizacionRepository.findById(id);
  if (!cotizacion) throw { status: 404, message: 'Cotización no encontrada' };

  const pdfBuffer = await pdfService.generarPDF(cotizacion);
  const archivo   = pdfService.nombreArchivo(cotizacion);

  return { pdfBuffer, archivo };
};

module.exports = { getAll, getById, create, update, remove, getPDF };