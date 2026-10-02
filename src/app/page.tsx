'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadZone } from '@/components/UploadZone';
import { AIProcessingOverlay } from '@/components/AIProcessingOverlay';
import { DocumentViewer } from '@/components/DocumentViewer';
import { SidebarProposal } from '@/components/SidebarProposal';
import { SendModal } from '@/components/SendModal';
import { OutboxDrawer } from '@/components/OutboxDrawer';
import { SampleDoc } from '@/lib/sample-docs';
import { Envelope, DocumentField, Party, SimulatedEmail, SenderSigningMode } from '@/lib/types';
import { PARTY_COLORS } from '@/lib/ai-analyzer';
import { createPdfFromPages } from '@/lib/pdf-generator';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // Workflow state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingFileName, setAnalyzingFileName] = useState('');
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [docSummary, setDocSummary] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(0.94);
  const [textByPage, setTextByPage] = useState<{ page: number; text: string }[]>([]);

  // Modals & Drawers
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);

  // Load any stored emails from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('dm_simulated_emails');
    if (savedEmails) {
      try {
        setSimulatedEmails(JSON.parse(savedEmails));
      } catch (e) {
        console.error('Error loading emails:', e);
      }
    }
  }, []);

  const handleStartAnalysis = async (docData: {
    fileName: string;
    pdfBase64?: string;
    textByPage: { page: number; text: string }[];
    numPages: number;
  }) => {
    setAnalyzingFileName(docData.fileName);
    setIsAnalyzing(true);
    setTextByPage(docData.textByPage);

    try {
      const res = await fetch('/api/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: docData.fileName,
          textByPage: docData.textByPage
        })
      });

      const json = await res.json();
      const analysis = json.analysis;

      // Assign colors to parties
      const formattedParties: Party[] = analysis.parties.map((p: any, idx: number) => ({
        id: p.id,
        name: p.suggestedName || (p.isSender ? 'Karen Barnes (CEO)' : 'Counterparty Signer'),
        email: p.isSender ? 'karen.barnes@aspiresoftware.com' : 'recipient@example.com',
        role: p.role,
        color: PARTY_COLORS[idx % PARTY_COLORS.length],
        isSender: p.isSender,
        status: 'pending'
      }));

      // Format fields
      const formattedFields: DocumentField[] = analysis.fields.map((f: any, idx: number) => ({
        id: `field_${Date.now()}_${idx}`,
        partyId: f.partyId,
        type: f.type,
        page: f.page,
        box: f.box,
        label: f.label,
        confidence: f.confidence,
        reasoning: f.reasoning,
        required: true
      }));

      const newEnvelope: Envelope = {
        id: `env_${Date.now()}`,
        title: docData.fileName.replace('.pdf', ''),
        createdAt: new Date().toISOString(),
        status: 'ready_for_review',
        parties: formattedParties,
        fields: formattedFields,
        pdfFileName: docData.fileName,
        pdfBase64: docData.pdfBase64,
        textByPage: docData.textByPage,
        numPages: docData.numPages,
        auditEvents: [
          {
            id: `evt_1`,
            timestamp: new Date().toISOString(),
            event: 'Document Ingested & Analyzed by AI',
            actor: 'DockMaster Vision AI',
            details: `Detected ${formattedParties.length} parties and placed ${formattedFields.length} field anchors.`
          }
        ],
        senderSigningMode: 'self_and_others'
      };

      setEnvelope(newEnvelope);
      setDocSummary(analysis.summary);
      setConfidenceScore(analysis.confidenceOverall);
      setCurrentPage(1);

      // Persist to localStorage
      localStorage.setItem(`dm_envelope_${newEnvelope.id}`, JSON.stringify(newEnvelope));
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  const handleSelectSample = async (sample: SampleDoc) => {
    try {
      // Synthesize authentic vector PDF from sample pages
      const pdfBase64 = await createPdfFromPages(sample.name, sample.textByPage);
      handleStartAnalysis({
        fileName: sample.name,
        textByPage: sample.textByPage,
        numPages: sample.pages,
        pdfBase64
      });
    } catch (e) {
      console.error('Failed to pre-render sample PDF, falling back to text:', e);
      handleStartAnalysis({
        fileName: sample.name,
        textByPage: sample.textByPage,
        numPages: sample.pages
      });
    }
  };

  // Field manipulation
  const handleUpdateField = (updated: DocumentField) => {
    if (!envelope) return;
    const updatedFields = envelope.fields.map((f) => (f.id === updated.id ? updated : f));
    const updatedEnv = { ...envelope, fields: updatedFields };
    setEnvelope(updatedEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(updatedEnv));
  };

  const handleDeleteField = (fieldId: string) => {
    if (!envelope) return;
    const updatedFields = envelope.fields.filter((f) => f.id !== fieldId);
    const updatedEnv = { ...envelope, fields: updatedFields };
    setEnvelope(updatedEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(updatedEnv));
  };

  const handleAddField = (page: number, type: DocumentField['type'], partyId: string) => {
    if (!envelope) return;
    const party = envelope.parties.find((p) => p.id === partyId) || envelope.parties[0];
    const newField: DocumentField = {
      id: `field_${Date.now()}`,
      partyId: party.id,
      type,
      page,
      box: { top: 600, left: 200, width: 280, height: 45 },
      label: `${party.role} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      confidence: 1.0,
      reasoning: 'Manually added by sender',
      required: true
    };
    const updatedEnv = { ...envelope, fields: [...envelope.fields, newField] };
    setEnvelope(updatedEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(updatedEnv));
  };

  const handleUpdateParty = (updated: Party) => {
    if (!envelope) return;
    const updatedParties = envelope.parties.map((p) => (p.id === updated.id ? updated : p));
    const updatedEnv = { ...envelope, parties: updatedParties };
    setEnvelope(updatedEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(updatedEnv));
  };

  const handleSigningModeChange = (mode: SenderSigningMode) => {
    if (!envelope) return;
    const updatedEnv = { ...envelope, senderSigningMode: mode };
    setEnvelope(updatedEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(updatedEnv));
  };

  // Approve & Send
  const handleApproveAndSend = () => {
    if (!envelope) return;

    const recipient = envelope.parties.find((p) => !p.isSender) || envelope.parties[0];
    const signUrl = `${window.location.origin}/sign/${envelope.id}?party=${recipient.id}`;

    // Create simulated outgoing transactional emails
    const newEmails: SimulatedEmail[] = [
      {
        id: `email_${Date.now()}_1`,
        timestamp: new Date().toISOString(),
        to: recipient.email,
        recipientName: recipient.name,
        subject: `Action Required: Please sign ${envelope.title}`,
        preview: `Karen Barnes has prepared ${envelope.title} for your signature. All required fields have been mapped.`,
        type: 'sign_turn',
        envelopeId: envelope.id,
        actionUrl: signUrl
      },
      {
        id: `email_${Date.now()}_2`,
        timestamp: new Date().toISOString(),
        to: 'karen.barnes@aspiresoftware.com',
        recipientName: 'Karen Barnes',
        subject: `Sent: ${envelope.title} dispatched to ${recipient.name}`,
        preview: `Your agreement was sent for signature. You will be notified the moment ${recipient.name} signs.`,
        type: 'sent',
        envelopeId: envelope.id
      }
    ];

    const updatedEmails = [...newEmails, ...simulatedEmails];
    setSimulatedEmails(updatedEmails);
    localStorage.setItem('dm_simulated_emails', JSON.stringify(updatedEmails));

    // Update envelope state
    const sentEnv: Envelope = {
      ...envelope,
      status: 'sent',
      auditEvents: [
        ...envelope.auditEvents,
        {
          id: `evt_${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: 'Envelope Approved & Sent',
          actor: 'Karen Barnes (Sender)',
          details: `Dispatched signature requests to ${recipient.email}.`
        }
      ]
    };
    setEnvelope(sentEnv);
    localStorage.setItem(`dm_envelope_${envelope.id}`, JSON.stringify(sentEnv));

    setIsSendModalOpen(true);
  };

  const handleReset = () => {
    setEnvelope(null);
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        outboxCount={simulatedEmails.length}
        onOpenOutbox={() => setIsOutboxOpen(true)}
        onReset={handleReset}
        hasActiveDoc={!!envelope}
        docTitle={envelope?.title}
      />

      {isAnalyzing && (
        <AIProcessingOverlay
          fileName={analyzingFileName}
          onComplete={() => setIsAnalyzing(false)}
        />
      )}

      {!envelope ? (
        <UploadZone
          onFileLoaded={handleStartAnalysis}
          onSelectSample={handleSelectSample}
        />
      ) : (
        /* Split-screen Document Review Canvas */
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '24px',
          padding: '20px 28px',
          height: 'calc(100vh - 72px)',
          overflow: 'hidden'
        }}>
          {/* Left / Center: Interactive PDF Document Viewer */}
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            <DocumentViewer
              pdfBase64={envelope.pdfBase64}
              numPages={envelope.numPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              fields={envelope.fields}
              parties={envelope.parties}
              textByPage={textByPage}
              onUpdateField={handleUpdateField}
              onDeleteField={handleDeleteField}
              onAddField={handleAddField}
            />
          </div>

          {/* Right: AI Proposal & Setup Review Sidebar */}
          <SidebarProposal
            parties={envelope.parties}
            fields={envelope.fields}
            signingMode={envelope.senderSigningMode}
            onSigningModeChange={handleSigningModeChange}
            onUpdateParty={handleUpdateParty}
            onApproveAndSend={handleApproveAndSend}
            docSummary={docSummary}
            confidenceScore={confidenceScore}
          />
        </div>
      )}

      {/* Send Confirmation Modal */}
      {isSendModalOpen && envelope && (
        <SendModal
          envelope={envelope}
          onClose={() => setIsSendModalOpen(false)}
          onOpenRecipientSigning={(partyId) => {
            setIsSendModalOpen(false);
            router.push(`/sign/${envelope.id}?party=${partyId}`);
          }}
        />
      )}

      {/* Outbox Drawer */}
      <OutboxDrawer
        emails={simulatedEmails}
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        onOpenActionUrl={(url) => {
          setIsOutboxOpen(false);
          window.location.href = url;
        }}
      />
    </div>
  );
}
