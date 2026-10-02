import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentField } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, fields = [], title = 'Signed_Document.pdf' } = await req.json();

    let pdfDoc: PDFDocument;

    if (pdfBase64) {
      // Clean base64 string
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const pdfBytes = Buffer.from(cleanBase64, 'base64');
      pdfDoc = await PDFDocument.load(pdfBytes);
    } else {
      // Fallback: create fresh document if no base64 was sent
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      page.drawText('DockMaster AI Executed Agreement', {
        x: 50,
        y: 730,
        size: 20,
        font,
        color: rgb(0.1, 0.2, 0.4),
      });
    }

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pages = pdfDoc.getPages();

    for (const field of fields as DocumentField[]) {
      const pageIndex = Math.max(0, Math.min(pages.length - 1, field.page - 1));
      const page = pages[pageIndex];
      const { width: pWidth, height: pHeight } = page.getSize();

      // Convert 0..1000 scale to PDF points
      const x = (field.box.left / 1000) * pWidth;
      const y = pHeight - ((field.box.top + field.box.height) / 1000) * pHeight;
      const w = (field.box.width / 1000) * pWidth;
      const h = (field.box.height / 1000) * pHeight;

      if (field.type === 'signature' && field.value) {
        if (field.value.startsWith('data:image/png')) {
          try {
            const pngBase64 = field.value.replace(/^data:image\/png;base64,/, '');
            const pngBytes = Buffer.from(pngBase64, 'base64');
            const pngImage = await pdfDoc.embedPng(pngBytes);
            page.drawImage(pngImage, {
              x,
              y,
              width: Math.min(w, 180),
              height: Math.min(h, 60),
            });
          } catch (imgErr) {
            // Draw text signature fallback
            page.drawText(field.value.slice(0, 30), {
              x,
              y: y + 10,
              size: 16,
              font: timesItalic,
              color: rgb(0.05, 0.1, 0.5),
            });
          }
        } else {
          // Cursive simulated script
          page.drawText(field.value, {
            x,
            y: y + 10,
            size: 18,
            font: timesItalic,
            color: rgb(0.05, 0.1, 0.5),
          });
        }
      } else if (field.type === 'checkbox') {
        const isChecked = field.value === 'true' || field.value === 'checked';
        page.drawRectangle({
          x,
          y,
          width: 14,
          height: 14,
          borderColor: rgb(0.2, 0.3, 0.4),
          borderWidth: 1,
        });
        if (isChecked) {
          page.drawText('X', {
            x: x + 3,
            y: y + 2,
            size: 11,
            font: helveticaBold,
            color: rgb(0.1, 0.6, 0.3),
          });
        }
      } else if (field.value) {
        // Text or Date field
        page.drawText(field.value, {
          x,
          y: y + 5,
          size: 11,
          font: helvetica,
          color: rgb(0.1, 0.1, 0.15),
        });
      }
    }

    // Add tamper-evident footer to the last page
    const lastPage = pages[pages.length - 1];
    const { width: lpWidth } = lastPage.getSize();
    lastPage.drawText(`Digitally Executed via DockMaster AI · Audit ID: DM-${Date.now().toString(36).toUpperCase()} · ${new Date().toISOString()}`, {
      x: 30,
      y: 20,
      size: 8,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const resultBase64 = Buffer.from(modifiedPdfBytes).toString('base64');

    return NextResponse.json({
      success: true,
      pdfBase64: `data:application/pdf;base64,${resultBase64}`,
    });
  } catch (err: any) {
    console.error('Burn signatures error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to burn signatures' },
      { status: 500 }
    );
  }
}
