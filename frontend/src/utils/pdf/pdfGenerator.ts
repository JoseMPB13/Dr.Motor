import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WorkOrder, Client, Vehicle, Invoice } from '../../types';

const formatCurrency = (amount: number) => {
  return `Bs. ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generador de Documentos PDF para Dr. Motor
 */
export const pdfGenerator = {
  
  /**
   * Genera el PDF de una Orden de Trabajo (Técnica)
   */
  generateWorkOrder: (order: WorkOrder, client: Client, vehicle: Vehicle, servicesCatalog: any[] = []) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- ENCABEZADO ---
    doc.setDrawColor(30, 58, 138); // Blue-900
    doc.setLineWidth(1.5);
    doc.line(15, 15, pageWidth - 15, 15);
    
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bolditalic');
    doc.text('Dr. Motor', 15, 28);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Gestión Profesional de Taller Mecánico', 15, 34);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE TRABAJO', pageWidth - 15, 28, { align: 'right' });
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`N°- ${order.id.toString().padStart(5, '0')}`, pageWidth - 15, 35, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha Apertura: ${formatDate(order.start_date)}`, pageWidth - 15, 41, { align: 'right' });

    // --- BLOQUE 1: DATOS (SIN CUADROS) ---
    doc.setTextColor(0, 0, 0);
    let currentY = 55;

    // Cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DATOS DEL CLIENTE', 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${client.first_name} ${client.last_name}`, 15, currentY + 7);
    doc.text(`Teléfono: ${client.phone_number}`, 15, currentY + 13);
    doc.text(`Email: ${client.email || 'No registrado'}`, 15, currentY + 19);

    // Vehículo
    const midPoint = (pageWidth / 2) + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DATOS DEL VEHÍCULO', midPoint, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Placa: ${vehicle.license_plate}`, midPoint, currentY + 7);
    doc.text(`Marca/Modelo: ${vehicle.make} ${vehicle.model}`, midPoint, currentY + 13);
    doc.text(`Año: ${vehicle.year}`, midPoint, currentY + 19);

    currentY += 35;

    // --- BLOQUE 2: DIAGNÓSTICO ---
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(15, currentY - 2, 45, currentY - 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('MOTIVO DE INGRESO / FALLA REPORTADA:', 15, currentY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    const splitIssue = doc.splitTextToSize(order.issue_description || 'Sin descripción detallada.', pageWidth - 30);
    doc.text(splitIssue, 15, currentY + 12);
    
    currentY += (splitIssue.length * 5) + 20;

    // --- BLOQUE 3: TRABAJOS ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('DETALLE DE SERVICIOS ADQUIRIDOS:', 15, currentY);

    const tableData = order.services_performed.map((sp) => {
      const serviceInfo = servicesCatalog.find(s => s.id === sp.service_id);
      return [
        serviceInfo ? serviceInfo.name : `Servicio #${sp.service_id}`,
        sp.quantity,
        formatCurrency(sp.price_at_time),
        formatCurrency(sp.price_at_time * sp.quantity)
      ];
    });

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Descripción del Servicio', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });

    // --- PIE DE PÁGINA ---
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Este documento es una orden de trabajo interna para Dr. Motor.', pageWidth / 2, 285, { align: 'center' });

    doc.save(`OT_${order.id}_${vehicle.license_plate}.pdf`);
  },

  /**
   * Genera el PDF de una Factura (Financiera)
   */
  generateInvoice: (invoice: Invoice, order: WorkOrder, client: Client, vehicle: Vehicle, servicesCatalog: any[] = []) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- ENCABEZADO COMERCIAL ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bolditalic');
    doc.text('Dr. Motor', 15, 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT: 1029384756 | Santa Cruz - Bolivia', 15, 30);
    doc.text('Av. Las Palmas #123 | Tel: +591 3 3456789', 15, 35);
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', pageWidth - 15, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`N° ${invoice.id.toString().padStart(6, '0')}`, pageWidth - 15, 30, { align: 'right' });
    doc.text(`Fecha: ${formatDate(invoice.invoice_date)}`, pageWidth - 15, 35, { align: 'right' });

    // --- PANEL DE DATOS (SIN CUADROS) ---
    doc.setTextColor(0, 0, 0);
    let topY = 60;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 15, topY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${client.first_name.toUpperCase()} ${client.last_name.toUpperCase()}`, 15, topY + 7);
    doc.text(`Tel: ${client.phone_number}`, 15, topY + 13);
    
    const midPoint = (pageWidth / 2) + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL VEHÍCULO:', midPoint, topY);
    doc.setFont('helvetica', 'normal');
    doc.text(`PLACA: ${vehicle.license_plate}`, midPoint, topY + 7);
    doc.text(`${vehicle.make} ${vehicle.model}`, midPoint, topY + 13);

    // --- TABLA ---
    const tableData = order.services_performed.map((sp) => {
      const serviceInfo = servicesCatalog.find(s => s.id === sp.service_id);
      return [
        serviceInfo ? serviceInfo.name : `Servicio #${sp.service_id}`,
        sp.quantity,
        formatCurrency(sp.price_at_time),
        formatCurrency(sp.price_at_time * sp.quantity)
      ];
    });

    autoTable(doc, {
      startY: topY + 25,
      head: [['Descripción del Trabajo / Repuesto', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 }
    });

    // --- TOTAL ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL A PAGAR (Bs.):', pageWidth - 90, finalY);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(invoice.total_amount), pageWidth - 15, finalY, { align: 'right' });

    // --- PIE DE PÁGINA ---
    const footerY = 280;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS. EL USO ILÍCITO SERÁ SANCIONADO.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('¡Gracias por elegir Dr. Motor!', pageWidth / 2, footerY + 6, { align: 'center' });

    doc.save(`Factura_${invoice.id}_${client.last_name}.pdf`);
  }
};
