'use client';

import React from 'react';
import { SimulatedEmail } from '@/lib/types';
import { Mail, Clock, Send, CheckCircle2, ExternalLink, X } from 'lucide-react';

interface OutboxDrawerProps {
  emails: SimulatedEmail[];
  isOpen: boolean;
  onClose: () => void;
  onOpenActionUrl: (url: string) => void;
}

export const OutboxDrawer: React.FC<OutboxDrawerProps> = ({
  emails,
  isOpen,
  onClose,
  onOpenActionUrl
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 90,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 0.25s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Simulated Outbox & Logs</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* List of transactional emails */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>No outgoing emails dispatched yet.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Approve and send a document to trigger notifications.
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${
                    email.type === 'completed'
                      ? 'badge-success'
                      : email.type === 'sign_turn'
                      ? 'badge-ai'
                      : 'badge-warning'
                  }`} style={{ fontSize: '10px' }}>
                    {email.type === 'completed' ? 'Completed' : email.type === 'sign_turn' ? 'Action Required' : 'Sent'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    To: <strong style={{ color: 'var(--text-secondary)' }}>{email.recipientName}</strong> &lt;{email.to}&gt;
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                    {email.subject}
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  padding: '10px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {email.preview}
                </div>

                {email.actionUrl && (
                  <button
                    onClick={() => onOpenActionUrl(email.actionUrl!)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                  >
                    <ExternalLink size={13} />
                    <span>Open Signing Portal from Email</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
