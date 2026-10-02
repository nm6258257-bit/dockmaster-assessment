// Global in-memory cache for executed PDF documents
// Preserves generated PDF buffers across requests and dev server reloads

const globalForPdf = globalThis as unknown as {
  dmPdfStore?: Map<string, { bytes: Uint8Array; title: string }>;
};

export const pdfStore =
  globalForPdf.dmPdfStore || new Map<string, { bytes: Uint8Array; title: string }>();

globalForPdf.dmPdfStore = pdfStore;
