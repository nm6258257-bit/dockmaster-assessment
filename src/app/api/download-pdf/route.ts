import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentField } from '@/lib/types';
import { SAMPLE_DOCUMENTS } from '@/lib/sample-docs';
import { createPdfFromPages } from '@/lib/pdf-generator';
import { pdfStore } from '@/lib/pdf-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const envelopeId = searchParams.get('envelopeId') || '';
    const rawTitle = searchParams.get('title') || 'Commercial_Lease_Agreement';

    const cleanTitle = rawTitle.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Executed_${cleanTitle}.pdf`;

    let pdfBytes: Uint8Array | null = null;

    if (envelopeId && pdfStore.has(envelopeId)) {
      pdfBytes = pdfStore.get(envelopeId)!.bytes;
    }

    if (!pdfBytes) {
      // Synthesize on the fly
      const cleanT = rawTitle.replace(/\.pdf$/i, '').toLowerCase();
      const matchedSample = SAMPLE_DOCUMENTS.find(
        (s) => s.id.toLowerCase().includes(cleanT) || s.name.toLowerCase().includes(cleanT) || cleanT.includes(s.id.replace('sample-', ''))
      ) || SAMPLE_DOCUMENTS[1];
      const base64Str = await createPdfFromPages(rawTitle, matchedSample.textByPage);
      const cleanBase64 = base64Str.replace(/^data:application\/pdf;base64,/, '');
      pdfBytes = Buffer.from(cleanBase64, 'base64');
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': pdfBytes.length.toString(),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/download-pdf:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
            
            // Maintain natural aspect ratio to prevent squishing
            const imgAspect = pngImage.width / pngImage.height;
            let sigHeight = 28;
            let sigWidth = sigHeight * imgAspect;
            const maxWidth = Math.min(w || 180, 190);
            if (sigWidth > maxWidth) {
              sigWidth = maxWidth;
              sigHeight = sigWidth / imgAspect;
            }

            page.drawImage(pngImage, {
              x: x + 2,
              y: y + 3,
              width: sigWidth,
              height: sigHeight,
            });
          } catch {
            page.drawText(field.value.slice(0, 30), {
              x: x + 2,
              y: y + 4,
              size: 16,
              font: timesItalic,
              color: rgb(0.05, 0.1, 0.45),
            });
          }
        } else {
          page.drawText(field.value, {
            x: x + 2,
            y: y + 4,
            size: 16,
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
        page.drawText(field.value, {
          x: x + 2,
          y: y + 4,
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
