import { AIAnalysisResponse, DocumentField, FieldType, Party } from './types';

// Palette for parties
export const PARTY_COLORS = [
  '#3B82F6', // Blue (Sender)
  '#10B981', // Emerald (Recipient 1)
  '#8B5CF6', // Purple (Recipient 2)
  '#F59E0B', // Amber (Recipient 3)
  '#EC4899', // Pink (Recipient 4)
];

/**
 * Normalizes bounding box values to guarantee they stay within 0..1000 coordinate space
 */
export function sanitizeBoundingBox(box: { top: number; left: number; width: number; height: number }) {
  const top = Math.max(0, Math.min(950, Math.round(box.top)));
  const left = Math.max(0, Math.min(950, Math.round(box.left)));
  const width = Math.max(40, Math.min(1000 - left, Math.round(box.width)));
  const height = Math.max(25, Math.min(1000 - top, Math.round(box.height)));
  return { top, left, width, height };
}

/**
 * Spatial Anchor Alignment Engine:
 * Analyzes document line geometry and anchors fields directly onto signature rules,
 * date lines, print name lines, and checkbox brackets [ ].
 */
export function alignFieldsToDocumentAnchors(
  rawFields: AIAnalysisResponse['fields'],
  textByPage: { page: number; text: string }[],
  parties: AIAnalysisResponse['parties']
): AIAnalysisResponse['fields'] {
  if (!textByPage || textByPage.length === 0) return rawFields;

  const alignedFields: AIAnalysisResponse['fields'] = [];

  // Group fields by page
  const pageMap = new Map<number, AIAnalysisResponse['fields']>();
  for (const f of rawFields) {
    const list = pageMap.get(f.page) || [];
    list.push(f);
    pageMap.set(f.page, list);
  }

  pageMap.forEach((fieldsOnPage, pageNum) => {
    const pageData = textByPage.find(p => p.page === pageNum);
    if (!pageData || !pageData.text.trim()) {
      alignedFields.push(...fieldsOnPage);
      return;
    }

    const lines = pageData.text.split(/\r?\n/).map(l => l.trimEnd());
    const totalLines = Math.max(lines.length, 1);

    // Compute vertical position helper for standard 880px document view (48px top padding, 22.4px line height)
    const getLineTop = (lineIdx: number) => {
      // In text simulation: Y = 48 + lineIdx * 22.4. Normalized to 1000 scale: (Y / 880) * 1000
      const yPx = 48 + lineIdx * 22.4;
      return Math.round((yPx / 880) * 1000);
    };

    // Find party sections in the lines
    const party1 = parties[0] || { id: 'party_1', role: 'Party 1' };
    const party2 = parties[1] || { id: 'party_2', role: 'Party 2' };

    let party1StartLine = -1;
    let party2StartLine = -1;

    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      // Party 1 keywords
      if (
        party1StartLine === -1 &&
        (lower.includes('lessor') ||
          lower.includes('landlord') ||
          lower.includes('disclosing') ||
          lower.includes('client') ||
          lower.includes('first party') ||
          (party1.suggestedName && lower.includes(party1.suggestedName.toLowerCase())))
      ) {
        party1StartLine = idx;
      }
      // Party 2 keywords
      if (
        party2StartLine === -1 &&
        (lower.includes('lessee') ||
          lower.includes('tenant') ||
          lower.includes('receiving') ||
          lower.includes('contractor') ||
          lower.includes('second party') ||
          (party2.suggestedName && lower.includes(party2.suggestedName.toLowerCase())))
      ) {
        party2StartLine = idx;
      }
    });

    // Check if this page has stacked or 2-column signature layout
    const isStacked = party1StartLine !== -1 && party2StartLine !== -1 && party1StartLine !== party2StartLine;

    // Check for checkbox line ([ ] or certification)
    let checkboxLineIdx = -1;
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        checkboxLineIdx === -1 &&
        (trimmed.startsWith('[ ]') ||
          trimmed.startsWith('[]') ||
          trimmed.startsWith('[X]') ||
          trimmed.includes('[ ]') ||
          trimmed.toLowerCase().includes('i certify') ||
          trimmed.toLowerCase().includes('insurance as required'))
      ) {
        checkboxLineIdx = idx;
      }
    });

    // Align each field on this page
    fieldsOnPage.forEach(field => {
      const isParty1 = field.partyId === party1.id;
      const isParty2 = field.partyId === party2.id;

      // 1. Checkbox field
      if (field.type === 'checkbox') {
        if (checkboxLineIdx !== -1) {
          const top = getLineTop(checkboxLineIdx) - 2;
          alignedFields.push({
            ...field,
            box: { top, left: 58, width: 26, height: 24 },
            confidence: 0.96,
            reasoning: `Anchored to execution acknowledgement bracket on line ${checkboxLineIdx + 1}`
          });
          return;
        }
      }

      // Determine search line boundaries
      let startSearch = 0;
      let endSearch = lines.length;

      if (isStacked) {
        if (isParty1) {
          startSearch = party1StartLine;
          endSearch = party2StartLine > party1StartLine ? party2StartLine : lines.length;
        } else if (isParty2) {
          startSearch = party2StartLine;
          endSearch = lines.length;
        }
      }

      // Search for specific field anchors within party boundary
      let targetLineIdx = -1;
      let anchorType = '';

      for (let i = startSearch; i < endSearch; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();

        if (field.type === 'signature') {
          if (lower.includes('signature:') || lower.includes('signature :') || lower.includes('by:') || lower.includes('by :') || (lower.includes('_____') && targetLineIdx === -1)) {
            targetLineIdx = i;
            anchorType = lower.includes('by:') ? 'by' : 'signature';
            break;
          }
        } else if (field.type === 'date') {
          if (lower.includes('date:') || lower.includes('date :') || lower.includes('dated:')) {
            targetLineIdx = i;
            anchorType = 'date';
            break;
          }
        } else if (field.type === 'text') {
          if (lower.includes('printed name:') || lower.includes('name:') || lower.includes('title:')) {
            targetLineIdx = i;
            anchorType = 'name';
            break;
          }
        }
      }

      // If we found an exact anchor line, calculate anchored coordinates
      if (targetLineIdx !== -1) {
        const top = getLineTop(targetLineIdx) - 2;
        let left = 140;
        let width = 300;
        const height = 24;

        if (anchorType === 'by') {
          left = 95;
          width = 330;
        } else if (anchorType === 'signature') {
          left = 180;
          width = 320;
        } else if (anchorType === 'date') {
          left = 135;
          width = 240;
        } else if (anchorType === 'name') {
          left = 210;
          width = 310;
        }

        alignedFields.push({
          ...field,
          box: sanitizeBoundingBox({ top, left, width, height }),
          confidence: 0.95,
          reasoning: `Aligned directly over '${lines[targetLineIdx].trim().substring(0, 30)}...' anchor on line ${targetLineIdx + 1}`
        });
      } else {
        // Fallback: keep sanitized original or standard offset
        alignedFields.push({
          ...field,
          box: sanitizeBoundingBox(field.box)
        });
      }
    });
  });

  return alignedFields;
}

/**
 * Heuristic fallback analyzer that extracts parties and signature fields
 * from raw document text with exact spatial anchoring.
 */
export function analyzeDocumentHeuristics(
  textByPage: { page: number; text: string }[],
  fileName: string
): AIAnalysisResponse {
  const fullText = textByPage.map(p => p.text).join('\n');
  const lowerFull = fullText.toLowerCase();

  // Detect document type
  let docType = 'Standard Agreement';
  if (lowerFull.includes('non-disclosure') || lowerFull.includes('confidentiality') || fileName.toLowerCase().includes('nda')) {
    docType = 'Non-Disclosure Agreement (NDA)';
  } else if (lowerFull.includes('lease') || lowerFull.includes('tenant') || lowerFull.includes('landlord')) {
    docType = 'Commercial Lease Agreement';
  } else if (lowerFull.includes('employment') || lowerFull.includes('offer letter')) {
    docType = 'Employment Offer Letter';
  } else if (lowerFull.includes('consulting') || lowerFull.includes('contractor') || lowerFull.includes('services agreement')) {
    docType = 'Consulting Services Agreement';
  } else if (lowerFull.includes('waiver') || lowerFull.includes('release')) {
    docType = 'Liability Waiver & Release';
  }

  // Detect Parties
  const parties: AIAnalysisResponse['parties'] = [];
  
  if (docType === 'Commercial Lease Agreement') {
    parties.push(
      { id: 'party_1', role: 'Landlord / Lessor', suggestedName: 'Harbor View Marina LLC', isSender: true },
      { id: 'party_2', role: 'Tenant / Lessee', suggestedName: 'Authorized Boat Owner', isSender: false }
    );
  } else if (docType === 'Non-Disclosure Agreement (NDA)') {
    parties.push(
      { id: 'party_1', role: 'Disclosing Party', suggestedName: 'DockMaster Inc.', isSender: true },
      { id: 'party_2', role: 'Receiving Party', suggestedName: 'Counterparty', isSender: false }
    );
  } else if (docType === 'Consulting Services Agreement') {
    parties.push(
      { id: 'party_1', role: 'Client', suggestedName: 'DockMaster Inc.', isSender: true },
      { id: 'party_2', role: 'Contractor', suggestedName: 'Mathan Modine AI Solutions', isSender: false }
    );
  } else {
    // General detection
    parties.push(
      { id: 'party_1', role: 'Originator / Sender', suggestedName: 'Sender', isSender: true },
      { id: 'party_2', role: 'Signer / Recipient', suggestedName: 'Recipient Signer', isSender: false }
    );
  }

  // Find signature page
  const totalPages = Math.max(1, textByPage.length);
  let targetSignPage = totalPages;

  // Scan backwards to find the page containing signature anchors
  for (let p = totalPages; p >= 1; p--) {
    const pageText = textByPage.find(item => item.page === p)?.text.toLowerCase() || '';
    if (pageText.includes('signature') || pageText.includes('in witness') || pageText.includes('accepted and agreed') || pageText.includes('by:')) {
      targetSignPage = p;
      break;
    }
  }

  const rawFields: AIAnalysisResponse['fields'] = [
    {
      page: targetSignPage,
      type: 'signature',
      partyId: 'party_1',
      box: { top: 156, left: 180, width: 320, height: 35 },
      label: `Signature of ${parties[0].role}`,
      confidence: 0.95,
      reasoning: 'Primary signatory authorization anchor'
    },
    {
      page: targetSignPage,
      type: 'date',
      partyId: 'party_1',
      box: { top: 182, left: 135, width: 240, height: 32 },
      label: `Date of ${parties[0].role}`,
      confidence: 0.95,
      reasoning: 'Execution date line for primary signatory'
    },
    {
      page: targetSignPage,
      type: 'text',
      partyId: 'party_1',
      box: { top: 207, left: 210, width: 310, height: 32 },
      label: `Printed Name of ${parties[0].role}`,
      confidence: 0.92,
      reasoning: 'Authorized signatory printed legal name'
    },
    {
      page: targetSignPage,
      type: 'signature',
      partyId: 'party_2',
      box: { top: 284, left: 180, width: 320, height: 35 },
      label: `Signature of ${parties[1].role}`,
      confidence: 0.95,
      reasoning: 'Counterparty acceptance signature line'
    },
    {
      page: targetSignPage,
      type: 'date',
      partyId: 'party_2',
      box: { top: 309, left: 135, width: 240, height: 32 },
      label: `Date of ${parties[1].role}`,
      confidence: 0.95,
      reasoning: 'Execution date for counterparty'
    },
    {
      page: targetSignPage,
      type: 'text',
      partyId: 'party_2',
      box: { top: 335, left: 210, width: 310, height: 32 },
      label: `Printed Name of ${parties[1].role}`,
      confidence: 0.92,
      reasoning: 'Counterparty printed legal name'
    }
  ];

  if (lowerFull.includes('acknowledge') || lowerFull.includes('certif') || lowerFull.includes('insurance') || lowerFull.includes('[ ]')) {
    rawFields.unshift({
      page: targetSignPage,
      type: 'checkbox',
      partyId: 'party_2',
      box: { top: 80, left: 45, width: 32, height: 28 },
      label: 'Acknowledgement & Insurance Certification',
      confidence: 0.96,
      reasoning: 'Pre-signature acknowledgement checkbox'
    });
  }

  // Run spatial anchor alignment to snap each box to actual document lines
  const alignedFields = alignFieldsToDocumentAnchors(rawFields, textByPage, parties);

  return {
    parties,
    fields: alignedFields,
    summary: `Analyzed ${fileName} (${totalPages} page${totalPages > 1 ? 's' : ''}). Detected ${docType} with ${parties.length} executing parties and ${alignedFields.length} required field anchors.`,
    confidenceOverall: 0.94,
    detectedDocType: docType
  };
}
