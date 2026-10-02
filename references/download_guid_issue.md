# Browser Download GUID Filename Issue

**User Feedback Image:** Screenshot of Document Executed Successfully page (`/sign/env_1790979465305?party=party_2`) showing Chrome download item `da68e7e4-48b8-4a33-98cd-f6afb0195a32` (8.3 KB).
**Date Recorded:** 2026-10-02

### Cause:
When downloading using client-side `URL.createObjectURL(blob)`, Chrome generates an internal blob URL with a UUID: `blob:http://localhost:3000/da68e7e4-48b8-4a33-98cd-f6afb0195a32`. In certain Chromium environments, Chrome ignores the `download` attribute on blob links and saves the file using the blob's UUID with no file extension.

### Permanent Fix:
1. Implement a dedicated HTTP API endpoint (`/api/download-pdf`) that returns real binary PDF bytes with standard HTTP headers:
   `Content-Type: application/pdf`
   `Content-Disposition: attachment; filename="Executed_Commercial_Lease_Agreement.pdf"`
2. This ensures the browser's native download engine receives the exact filename and `.pdf` extension directly from the HTTP response headers, eliminating reliance on client-side blob URL names.
3. Also wrap the client-side download with fallback support using the `File` constructor and direct streaming.
