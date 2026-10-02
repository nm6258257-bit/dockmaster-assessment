'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Eraser, Check, X } from 'lucide-react';

interface SignatureModalProps {
  signerName: string;
  onConfirm: (signatureDataUrl: string) => void;
  onClose: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  signerName,
  onConfirm,
  onClose
}) => {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(signerName || 'Authorized Signatory');
  const [fontStyle, setFontStyle] = useState<'cursive1' | 'cursive2'>('cursive1');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [tab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleAdopt = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('Please draw your signature first.');
        return;
      }
      onConfirm(canvas.toDataURL('image/png'));
    } else {
      // Create offscreen canvas to render stylized script text
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 120;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.font = 'italic 38px "Brush Script MT", "Caveat", "Segoe Script", cursive';
        ctx.fillText(typedName, 20, 70);
        onConfirm(offscreen.toDataURL('image/png'));
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Adopt Your Signature</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Legally bind your acceptance to this document
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switch: Draw vs Type */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-elevated)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setTab('draw')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'draw' ? 'var(--primary)' : 'transparent',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <PenTool size={15} />
            <span>Draw Signature</span>
          </button>
          <button
            onClick={() => setTab('type')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'type' ? 'var(--primary)' : 'transparent',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Type size={15} />
            <span>Type Signature</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'draw' ? (
          <div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              height: '160px',
              position: 'relative'
            }}>
              <canvas
                ref={canvasRef}
                width={520}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '100%', cursor: 'crosshair', borderRadius: 'var(--radius-md)' }}
              />
              {!hasDrawn && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  color: '#94A3B8',
                  fontSize: '14px'
                }}>
                  Sign here using your mouse, trackpad, or finger
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={clearCanvas} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                <Eraser size={14} />
                <span>Clear Canvas</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Your full legal name"
              className="form-input"
              style={{ marginBottom: '16px' }}
            />

            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              fontFamily: '"Brush Script MT", "Caveat", cursive',
              fontSize: '32px'
            }}>
              {typedName || 'Your Signature'}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            onClick={handleAdopt}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px' }}
          >
            <Check size={16} />
            <span>Adopt and Apply Signature</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '12px 20px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
