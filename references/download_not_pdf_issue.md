# Reference: Downloaded File Not Recognized as PDF

**Date**: October 2, 2026  
**Reported Issue**: When clicking "Download Executed PDF", the downloaded file is named `da68e7e4-48b8-4a33-98cd-f6afb0195a32` (a raw Chromium blob UUID) without a `.pdf` extension, making it unusable and unopenable by standard PDF readers on Windows/macOS.

![User Screenshot](file:///c:/Users/titan/Downloads/Interviews/DockMaster/references/user_download_not_pdf_issue.png)

## Root Causes Identified
1. **Blob URL Revocation & Naming Race Condition**:
   - `URL.createObjectURL(blob)` creates an internal Chromium object URL with format `blob:http://localhost:3000/<UUID>`.
   - When an `<a>` tag with `download="filename.pdf"` triggers the download while running alongside asynchronous blob operations or if `URL.revokeObjectURL` fires before Chromium finishes reading the blob, Chromium falls back to saving the file as the raw URL basename (`<UUID>`) with no extension.
   - Malformed `Content-Disposition` HTTP header (`filename*=${filename}` instead of RFC 5987 `filename*=UTF-8''...`) also invalidates HTTP-based file attachment naming in Chromium.

2. **Incomplete PDF Generation for Sample Contracts**:
   - When launching pre-loaded sample agreements (such as `Commercial_Lease_Agreement.pdf`), only `textByPage` was passed into state.
   - `pdfBase64` remained undefined on initial creation.
   - When executing the document at `/sign/[envelopeId]`, `/api/burn-signatures` detected missing `pdfBase64` and generated a generic 1-page fallback stub (~8.3 KB) instead of rendering the full authentic 3-page agreement with all contractual sections, clauses, and visual signature lines.

## Solution Plan
1. **Pre-generate or synthesize proper multi-page PDF bytes for sample documents**:
   - For all sample documents or documents with `textByPage`, synthesize proper, fully-formatted multi-page PDFs using `pdf-lib` containing all clauses, headings, and lines.
2. **Robust, Foolproof Native Download Engine**:
   - Serve direct download via both:
     a) HTTP GET/POST API endpoint `/api/download-pdf` with strict, RFC-compliant headers:
        - `Content-Type: application/pdf`
        - `Content-Disposition: attachment; filename="Executed_Commercial_Lease_Agreement.pdf"`
     b) Direct client-side binary Blob fallback with `octet-stream` / `application/pdf` and delayed revocation (60s) to guarantee the browser never drops the `.pdf` extension.
3. **Verify and test download end-to-end**:
   - Verify file extension is `.pdf`.
   - Verify file size is authentic to the multi-page agreement.
   - Verify Adobe Acrobat / PDF Reader opens it cleanly.
