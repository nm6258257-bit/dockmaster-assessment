'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Envelope, DocumentField, Party } from '@/lib/types';
import { SignatureModal } from '@/components/SignatureModal';
import confetti from 'canvas-confetti';
import {
  FileSignature,
  Calendar,
  Type,
  CheckSquare,
  CheckCircle2,
  Download,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  ArrowLeft
} from 'lucide-react';

export default function SignPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const envelopeId = params.envelopeId as string;
  const partyParam = searchParams.get('party');

  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [activeSignFieldId, setActiveSignFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloadPdfUrl, setDownloadPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load envelope from localStorage
    const saved = localStorage.getItem(`dm_envelope_${envelopeId}`);
    if (saved) {
      try {
        const env: Envelope = JSON.parse(saved);
        setEnvelope(env);

        // Find party
        const targetParty = partyParam
          ? env.parties.find((p) => p.id === partyParam)
          : env.parties.find((p) => !p.isSender) || env.parties[0];

        setCurrentParty(targetParty || env.parties[0]);
        if (env.status === 'completed') {
          setIsCompleted(true);
          if (env.pdfBase64) {
            setDownloadPdfUrl(env.pdfBase64);
          }
        }
      } catch (e) {
        console.error('Error loading envelope:', e);
      }
    }
  }, [envelopeId, partyParam]);

  if (!envelope || !currentParty) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '15px' }}>Loading Secure Signing Portal...</p>
        </div>
      </div>
    );
  }

  const partyFields = envelope.fields.filter((f) => f.partyId === currentParty.id);
  const completedFieldsCount = partyFields.filter((f) => !!f.value).length;
  const allRequiredFilled = partyFields.every((f) => !f.required || !!f.value);

  const handleFieldChange = (fieldId: string, value: string) => {
    setEnvelope((prev) => {
      if (!prev) return null;
      const updatedFields = prev.fields.map((f) =>
        f.id === fieldId ? { ...f, value, signedAt: new Date().toISOString() } : f
      );
      const updatedEnv = { ...prev, fields: updatedFields };
      localStorage.setItem(`dm_envelope_${envelopeId}`, JSON.stringify(updatedEnv));
      return updatedEnv;
    });
  };

  const handleCompleteSigning = async () => {
    setIsSubmitting(true);

    try {
      // Burn signatures into PDF
      const res = await fetch('/api/burn-signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envelopeId: envelope.id,
          pdfBase64: envelope.pdfBase64,
          fields: envelope.fields,
          title: envelope.title,
          textByPage: envelope.textByPage,
          numPages: envelope.numPages
        })
      });

      const data = await res.json();
      if (data.success) {
        setDownloadPdfUrl(data.pdfBase64);
        setIsCompleted(true);

        // Update envelope status
        const completedEnv: Envelope = {
          ...envelope,
          status: 'completed',
          completedAt: new Date().toISOString(),
          pdfBase64: data.pdfBase64,
          auditEvents: [
            ...envelope.auditEvents,
            {
              id: `evt-${Date.now()}`,
              timestamp: new Date().toISOString(),
              event: 'Document Fully Signed & Certified',
              actor: currentParty.name,
              details: `All ${partyFields.length} required fields executed by ${currentParty.name} (${currentParty.role})`,
              badge: 'success'
            }
          ]
        };

        // Also add simulated completion email to outbox
        const emails = JSON.parse(localStorage.getItem('dm_simulated_emails') || '[]');
        emails.unshift({
          id: `email-${Date.now()}`,
          timestamp: new Date().toISOString(),
          to: envelope.parties.map((p) => p.email).join(', '),
          recipientName: 'All Parties',
          subject: `Completed: ${envelope.title} has been executed`,
          preview: `Both parties have executed ${envelope.title}. The tamper-evident completed PDF is attached.`,
          type: 'completed',
          envelopeId: envelope.id
        });
        localStorage.setItem('dm_simulated_emails', JSON.stringify(emails));
        localStorage.setItem(`dm_envelope_${envelopeId}`, JSON.stringify(completedEnv));

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Signing complete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExecutedPdf = () => {
    const rawTitle = envelope?.title || 'Commercial_Lease_Agreement';
    const cleanTitle = rawTitle.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Executed_${cleanTitle}.pdf`;
    const downloadUrl = `/api/download-pdf?envelopeId=${encodeURIComponent(envelopeId)}&title=${encodeURIComponent(cleanTitle)}`;

    // Pure HTTP GET download bypasses Chromium blob: UUID bugs
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 1000);
  };

  const triggerServerDownload = (filename?: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/download-pdf';
    form.target = '_self';

    const inputTitle = document.createElement('input');
    inputTitle.type = 'hidden';
    inputTitle.name = 'title';
    inputTitle.value = envelope?.title || 'Commercial_Lease_Agreement.pdf';
    form.appendChild(inputTitle);

    const inputPdf = document.createElement('input');
    inputPdf.type = 'hidden';
    inputPdf.name = 'pdfBase64';
    inputPdf.value = downloadPdfUrl || envelope?.pdfBase64 || '';
    form.appendChild(inputPdf);

    const inputFields = document.createElement('input');
    inputFields.type = 'hidden';
    inputFields.name = 'fields';
    inputFields.value = JSON.stringify(envelope?.fields || []);
    form.appendChild(inputFields);

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      try {
        document.body.removeChild(form);
      } catch {}
    }, 5000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/')}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Workspace</span>
          </button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              {envelope.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Signer: <strong style={{ color: currentParty.color }}>{currentParty.name}</strong> ({currentParty.role})
            </div>
          </div>
        </div>

        {/* Progress & Complete CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Fields Completed: <strong>{completedFieldsCount}</strong> of <strong>{partyFields.length}</strong>
          </div>

          {!isCompleted && (
            <button
              onClick={handleCompleteSigning}
              disabled={isSubmitting || !allRequiredFilled}
              className="btn btn-success"
              style={{
                padding: '10px 20px',
                opacity: allRequiredFilled ? 1 : 0.6,
                cursor: allRequiredFilled ? 'pointer' : 'not-allowed'
              }}
            >
              {isSubmitting ? (
                <span>Certifying Document...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Finish & Submit Signature</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '32px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {isCompleted ? (
          /* Completion State */
          <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={36} color="#FFFFFF" />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
              Document Executed Successfully
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 28px' }}>
              Your electronic signature has been permanently embedded and cryptographically stamped into the agreement.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              {(downloadPdfUrl || envelope?.pdfBase64 || isCompleted) && (
                <a
                  href={`/api/download-pdf?envelopeId=${encodeURIComponent(envelopeId)}&title=${encodeURIComponent((envelope?.title || 'Commercial_Lease_Agreement').replace(/\.pdf$/i, ''))}`}
                  download={`Executed_${(envelope?.title || 'Commercial_Lease_Agreement').replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <Download size={16} />
                  <span>Download Executed PDF</span>
                </a>
              )}
              <button
                onClick={() => router.push('/')}
                className="btn btn-secondary"
                style={{ padding: '12px 24px' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Signing Step Card */
          <>
            <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#10B981" />
                <span style={{ fontSize: '14px' }}>
                  Please fill all fields designated for <strong>{currentParty.role}</strong> below:
                </span>
              </div>
              <span className="badge badge-ai">Legally Binding</span>
            </div>

            {/* Fields List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {partyFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderLeft: `4px solid ${currentParty.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>
                        {field.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        (Page {field.page})
                      </span>
                    </div>

                    {field.value ? (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        Completed
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                        Required
                      </span>
                    )}
                  </div>

                  {/* Input controls based on field type */}
                  {field.type === 'signature' ? (
                    <div>
                      {field.value ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 18px',
                          background: '#FFFFFF',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          {field.value.startsWith('data:image') ? (
                            <img src={field.value} alt="Signature" style={{ height: '48px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{
                              fontFamily: '"Brush Script MT", cursive',
                              fontSize: '26px',
                              color: '#0F172A'
                            }}>
                              {field.value}
                            </span>
                          )}
                          <button
                            onClick={() => setActiveSignFieldId(field.id)}
                            className="btn btn-ghost"
                            style={{ fontSize: '12px', color: '#3B82F6' }}
                          >
                            Change Signature
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSignFieldId(field.id)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '16px' }}
                        >
                          <FileSignature size={18} />
                          <span>Click to Sign</span>
                        </button>
                      )}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '12px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <input
                        type="checkbox"
                        checked={field.value === 'true'}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked ? 'true' : '')}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: '13px' }}>
                        I confirm and agree to this provision
                      </span>
                    </label>
                  ) : field.type === 'date' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="date"
                        value={field.value || new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="form-input"
                        style={{ maxWidth: '240px' }}
                      />
                      <button
                        onClick={() => handleFieldChange(field.id, new Date().toISOString().split('T')[0])}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px' }}
                      >
                        Set to Today
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder="Type your name or required text"
                      className="form-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Signature Capture Modal */}
      {activeSignFieldId && (
        <SignatureModal
          signerName={currentParty.name}
          onConfirm={(signatureDataUrl) => {
            handleFieldChange(activeSignFieldId, signatureDataUrl);
            setActiveSignFieldId(null);
          }}
          onClose={() => setActiveSignFieldId(null)}
        />
      )}
    </div>
  );
}
