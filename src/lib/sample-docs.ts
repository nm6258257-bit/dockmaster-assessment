export interface SampleDoc {
  id: string;
  name: string;
  type: string;
  pages: number;
  description: string;
  partiesCount: number;
  textByPage: { page: number; text: string }[];
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-nda',
    name: 'Standard_Mutual_NDA.pdf',
    type: 'Non-Disclosure Agreement',
    pages: 2,
    description: 'Mutual confidentiality agreement with dual signature blocks for Disclosing and Receiving parties.',
    partiesCount: 2,
    textByPage: [
      {
        page: 1,
        text: `MUTUAL NON-DISCLOSURE AGREEMENT
This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of October 1, 2026, by and between DockMaster Inc., a Delaware corporation ("Disclosing Party"), and the undersigned Counterparty ("Receiving Party").
1. Purpose: The parties wish to explore a potential business relationship concerning AI software integrations.
2. Confidential Information: All proprietary technical and commercial data disclosed by either party shall be treated with strict confidentiality.
3. Term: The obligations shall remain in effect for three (3) years from the effective date.`
      },
      {
        page: 2,
        text: `4. Governing Law: This Agreement shall be construed in accordance with the laws of the State of Delaware.
IN WITNESS WHEREOF, the parties hereto have executed this Mutual Non-Disclosure Agreement as of the date first set forth above.

DISCLOSING PARTY: DockMaster Inc.
By: _______________________________
Name: Karen Barnes
Title: Chief Executive Officer
Date: _____________________________

RECEIVING PARTY: Counterparty
By: _______________________________
Name: _____________________________
Title: Authorized Signatory
Date: _____________________________`
      }
    ]
  },
  {
    id: 'sample-lease',
    name: 'Commercial_Lease_Agreement.pdf',
    type: 'Commercial Lease',
    pages: 3,
    description: 'Marina slip and commercial storage lease between DockMaster Marina Services and Lessee.',
    partiesCount: 2,
    textByPage: [
      {
        page: 1,
        text: `COMMERCIAL MARINA SLIP LEASE AGREEMENT
THIS LEASE AGREEMENT is made between Harbor View Marina LLC ("Landlord / Lessor") and the tenant identified herein ("Tenant / Lessee").
Premises: Dock Slip #42B, North Basin Marina.
Term: 12 months commencing November 1, 2026.
Monthly Rent: $2,450.00 due on the first day of each calendar month.`
      },
      {
        page: 2,
        text: `Rules & Regulations:
1. Lessee must maintain vessel insurance covering minimum liability of $1,000,000.
2. Hazardous waste disposal must strictly comply with state environmental statutes.
3. Quiet hours in marina waters begin at 10:00 PM.`
      },
      {
        page: 3,
        text: `ACKNOWLEDGEMENT & EXECUTION:
[ ] I certify that my vessel carries valid hull and liability insurance as required.

LESSOR: Harbor View Marina LLC
Signature: _________________________
Date: ______________________________
Printed Name: Scott Taylor, Operations Director

LESSEE: Authorized Boat Owner
Signature: _________________________
Date: ______________________________
Printed Name: ______________________`
      }
    ]
  },
  {
    id: 'sample-consulting',
    name: 'AI_Consulting_Services_SOW.pdf',
    type: 'Consulting Services Agreement',
    pages: 2,
    description: 'Statement of Work for enterprise AI workflow automation and systems architecture.',
    partiesCount: 2,
    textByPage: [
      {
        page: 1,
        text: `STATEMENT OF WORK: AI PIPELINE INTEGRATION
Client: DockMaster Inc.
Contractor: Mathan Modine AI Solutions
Scope: Deliver automated document parsing and e-signature intelligence pipeline.
Milestone 1: Prototype delivery and validation test by October 4, 2026.`
      },
      {
        page: 2,
        text: `FEES & ACCEPTANCE:
Total Project Fee: $18,500 USD payable upon milestone verification.

ACCEPTED AND AGREED:
CLIENT: DockMaster Inc.
By: _______________________________
Name: Karen Barnes, CEO
Date: _____________________________

CONTRACTOR: Mathan Modine AI Solutions
By: _______________________________
Name: Mathan M.
Date: _____________________________`
      }
    ]
  }
];
