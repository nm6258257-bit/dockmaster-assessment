# Visual Check: Field Placement Alignment Issue

**User Feedback Image:** Screenshot of DocumentViewer showing `Commercial_Lease_Agreement.pdf` (Page 3)
**Date Recorded:** 2026-10-02

### Text Shown in Document:
```text
ACKNOWLEDGEMENT & EXECUTION:
[ ] I certify that my vessel carries valid hull and liability insurance as required.

LESSOR: Harbor View Marina LLC
Signature: _________________________
Date:
Printed Name: Scott Taylor, Operations Director

LESSEE: Authorized Boat Owner
Signature:
Date:
Printed Name: _______________________
```

### Visual Misalignments Identified:
1. **Checkbox:** Misplaced at ~top 30% directly overlapping `Printed Name: Scott Taylor`, instead of on the `[ ] I certify...` line (~top 9%, left 4%).
2. **Lessor Fields:** Laid out horizontally across the page at ~top 50% side-by-side (`Signature of Lessor`, `Date of Lessor`, `Printed Name of Lessor`). The `Signature of Lessor` box directly covers the `LESSEE: Authorized Boat Owner` header and `Signature:` label!
3. **Lessee Fields:** Laid out horizontally across the page at ~top 65% in empty space below the contract text.
4. **Layout Geometry:** The document text is stacked vertically per party (Lessor on top, Lessee below), but the AI stamped horizontal 3-column rows that collide with lines.

### Solution Requirements:
1. **Spatial Anchor Matching:** When placing fields, find the exact line / text anchor in the document (e.g. `[ ]`, `Signature:`, `Date:`, `Printed Name:`, `By:`) and align the field box directly onto the corresponding underline `_____` or box.
2. **Interactive Drag & Resize:** Enable the user to drag and nudge field boxes directly on the document canvas if they want to reposition them.
3. **Visual Verification:** Ensure field boxes fit directly over the underline rules without horizontal wrapping collision.
