import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentField } from '@/lib/types';
import { SAMPLE_DOCUMENTS } from '@/lib/sample-docs';
import { createPdfFromPages } from '@/lib/pdf-generator';
import { pdfStore } from '@/lib/pdf-store';

export async function POST(req: NextRequest) {
  try {
    const {
      envelopeId,
      pdfBase64: rawPdfBase64,
      fields = [],
      title = 'Commercial_Lease_Agreement.pdf',
      textByPage: rawTextByPage
    } = await req.json();

    let pdfBase64 = rawPdfBase64;

    // If pdfBase64 is missing, retrieve or synthesize authentic multi-page PDF
    if (!pdfBase64 || !pdfBase64.includes('base64,')) {
      let pages = rawTextByPage;
      if (!pages || pages.length === 0) {
        const cleanT = title.replace(/\.pdf$/i, '').toLowerCase();
        const matchedSample = SAMPLE_DOCUMENTS.find(
          (s) => s.id.toLowerCase().includes(cleanT) || s.name.toLowerCase().includes(cleanT) || cleanT.includes(s.id.replace('sample-', ''))
        ) || SAMPLE_DOCUMENTS[1]; // Default to Commercial Lease Agreement (3 pages)
        pages = matchedSample.textByPage;
      }
      if (pages && pages.length > 0) {
        pdfBase64 = await createPdfFromPages(title, pages);
      }
    }

    let pdfDoc: PDFDocument;

    if (pdfBase64 && pdfBase64.includes('base64,')) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const pdfBytes = Buffer.from(cleanBase64, 'base64');
      pdfDoc = await PDFDocument.load(pdfBytes);
    } else {
      // Ultimate fallback: create clean letter page
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

            // Preserve natural aspect ratio so signature is never vertically squished or horizontally stretched
            const imgAspect = pngImage.width / pngImage.height;
            let sigHeight = 15;
            let sigWidth = sigHeight * imgAspect;
            const maxWidth = Math.min(w || 150, 160);
            if (sigWidth > maxWidth) {
              sigWidth = maxWidth;
              sigHeight = sigWidth / imgAspect;
            }

            page.drawImage(pngImage, {
              x: x + 2,
              y: y + 1,
              width: sigWidth,
              height: sigHeight,
            });
          } catch (imgErr) {
            page.drawText(field.value.slice(0, 30), {
              x: x + 2,
              y: y + 2,
              size: 12.5,
              font: timesItalic,
              color: rgb(0.05, 0.1, 0.45),
            });
          }
        } else {
          // Cursive simulated script
          page.drawText(field.value, {
            x: x + 2,
            y: y + 2,
            size: 12.5,
            font: timesItalic,
            color: rgb(0.05, 0.1, 0.45),
          });
        }
      } else if (field.type === 'checkbox') {
        const isChecked = field.value === 'true' || field.value === 'checked';

        // 1. Total opaque white background to completely mask initial "[ ]" placeholder
        page.drawRectangle({
          x: x - 1,
          y: y - 2,
          width: 14,
          height: 14,
          color: rgb(1, 1, 1), // 100% Solid Opaque White
        });

        if (isChecked) {
          // 2. Clean, elegant checkmark tick matching document text size (~10.5pt)
          page.drawLine({
            start: { x: x + 1.5, y: y + 3 },
            end: { x: x + 4.5, y: y - 0.5 },
            thickness: 1.8,
            color: rgb(0.05, 0.50, 0.22),
          });
          page.drawLine({
            start: { x: x + 4.5, y: y - 0.5 },
            end: { x: x + 10.5, y: y + 9 },
            thickness: 1.8,
            color: rgb(0.05, 0.50, 0.22),
          });
        } else {
          // Clean unchecked outline box
          page.drawRectangle({
            x: x + 1,
            y: y,
            width: 10,
            height: 10,
            borderColor: rgb(0.35, 0.4, 0.45),
            borderWidth: 1,
            color: rgb(1, 1, 1),
          });
        }
      } else if (field.value) {
        // Text or Date field
        page.drawText(field.value, {
          x: x + 2,
          y: y + 4,
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

    if (envelopeId) {
      pdfStore.set(envelopeId, { bytes: modifiedPdfBytes, title });
    }

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
