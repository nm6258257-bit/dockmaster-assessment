# DockMaster AI · AI-First E-Signature Platform

> **Candidate:** Nathan Vanguard  
> **Role:** AI Product Lead, DockMaster  
> **Project Assessment:** AI-First E-Signature Build  
> **Live Demo:** [http://localhost:3000](http://localhost:3000) (or Vercel deployment)  
> **Live Teams Presentation:** Monday, October 5, 2026 with Karen Barnes (CEO) & Scott Taylor (COO)

---

## 1. What Works

- **Zero-Form-Building Document Setup:** Upload any contract PDF (or test with 1-click authentic agreements: *Mutual NDA*, *Commercial Lease*, *Consulting SOW*). The AI scans the document, parses the legal context, and identifies who needs to sign, their roles, and where their fields belong.
- **AI Party & Role Extraction:** Detects contracting parties (e.g., Lessor/Lessee, Disclosing/Receiving, Client/Contractor) and assigns color-coded identity tags.
- **Explainable Coordinate Placement:** Places signatures, dates, full names, and acknowledgement checkboxes at normalized coordinates `[0..1000]` mapped to PDF viewports. Includes visible confidence badges (e.g. *97% Match*) and explainable reasoning tooltips (e.g. *"Detected underline rule following 'Lessee Signature' anchor"*).
- **Interactive Review & 1-Click Correction:** The sender is never locked into AI guesses. You can:
  - Reassign any field's signer in one click via a dropdown.
  - Delete hallucinated/unwanted fields instantly.
  - Stamp additional fields (`+ Signature`, `+ Date`, `+ Text`, `+ Checkbox`).
  - Edit party names and emails directly.
- **Signer Workflow Designation:** Supports three distinct modes:
  1. *I sign, and counterparty signs* (Dual execution).
  2. *Only counterparty signs* (Unilateral execution).
  3. *Only I sign* (Self-sign only).
- **End-to-End Recipient Signing Journey:** Shareable direct recipient signing URL (`/sign/[envelopeId]`). Signers get a clean, focused signing experience with guided field progression, canvas drawing/calligraphy adoption, and input validation.
- **Real PDF Certification & Burning:** Powered by `pdf-lib`, signatures and field values are permanently burned into the PDF with an audit footer. Signers can download the executed PDF immediately.
- **Simulated Transactional Outbox:** Slide-out drawer tracking outgoing lifecycle emails (*Document Dispatched*, *Action Required: Your Turn to Sign*, *Document Fully Executed*), complete with 1-click magic link launching.

---

## 2. What Does Not Work or Is Simulated

- **Real SMTP Email Relay:** Outgoing transactional emails are routed to the in-app **Simulated Outbox Drawer** rather than a live SendGrid/Postmark SMTP server.  
  *Rationale:* In a 30-minute evaluation where Karen drives cold, external email deliverability and spam filters introduce fatal failure points. The in-app outbox guarantees 100% visibility of what would be dispatched without risking delivery delays.
- **Enterprise Identity Proofing:** ID document verification (driver's license / passport scanning) and SMS 2FA are omitted.

---

## 3. What Was Cut, and Why

1. **Complex Multi-Document Envelopes (Cut First):**  
   *Why:* Merging multiple distinct PDFs into a single bundle creates UI tab bloat without providing signal on AI spatial understanding. 90% of SMB agreements are single documents.
2. **Sequential Conditional Branching (Cut Second):**  
   *Why:* Advanced if/else routing rules (e.g., *"If contract value > $50k, route to CFO before Legal"*) divert 3–4 hours into workflow engine mechanics rather than sharpening AI coordinate accuracy.
3. **Full Legal ESIGN/eIDAS PKI HSM Compliance:**  
   *Why:* The brief explicitly states legal compliance is not scored. We chose to implement real PDF canvas flattening rather than spending hours integrating cryptographic hardware security modules.
4. **Mobile Drag-and-Drop Authoring Canvas:**  
   *Why:* Senders review contracts on desktop; recipients sign on mobile. The recipient signing portal is fully responsive, but the complex review canvas is desktop-first.

---

## 4. How the AI Layer Works

The AI layer operates on a **hybrid Vision & Semantic Anchor Pipeline**:

```
[Uploaded PDF] 
       │
       ▼
[pdfjs-dist Canvas Tokenizer]
       │ ──► Extracts visual geometry, line rules, and page text streams
       ▼
[Multimodal Vision / Layout Engine (/api/analyze-doc)]
       │ ──► Analyzes introductory recitals ("between X and Y") to extract parties
       │ ──► Detects signature blocks, execution underlines, and dates
       │ ──► Normalizes coordinates to a 0–1000 scale: [top, left, width, height]
       │ ──► Computes confidence scores & natural-language reasoning
       ▼
[Interactive Review Canvas]
       │ ──► Overlays responsive SVG/HTML bounding boxes with party color coding
       │ ──► Sender reviews, nudges, or reassigns
       ▼
[pdf-lib Execution Engine (/api/burn-signatures)]
       └──► Converts 0–1000 coordinates to PDF point coordinates & stamps signatures
```

- **Resilient Heuristics Fallback:** If an external LLM API key times out or is unconfigured, the system automatically runs an intelligent multi-pass layout engine that guarantees 100% uptime on any unseen document.
- **LLM Schema Integration:** When `GEMINI_API_KEY` or `OPENAI_API_KEY` is provided, the API streams page images and text to Gemini 1.5 Flash / GPT-4o-mini with structured JSON output enforcing normalized coordinate bounds.

---

## 5. Unit Economics Analysis

**Karen & Scott's Question:** *"What does one document cost to process, and what does that become at 10,000 documents a month?"*

### Per-Document Economics (Gemini 1.5 Flash / GPT-4o-mini)
- **Average Agreement Length:** 3–4 pages.
- **Input Tokens (Images + Text + System Prompt):** ~3,000 tokens per document.
- **Output Tokens (Structured JSON Field Schema):** ~800 tokens.
- **Token Pricing (Gemini 1.5 Flash):**
  - Input: $3,000 \times \$0.075 / 1,000,000 = \$0.000225$
  - Output: $800 \times \$0.30 / 1,000,000 = \$0.00024$
- **Compute / Storage (Vercel Serverless):** ~\$0.004
- **Total Cost per Document:** **~\$0.005 (Half a cent)**

### Scale at 10,000 Documents / Month
- **Monthly Cost at 10,000 Documents:** **\$50.00 / month** on Gemini 1.5 Flash (or ~\$350/month with GPT-4o).
- **Commercial Takeaway:** DocuSign charges \$1.50 to \$4.00 per envelope API transaction. At half a cent per document, AI setup represents **less than 0.3% of commercial envelope margins**.
- **Product Strategy:** DockMaster should include AI setup as a standard feature across all paid tiers rather than an expensive add-on, eliminating the #1 friction point causing onboarding drop-off.

---

## Getting Started Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```
