'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, CheckCircle2, Bot, Search, Cpu, Loader2, X, ArrowRight } from 'lucide-react';

interface AIProcessingOverlayProps {
  fileName: string;
  isReady?: boolean;
  onComplete: () => void;
}

export const AIProcessingOverlay: React.FC<AIProcessingOverlayProps> = ({
  fileName,
  isReady = false,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep callback reference updated without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Advance steps progressively while analyzing
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // When isReady becomes true, auto-transition after 500ms
  useEffect(() => {
    if (isReady) {
      setIsFinishing(true);
      setStep(3); // All complete

      const finishTimer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 500);

      return () => clearTimeout(finishTimer);
    }
  }, [isReady]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  return (
    <div
      onClick={(e) => {
        // If document is ready, clicking backdrop immediately dismisses
        if (isReady || isFinishing) {
          onComplete();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 12, 20, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Close Button always available */}
        <button
          onClick={onComplete}
          title="Close overlay"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {/* Animated scanning line that loops continuously */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #3B82F6, #8B5CF6, transparent)',
          animation: 'scanLine 2s ease-in-out infinite'
        }} />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: isFinishing
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: isFinishing
            ? '0 8px 30px rgba(16, 185, 129, 0.4)'
            : '0 8px 30px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.4s ease'
        }}>
          {isFinishing ? (
            <CheckCircle2 size={32} color="#FFFFFF" />
          ) : (
            <Sparkles size={32} color="#FFFFFF" />
          )}
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
          {isFinishing ? 'Document Ready!' : 'AI Analyzing Document'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          {fileName}
        </p>

        {/* Step List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          {[
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
          ].map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > idx || isFinishing;
            const isCurrent = step === idx && !isFinishing;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.06)'
                    : isCurrent
                    ? 'rgba(59, 130, 246, 0.08)'
                    : 'transparent',
                  border: `1px solid ${
                    isCompleted
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isCurrent
                      ? 'rgba(59, 130, 246, 0.35)'
                      : 'transparent'
                  }`,
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
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isCurrent
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isCompleted ? '#10B981' : isCurrent ? '#60A5FA' : 'var(--text-muted)'
                }}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
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

        {/* Looping Status or Open Button */}
        {isFinishing ? (
          <button
            onClick={onComplete}
            className="btn btn-primary"
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Open Document Workspace</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Loader2 size={14} className="animate-spin" color="#60A5FA" />
            <span>Processing visual layout & preparing interactive viewer...</span>
          </div>
        )}
      </div>
    </div>
  );
};
