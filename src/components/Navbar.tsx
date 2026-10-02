'use client';

import React from 'react';
import { Sparkles, Mail, RotateCcw, ShieldCheck, FileText } from 'lucide-react';

interface NavbarProps {
  outboxCount: number;
  onOpenOutbox: () => void;
  onReset: () => void;
  hasActiveDoc: boolean;
  docTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  outboxCount,
  onOpenOutbox,
  onReset,
  hasActiveDoc,
  docTitle
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand & AI Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                DockMaster
              </span>
              <span className="badge badge-ai" style={{ fontSize: '10px', padding: '2px 8px' }}>
                AI Setup
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Next-Gen E-Signature Platform
            </div>
          </div>
        </div>

        {hasActiveDoc && docTitle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px'
          }}>
            <FileText size={14} color="var(--primary)" />
            <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {docTitle}
            </span>
          </div>
        )}
      </div>

      {/* Center status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '9999px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        fontSize: '12px',
        color: '#34D399'
      }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 8px #10B981'
        }} />
        <span>Evaluation Session Ready</span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {hasActiveDoc && (
          <button
            onClick={onReset}
            className="btn btn-ghost"
            style={{ fontSize: '13px', padding: '8px 12px' }}
            title="Upload a new document"
          >
            <RotateCcw size={15} />
            <span>New Document</span>
          </button>
        )}

        <button
          onClick={onOpenOutbox}
          className="btn btn-secondary"
          style={{ position: 'relative', fontSize: '13px' }}
        >
          <Mail size={16} />
          <span>Outbox / Notifications</span>
          {outboxCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
            }}>
              {outboxCount}
            </span>
          )}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          fontSize: '13px'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#3B82F6',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px'
          }}>
            KB
          </div>
          <span style={{ fontWeight: 600 }}>Karen Barnes</span>
        </div>
      </div>
    </header>
  );
};
