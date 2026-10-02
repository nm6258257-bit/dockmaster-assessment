export type FieldType = 'signature' | 'text' | 'date' | 'checkbox' | 'radio';

export interface BoundingBox {
  top: number;    // 0 to 1000 normalized coordinate
  left: number;   // 0 to 1000 normalized coordinate
  width: number;  // 0 to 1000 normalized coordinate
  height: number; // 0 to 1000 normalized coordinate
}

export interface Party {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  isSender: boolean;
  status: 'pending' | 'signed';
}

export interface DocumentField {
  id: string;
  partyId: string;
  type: FieldType;
  page: number; // 1-indexed
  box: BoundingBox;
  label: string;
  confidence: number; // 0.0 to 1.0
  reasoning?: string;
  required: boolean;
  value?: string;
  signedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details: string;
  badge?: 'info' | 'success' | 'warning';
}

export interface SimulatedEmail {
  id: string;
  timestamp: string;
  to: string;
  recipientName: string;
  subject: string;
  preview: string;
  type: 'sent' | 'sign_turn' | 'completed';
  envelopeId: string;
  actionUrl?: string;
  read?: boolean;
}

export type SenderSigningMode = 'self_and_others' | 'others_only' | 'self_only';

export interface Envelope {
  id: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'ready_for_review' | 'sent' | 'completed';
  parties: Party[];
  fields: DocumentField[];
  pdfFileName: string;
  pdfBase64?: string;
  numPages: number;
  auditEvents: AuditEvent[];
  senderSigningMode: SenderSigningMode;
  completedAt?: string;
}

export interface AIAnalysisResponse {
  parties: {
    id: string;
    role: string;
    suggestedName?: string;
    isSender: boolean;
  }[];
  fields: {
    page: number;
    type: FieldType;
    partyId: string;
    box: BoundingBox;
    label: string;
    confidence: number;
    reasoning: string;
  }[];
  summary: string;
  confidenceOverall: number;
  detectedDocType: string;
}
