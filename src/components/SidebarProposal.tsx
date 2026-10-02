'use client';

import React from 'react';
import { Party, DocumentField, SenderSigningMode } from '@/lib/types';
import {
  Sparkles,
  Users,
  Send,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';

interface SidebarProposalProps {
  parties: Party[];
  fields: DocumentField[];
  signingMode: SenderSigningMode;
  onSigningModeChange: (mode: SenderSigningMode) => void;
  onUpdateParty: (updated: Party) => void;
  onApproveAndSend: () => void;
  docSummary: string;
  confidenceScore: number;
}

export const SidebarProposal: React.FC<SidebarProposalProps> = ({
  parties,
  fields,
  signingMode,
  onSigningModeChange,
  onUpdateParty,
  onApproveAndSend,
  docSummary,
  confidenceScore
}) => {
  const senderParty = parties.find((p) => p.isSender) || parties[0];
  const recipientParties = parties.filter((p) => !p.isSender);

  return (
    <aside style={{
      width: '380px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* AI Proposal Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--purple)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Setup Proposal</h3>
          </div>
          <span className="badge badge-ai" style={{ fontSize: '11px' }}>
            {Math.round(confidenceScore * 100)}% Match
          </span>
        </div>

        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '16px'
        }}>
          {docSummary}
        </p>

        {/* Confidence pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '12px',
          color: '#34D399'
        }}>
          <ShieldCheck size={16} />
          <span>All required signature anchors verified</span>
        </div>
      </div>

      {/* Signer Designation Mode */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          marginBottom: '12px'
        }}>
          Signer Workflow
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: signingMode === 'self_and_others' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${signingMode === 'self_and_others' ? 'var(--primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <input
              type="radio"
              name="signingMode"
              checked={signingMode === 'self_and_others'}
              onChange={() => onSigningModeChange('self_and_others')}
            />
            <span>I sign, and counterparty signs</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: signingMode === 'others_only' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${signingMode === 'others_only' ? 'var(--primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <input
              type="radio"
              name="signingMode"
              checked={signingMode === 'others_only'}
              onChange={() => onSigningModeChange('others_only')}
            />
            <span>Only counterparty signs</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: signingMode === 'self_only' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${signingMode === 'self_only' ? 'var(--primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <input
              type="radio"
              name="signingMode"
              checked={signingMode === 'self_only'}
              onChange={() => onSigningModeChange('self_only')}
            />
            <span>Only I sign (Self-sign only)</span>
          </label>
        </div>
      </div>

      {/* Contracting Parties & Signatories */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)'
          }}>
            Identified Signatories ({parties.length})
          </div>
          <Users size={16} color="var(--text-muted)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {parties.map((party) => {
            const partyFields = fields.filter((f) => f.partyId === party.id);

            return (
              <div
                key={party.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: `1px solid ${party.color}40`,
                  borderLeft: `4px solid ${party.color}`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: party.color }}>
                    {party.role}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)'
                  }}>
                    {partyFields.length} field{partyFields.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={party.name}
                    onChange={(e) => onUpdateParty({ ...party, name: e.target.value })}
                    placeholder="Signer Name"
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  />
                  <input
                    type="email"
                    value={party.email}
                    onChange={(e) => onUpdateParty({ ...party, email: e.target.value })}
                    placeholder="Signer Email"
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve & Send CTA */}
      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
        <button
          onClick={onApproveAndSend}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <Send size={18} />
          <span>Approve & Send for Signature</span>
        </button>
      </div>
    </aside>
  );
};
