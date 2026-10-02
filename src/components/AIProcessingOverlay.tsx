'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Bot, Layers, Search, Cpu } from 'lucide-react';

interface AIProcessingOverlayProps {
  fileName: string;
  onComplete: () => void;
}

export const AIProcessingOverlay: React.FC<AIProcessingOverlayProps> = ({
  fileName,
  onComplete
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Search,
      title: 'Extracting Visual Anchors & Text Layout',
      desc: 'Scanning document geometry, underline rules, and signature clauses...'
    },
    {
      icon: Bot,
      title: 'Identifying Contracting Parties & Legal Roles',
      desc: 'Detecting lessor/lessee, disclosing/receiving, and required signatories...'
    },
    {
      icon: Cpu,
      title: 'Calculating Coordinate Bounds & Confidence Scores',
      desc: 'Placing signature, date, and text fields with explainable AI reasoning...'
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => onComplete(), 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(8, 12, 20, 0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated scanning line */}
        <div className="scanning-line" />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)'
        }}>
          <Sparkles size={32} color="#FFFFFF" />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
          AI Analyzing Document
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {fileName}
        </p>

        {/* Step List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > idx;
            const isCurrent = step === idx;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  border: `1px solid ${isCurrent ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isCurrent ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isCompleted ? '#10B981' : isCurrent ? '#60A5FA' : 'var(--text-muted)'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isCompleted || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginBottom: '2px'
                  }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
