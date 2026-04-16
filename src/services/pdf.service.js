const PDFDocument = require('pdfkit');

// ─── Colores y fuentes ────────────────────────────────────────────────────────
const COLOR_AZUL    = '#0061AC';
const COLOR_GRIS    = '#555555';
const COLOR_NEGRO   = '#000000';
const COLOR_FONDO   = '#F2F2F2';
const COLOR_LINEA   = '#CCCCCC';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const lineaHorizontal = (doc, y, color = COLOR_LINEA) => {
  doc.moveTo(40, y).lineTo(555, y).strokeColor(color).lineWidth(0.5).stroke();
};

const filaDesglose = (doc, label, valor, y, negrita = false) => {
  doc.fontSize(9)
     .fillColor(COLOR_NEGRO)
     .font(negrita ? 'Helvetica-Bold' : 'Helvetica')
     .text(label, 50, y)
     .text(valor,  400, y, { width: 150, align: 'right' });
};

// ─── Encabezado empresa ───────────────────────────────────────────────────────
const encabezado = (doc, tipoCotizacion) => {
  // Bloque empresa (izquierda)
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text('Asiatic Connection', 40, 40);

  doc.fontSize(8).font('Helvetica').fillColor(COLOR_GRIS)
     .text('Iglesia 160, Jardines del Pedregal', 40, 57)
     .text('Álvaro Obregón, CDMX',              40, 68)
     .text('Tel: 0052 5586116009',               40, 79)
     .text('jorval@asiatic-connection.com',      40, 90)
     .text('www.asiatic-connection.com',         40, 101);

  // Título cotización (derecha)
  const esFCL = tipoCotizacion === 'FCL';
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text(`COTIZACIÓN FOB-DDP (${tipoCotizacion})`, 300, 40, { width: 255, align: 'right' });

  doc.fontSize(10).font('Helvetica').fillColor(COLOR_GRIS)
     .text(esFCL ? 'Contenedor Completo' : 'Contenedor Consolidado', 300, 58, { width: 255, align: 'right' });

  const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.fontSize(9).fillColor(COLOR_NEGRO)
     .text(`Fecha: ${fecha}`, 300, 75, { width: 255, align: 'right' });

  lineaHorizontal(doc, 118, COLOR_AZUL);
};

// ─── Sección: Datos de la carga ───────────────────────────────────────────────
const seccionDatos = (doc, cotizacion, unidad, pais, tipoProducto) => {
  let y = 128;

  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text('DATOS DE LA CARGA', 40, y);
  y += 16;

  lineaHorizontal(doc, y);
  y += 8;

  const fila = (label, valor) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR_GRIS).text(label, 50, y);
    doc.fontSize(9).font('Helvetica').fillColor(COLOR_NEGRO).text(valor, 200, y);
    y += 14;
  };

  fila('Producto:',        cotizacion.producto);
  fila('País de Origen:',  pais?.nombre || '—');
  fila('Costo Unitario:',  `${fmt(cotizacion.costo_unitario)} USD`);
  fila('Cantidad:',        `${parseFloat(cotizacion.cantidad).toLocaleString()} ${unidad?.descripcion || ''}`);
  fila('CBM:',             `${parseFloat(cotizacion.cbm)} m³`);
  fila('Peso:',            `${parseFloat(cotizacion.peso).toLocaleString()} ${cotizacion.tipo_cotizacion === 'FCL' ? 'kg' : 'toneladas'}`);

  if (cotizacion.tipo_cotizacion === 'FCL') {
    fila('HS Code:',   cotizacion.hs_code);
    fila('Incoterm:',  cotizacion.incoterm);
  } else {
    fila('Tipo de Producto:', tipoProducto?.descripcion || '—');
  }

  fila('Puerto Final:',   cotizacion.puerto_final);
  fila('Destino Final:',  cotizacion.destino_final);

  lineaHorizontal(doc, y + 4);
  return y + 14;
};

// ─── Sección: Desglose FCL ────────────────────────────────────────────────────
const seccionDesgloseFCL = (doc, cotizacion, y) => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text('DESGLOSE DE COSTOS', 40, y);
  y += 16;

  lineaHorizontal(doc, y);
  y += 10;

  filaDesglose(doc, 'FOB Total:',           fmt(cotizacion.fob_total),         y); y += 16;
  filaDesglose(doc, 'Flete Marítimo:',      fmt(cotizacion.flete_maritimo),    y); y += 16;
  filaDesglose(doc, 'Seguro (1% CIF):',     fmt(cotizacion.seguro),            y); y += 16;
  filaDesglose(doc, 'Arancel:',             fmt(cotizacion.arancel),           y); y += 16;
  filaDesglose(doc, 'Agente Aduanal:',      fmt(cotizacion.agente_aduanal),    y); y += 16;
  filaDesglose(doc, 'Transporte Local:',    fmt(cotizacion.transporte_local),  y); y += 16;
  filaDesglose(doc, 'Otros Gastos:',        fmt(cotizacion.otros_gastos),      y); y += 20;

  lineaHorizontal(doc, y);
  y += 8;

  return y;
};

// ─── Sección: Desglose LCL ────────────────────────────────────────────────────
const seccionDesgloseLCL = (doc, cotizacion, tipoProducto, y) => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text('DESGLOSE DE COSTOS', 40, y);
  y += 16;

  lineaHorizontal(doc, y);
  y += 10;

  // Caja gris informativa
  doc.rect(40, y, 515, 20).fill(COLOR_FONDO);
  doc.fontSize(8).font('Helvetica').fillColor(COLOR_GRIS)
     .text('COSTO DE IMPORTACIÓN LCL:', 50, y + 6)
     .font('Helvetica-Bold').fillColor(COLOR_NEGRO)
     .text(`${fmt(cotizacion.cbm_x_costo)} USD`, 400, y + 6, { width: 150, align: 'right' });
  y += 24;

  doc.fontSize(8).font('Helvetica').fillColor(COLOR_GRIS)
     .text('Incluye: flete, seguro, arancel, agente aduanal, transporte local y otros gastos', 50, y);
  y += 16;

  const factor = tipoProducto?.factor ? parseFloat(tipoProducto.factor) : 1;
  const cbmCobrable = parseFloat(cotizacion.cbm);
  const costoM3 = parseFloat(cotizacion.costo_x_m3);
  const pesoTon = parseFloat(cotizacion.peso);
  const costoPorTon = factor * costoM3;

  filaDesglose(doc, `CBM cobrable (${cbmCobrable.toFixed(2)} m³) × ${fmt(costoM3)}/m³`, fmt(cotizacion.cbm_x_costo), y); y += 16;
  filaDesglose(doc, `Peso (${pesoTon.toFixed(1)} ton) × ${fmt(costoPorTon)}/ton`,        fmt(cotizacion.peso_x_costo),   y); y += 16;
  filaDesglose(doc, `FOB Total (${parseFloat(cotizacion.cantidad).toLocaleString()} ${cotizacion.unidad?.descripcion || ''})`, fmt(cotizacion.fob_total), y); y += 20;

  lineaHorizontal(doc, y);
  y += 8;

  return y;
};

// ─── Totales DDP ──────────────────────────────────────────────────────────────
const seccionTotales = (doc, cotizacion, unidad, y) => {
  // Caja roja DDP Total
  doc.rect(40, y, 515, 26).fill(COLOR_AZUL);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('DDP TOTAL*', 50, y + 7)
     .text(`${fmt(cotizacion.ddp_total)} USD`, 400, y + 7, { width: 150, align: 'right' });
  y += 32;

  // DDP Unitario
  const ddpUnitario = cotizacion.tipo_cotizacion === 'LCL' ? 'Kilogramo' : 'Tonelada';

  doc.rect(40, y, 515, 22).fill(COLOR_FONDO);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR_NEGRO)
     .text(`DDP UNITARIO* (por ${ddpUnitario})`, 50, y + 6)
     .text(`${fmt(cotizacion.ddp_unitario)} USD`, 400, y + 6, { width: 150, align: 'right' });
  y += 30;

  if (cotizacion.tipo_cotizacion === 'LCL') {
    doc.fontSize(8).font('Helvetica').fillColor(COLOR_GRIS)
       .text('DDP Unitario: Es el incoterm donde el proveedor/vendedor se encarga de TODO hasta que la mercancía llega a nuestra bodega en CDMX.', 40, y, { width: 515 });
    y += 24;
  }

  return y;
};

// ─── Línea de tiempo ──────────────────────────────────────────────────────────
const seccionTimeline = (doc, y) => {
  y += 10;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_AZUL)
     .text('LÍNEA DE TIEMPO DEL PROCESO', 40, y);
  y += 16;

  lineaHorizontal(doc, y);
  y += 10;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR_GRIS)
     .text('Duración total estimada: 76 – 138 días', 50, y);
  y += 16;

  const etapas = [
    ['Auditoría / Contratos en Chino', '5-10 días'],
    ['Producción',                      '25-35 días'],
    ['Consolidar Mercancía Completa',   '15-45 días'],
    ['Logística Internacional',         '25-35 días'],
    ['Importación',                     '5-10 días'],
    ['Flete Nacional',                  '1-3 días'],
  ];

  etapas.forEach(([etapa, tiempo]) => {
    // Punto rojo
    doc.circle(56, y + 4, 3).fill(COLOR_AZUL);
    doc.fontSize(9).font('Helvetica').fillColor(COLOR_NEGRO)
       .text(etapa, 65, y)
       .text(tiempo, 400, y, { width: 150, align: 'right' });
    y += 14;
  });

  y += 6;
  doc.fontSize(7).font('Helvetica').fillColor(COLOR_GRIS)
     .text('Los tiempos son estimados y pueden variar según las características del producto, proveedor, condiciones logísticas y requisitos aduanales.', 40, y, { width: 515 });

  return y + 24;
};

// ─── Aviso legal ──────────────────────────────────────────────────────────────
const seccionAvisoLegal = (doc, y) => {
  lineaHorizontal(doc, y);
  y += 8;

  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR_GRIS)
     .text('AVISO LEGAL', 40, y);
  y += 12;

  const texto1 = '* Los costos presentados son estimaciones referenciales calculadas con base en información preliminar proporcionada por el usuario y condiciones estándar de mercado al momento de la consulta.';
  const texto2 = 'Para la determinación de un costo final y vinculante, será indispensable contar con documentación completa y validada, incluyendo pero no limitada a: ficha técnica, características del producto, factura comercial (invoice), lista de empaque (packing list) y cualquier otro documento necesario para su correcta clasificación arancelaria y cumplimiento regulatorio.';
  const texto3 = 'Los precios indicados corresponden a mercancía entregada en nuestras bodegas en CDMX o Guadalajara. El costo de flete desde nuestras instalaciones hasta la bodega del cliente no está incluido y será cotizado de manera adicional, ya sea mediante fletera externa o con unidades propias.';

  [texto1, texto2, texto3].forEach(t => {
    doc.fontSize(7).font('Helvetica').fillColor(COLOR_GRIS).text(t, 40, y, { width: 515 });
    y += doc.heightOfString(t, { width: 515 }) + 6;
  });

  return y;
};

// ─── Función principal ────────────────────────────────────────────────────────
const generarPDF = (cotizacion) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'LETTER' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end',  () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const unidad       = cotizacion.unidad;
      const pais         = cotizacion.pais;
      const tipoProducto = cotizacion.tipo_producto;

      // Construir PDF
      encabezado(doc, cotizacion.tipo_cotizacion);

      let y = seccionDatos(doc, cotizacion, unidad, pais, tipoProducto);

      y += 10;

      if (cotizacion.tipo_cotizacion === 'FCL') {
        y = seccionDesgloseFCL(doc, cotizacion, y);
      } else {
        y = seccionDesgloseLCL(doc, cotizacion, tipoProducto, y);
      }

      y = seccionTotales(doc, cotizacion, unidad, y);
      y = seccionTimeline(doc, y);
      seccionAvisoLegal(doc, y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ─── Nombre del archivo ───────────────────────────────────────────────────────
const nombreArchivo = (cotizacion) => {
  const fecha = new Date().toISOString()
    .replace('T', '_').replace(/:/g, '-').split('.')[0];
  const producto = cotizacion.producto.replace(/\s+/g, '_').substring(0, 30);
  return `Cotizacion_${cotizacion.tipo_cotizacion}_${producto}_${fecha}.pdf`;
};

module.exports = { generarPDF, nombreArchivo };
