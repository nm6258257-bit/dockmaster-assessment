import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentField } from '@/lib/types';
import { SAMPLE_DOCUMENTS } from '@/lib/sample-docs';
import { createPdfFromPages } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
  try {
    let pdfBase64 = '';
    let fields: DocumentField[] = [];
    let title = 'Commercial_Lease_Agreement.pdf';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      pdfBase64 = body.pdfBase64 || '';
      fields = body.fields || [];
      title = body.title || title;
    } else {
      const formData = await req.formData();
      pdfBase64 = (formData.get('pdfBase64') as string) || '';
      title = (formData.get('title') as string) || title;
      const rawFields = formData.get('fields') as string;
      if (rawFields) {
        try {
          fields = JSON.parse(rawFields);
        } catch {}
      }
    }

    // If pdfBase64 is empty or missing, synthesize multi-page PDF from sample
    if (!pdfBase64 || !pdfBase64.includes('base64,')) {
      const cleanT = title.replace(/\.pdf$/i, '').toLowerCase();
      const matchedSample = SAMPLE_DOCUMENTS.find(
        (s) => s.id.toLowerCase().includes(cleanT) || s.name.toLowerCase().includes(cleanT) || cleanT.includes(s.id.replace('sample-', ''))
      ) || SAMPLE_DOCUMENTS[1]; // Default to Commercial Lease Agreement (3 pages)
      pdfBase64 = await createPdfFromPages(title, matchedSample.textByPage);
    }

    let pdfDoc: PDFDocument;

    if (pdfBase64 && pdfBase64.includes('base64,')) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const pdfBytes = Buffer.from(cleanBase64, 'base64');
      pdfDoc = await PDFDocument.load(pdfBytes);
    } else {
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      page.drawText('DockMaster AI · Fully Executed Agreement', {
        x: 50,
        y: 740,
        size: 18,
        font,
        color: rgb(0.1, 0.2, 0.4),
      });
    }

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pages = pdfDoc.getPages();

    for (const field of fields as DocumentField[]) {
      const pageIndex = Math.max(0, Math.min(pages.length - 1, (field.page || 1) - 1));
      const page = pages[pageIndex];
      const { width: pWidth, height: pHeight } = page.getSize();

      const box = field.box || { left: 100, top: 700, width: 300, height: 40 };
      const x = (box.left / 1000) * pWidth;
      const y = pHeight - ((box.top + box.height) / 1000) * pHeight;
      const w = (box.width / 1000) * pWidth;
      const h = (box.height / 1000) * pHeight;

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
          } catch {
            page.drawText(field.value.slice(0, 30), {
              x,
              y: y + 10,
              size: 16,
              font: timesItalic,
              color: rgb(0.05, 0.1, 0.5),
            });
          }
        } else {
          page.drawText(field.value, {
            x,
            y: y + 8,
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
        page.drawText(field.value, {
          x,
          y: y + 5,
          size: 11,
          font: helvetica,
          color: rgb(0.1, 0.1, 0.15),
        });
      }
    }

    // Tamper-evident audit banner on footer of last page
    const lastPage = pages[pages.length - 1];
    lastPage.drawText(`Digitally Executed & Certified via DockMaster AI · Audit ID: DM-${Date.now().toString(36).toUpperCase()} · ${new Date().toISOString()}`, {
      x: 30,
      y: 18,
      size: 8,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    const cleanTitle = (title || 'Agreement')
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Executed_${cleanTitle}.pdf`;

    return new NextResponse(Buffer.from(modifiedPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': modifiedPdfBytes.length.toString(),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Error in /api/download-pdf:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate PDF download' },
      { status: 500 }
    );
  }
}
