import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface PdfInput {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  length: number;
  terrainType: string;
  depth: number;
  conduitsCount: number;
  resultItems: Array<{ name: string; unit: string; qty: number; priceNet: number; totalNet: number }>;
  summary: {
    subTotalNet: number;
    markup: number;
    totalNet: number;
    vat: number;
    totalBrutto: number;
  };
}

export async function createEstimatePdf(data: PdfInput) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = new PassThrough();
  const buffers: Buffer[] = [];

  doc.pipe(stream);

  doc.fontSize(18).text('Tomasz Budz Elektro-Podhale', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text('Wycena przyłącza energetycznego', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(10).text(`Klient: ${data.clientName}`);
  doc.text(`Telefon: ${data.clientPhone}`);
  if (data.clientEmail) doc.text(`E-mail: ${data.clientEmail}`);
  doc.text(`Długość przyłącza: ${data.length} m`);
  doc.text(`Rodzaj terenu: ${data.terrainType}`);
  doc.text(`Głębokość: ${data.depth} m`);
  doc.text(`Liczba przepustów: ${data.conduitsCount}`);
  doc.moveDown(0.5);

  doc.fontSize(12).text('Szczegóły kosztorysu:');
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const columnPositions = {
    name: 40,
    qty: 300,
    unit: 360,
    price: 430,
    total: 515
  };

  doc.fontSize(10).text('Pozycja', columnPositions.name, tableTop);
  doc.text('Ilość', columnPositions.qty, tableTop);
  doc.text('Jm', columnPositions.unit, tableTop);
  doc.text('Cena netto', columnPositions.price, tableTop);
  doc.text('Wartość', columnPositions.total, tableTop);
  doc.moveDown(0.5);

  data.resultItems.forEach((item) => {
    const y = doc.y;
    doc.text(item.name, columnPositions.name, y, { width: 240 });
    doc.text(item.qty.toFixed(2), columnPositions.qty, y);
    doc.text(item.unit, columnPositions.unit, y);
    doc.text(item.priceNet.toFixed(2), columnPositions.price, y);
    doc.text(item.totalNet.toFixed(2), columnPositions.total, y);
    doc.moveDown(0.8);
  });

  doc.moveDown(1);
  doc.text(`Suma netto: ${data.summary.subTotalNet.toFixed(2)} PLN`, { align: 'right' });
  doc.text(`Narzut firmowy (15%): ${data.summary.markup.toFixed(2)} PLN`, { align: 'right' });
  doc.text(`Wartość netto ogółem: ${data.summary.totalNet.toFixed(2)} PLN`, { align: 'right' });
  doc.text(`VAT 23%: ${data.summary.vat.toFixed(2)} PLN`, { align: 'right' });
  doc.font('Helvetica-Bold').text(`Suma brutto: ${data.summary.totalBrutto.toFixed(2)} PLN`, { align: 'right' });

  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica').text('Tomasz Budz Elektro-Podhale, ul. Długa 74, 34-530 Bukowina Tatrzańska', { align: 'center' });
  doc.text('tel. +48 606 740 118 | Wygenerowano automatycznie z kalkulatora online.', { align: 'center' });

  doc.end();

  stream.on('data', (chunk) => buffers.push(chunk));

  await new Promise((resolve) => stream.on('end', resolve));

  return Buffer.concat(buffers);
}
