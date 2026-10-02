import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Universal helper to convert Uint8Array to base64 in both Browser and Node.js
 */
function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof window !== 'undefined' && typeof btoa === 'function') {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

/**
 * Generates an authentic, multi-page vector PDF from textByPage data
 * with clean typography, header rules, page numbers, and legal formatting.
 */
export async function createPdfFromPages(
  title: string,
  textByPage: { page: number; text: string }[]
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const cleanDocTitle = title.replace(/\.pdf$/i, '').replace(/_/g, ' ');

  for (let i = 0; i < textByPage.length; i++) {
    const pageData = textByPage[i];
    // Standard US Letter: 612 x 792 pt
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();

    // Top Header Banner
    page.drawText(cleanDocTitle.toUpperCase(), {
      x: 50,
      y: height - 40,
      size: 8.5,
      font: helvetica,
      color: rgb(0.35, 0.4, 0.48),
    });

    page.drawText(`Page ${pageData.page} of ${textByPage.length}`, {
      x: width - 110,
      y: height - 40,
      size: 8.5,
      font: helvetica,
      color: rgb(0.35, 0.4, 0.48),
    });

    // Top dividing line
    page.drawLine({
      start: { x: 50, y: height - 46 },
      end: { x: width - 50, y: height - 46 },
      thickness: 0.75,
      color: rgb(0.8, 0.83, 0.88),
    });

    // Body Text Formatting
    const lines = pageData.text.split('\n');
    let currentY = height - 76;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line) {
        currentY -= 14;
        continue;
      }

      // Check if header line (all caps, or section heading)
      const isMainHeader = line === line.toUpperCase() && line.length > 5 && !line.includes('____');
      const isSignatureParty =
        line.startsWith('LESSOR:') ||
        line.startsWith('LESSEE:') ||
        line.startsWith('CLIENT:') ||
        line.startsWith('CONTRACTOR:') ||
        line.startsWith('DISCLOSING PARTY:') ||
        line.startsWith('RECEIVING PARTY:');

      let font = timesRoman;
      let size = 10.5;
      let color = rgb(0.12, 0.15, 0.2);

      if (isMainHeader) {
        font = timesBold;
        size = 12.5;
        color = rgb(0.05, 0.1, 0.25);
      } else if (isSignatureParty) {
        font = timesBold;
        size = 11;
        color = rgb(0.1, 0.15, 0.3);
      }

      page.drawText(line, {
        x: 50,
        y: currentY,
        size,
        font,
        color,
      });

      currentY -= size * 1.52;
    }

    // Bottom Footer
    page.drawLine({
      start: { x: 50, y: 38 },
      end: { x: width - 50, y: 38 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    page.drawText('CONFIDENTIAL & BINDING LEGAL INSTRUMENT · DOCKMASTER SECURE WORKFLOW', {
      x: 50,
      y: 26,
      size: 7,
      font: helvetica,
      color: rgb(0.48, 0.52, 0.58),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = uint8ToBase64(pdfBytes);
  return `data:application/pdf;base64,${base64}`;
}
