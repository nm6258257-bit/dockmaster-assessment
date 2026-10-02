# Download Extension and Lessor Name Overlap Issue

**User Feedback Image:** Screenshot of Document Executed Successfully page (`/sign/[envelopeId]`) with Chrome Downloads history showing raw GUID filename without `.pdf` extension.
**Date Recorded:** 2026-10-02

### Issues Identified:
1. **Download Filename Missing `.pdf` Extension:**
   - Chrome downloaded `7cf13813-e784-4772-a5bb-69d9d10e99ef` without `.pdf` extension.
   - Root cause: `<a href={downloadPdfUrl} download={`Executed_${envelope.title}`}>` had no explicit `.pdf` extension, and data URIs are assigned blob UUIDs by modern Chromium without proper `Blob` object handling.
   - Solution: Construct a true `Blob([bytes], { type: 'application/pdf' })` and download explicitly as `Executed_${cleanTitle}.pdf`.

2. **Lessor Printed Name Overlap:**
   - On `Commercial_Lease_Agreement.pdf` Page 3, line 6 says:
     `Printed Name: Scott Taylor, Operations Director`
   - Scott Taylor's name and title are already pre-printed into the contract text.
   - The AI placed a redundant `Printed Name of Lessor` field right on top of Scott Taylor's pre-printed name.
   - Solution: Only place `text` fields where a blank line `_____` exists. If a signatory's name is already pre-printed in the contract text, omit the redundant field.
