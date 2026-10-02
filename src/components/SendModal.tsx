'use client';

import React, { useState } from 'react';
import { Envelope, Party } from '@/lib/types';
import {
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';

interface SendModalProps {
  envelope: Envelope;
  onClose: () => void;
  onOpenRecipientSigning: (partyId: string) => void;
}

export const SendModal: React.FC<SendModalProps> = ({
  envelope,
  onClose,
  onOpenRecipientSigning
}) => {
  const [copied, setCopied] = useState(false);
  const recipient = envelope.parties.find((p) => !p.isSender) || envelope.parties[0];
  const signUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/sign/${envelope.id}?party=${recipient.id}`
    : `/sign/${envelope.id}?party=${recipient.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(signUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={24} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Envelope Ready & Sent</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                AI field layout locked · Outbox notifications dispatched
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Recipients list */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Signing Parties
          </div>
          {envelope.parties.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: p.color
                }} />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>({p.role})</span>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                Pending Signature
              </span>
            </div>
          ))}
        </div>

        {/* Direct Link Share */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Recipient Live Signing Link (Test Cold in Private Browser):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={signUrl}
              className="form-input"
              style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            />
            <button onClick={copyLink} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              <Copy size={15} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onOpenRecipientSigning(recipient.id)}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px' }}
          >
            <ExternalLink size={16} />
            <span>Launch Recipient Signing Portal</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
