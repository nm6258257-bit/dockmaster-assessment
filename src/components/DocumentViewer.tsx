'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DocumentField, Party } from '@/lib/types';
import {
  FileSignature,
  Calendar,
  Type,
  CheckSquare,
  Trash2,
  UserCheck,
  ChevronDown,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';

interface DocumentViewerProps {
  pdfBase64?: string;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  fields: DocumentField[];
  parties: Party[];
  textByPage: { page: number; text: string }[];
  onUpdateField: (updated: DocumentField) => void;
  onDeleteField: (fieldId: string) => void;
  onAddField: (page: number, type: DocumentField['type'], partyId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pdfBase64,
  numPages,
  currentPage,
  onPageChange,
  fields,
  parties,
  textByPage,
  onUpdateField,
  onDeleteField,
  onAddField
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);
  const [dragState, setDragState] = useState<{
    fieldId: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragState.startX) / rect.width) * 1000;
    const deltaY = ((e.clientY - dragState.startY) / rect.height) * 1000;

    const newLeft = Math.max(0, Math.min(950, Math.round(dragState.startLeft + deltaX)));
    const newTop = Math.max(0, Math.min(950, Math.round(dragState.startTop + deltaY)));

    const field = fields.find((f) => f.id === dragState.fieldId);
    if (field) {
      onUpdateField({
        ...field,
        box: {
          ...field.box,
          left: newLeft,
          top: newTop
        }
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  // Render PDF page on canvas if pdfBase64 is present
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfBase64 || !canvasRef.current) return;

      try {
        setRenderError(false);
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes.buffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.warn('Canvas render error, falling back to simulated document view:', err);
        setRenderError(true);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfBase64, currentPage]);

  const currentPageFields = fields.filter((f) => f.page === currentPage);
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const getParty = (partyId: string) => parties.find((p) => p.id === partyId) || parties[0];

  const getFieldIcon = (type: DocumentField['type']) => {
    switch (type) {
      case 'signature':
        return <FileSignature size={13} />;
      case 'date':
        return <Calendar size={13} />;
      case 'text':
        return <Type size={13} />;
      case 'checkbox':
        return <CheckSquare size={13} />;
      default:
        return <FileSignature size={13} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Page selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            Previous
          </button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{numPages}</strong>
          </span>
          <button
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            Next
          </button>
        </div>

        {/* Quick Add Field Stamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>
            + Add Field:
          </span>
          <button
            onClick={() => onAddField(currentPage, 'signature', parties[1]?.id || parties[0]?.id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <FileSignature size={14} />
            <span>Signature</span>
          </button>
          <button
            onClick={() => onAddField(currentPage, 'date', parties[1]?.id || parties[0]?.id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Calendar size={14} />
            <span>Date</span>
          </button>
          <button
            onClick={() => onAddField(currentPage, 'text', parties[1]?.id || parties[0]?.id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Type size={14} />
            <span>Text</span>
          </button>
          <button
            onClick={() => onAddField(currentPage, 'checkbox', parties[1]?.id || parties[0]?.id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <CheckSquare size={14} />
            <span>Check</span>
          </button>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
            className="btn btn-ghost"
            style={{ padding: '6px' }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
            className="btn btn-ghost"
            style={{ padding: '6px' }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Main Document Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '24px',
          background: 'rgba(5, 8, 15, 0.7)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'relative',
            width: `${680 * zoom}px`,
            minHeight: `${880 * zoom}px`,
            background: '#FFFFFF',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            color: '#1E293B',
            transformOrigin: 'top center',
            transition: 'width 0.15s ease, min-height 0.15s ease',
            userSelect: dragState ? 'none' : 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedFieldId(null);
            }
          }}
        >
          {/* Real PDF Canvas (rendered via pdfjs-dist) */}
          {pdfBase64 && !renderError ? (
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '4px'
              }}
            />
          ) : (
            /* Document Text Simulation View */
            <div style={{
              padding: '48px 40px',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#0F172A',
              whiteSpace: 'pre-wrap'
            }}>
              {textByPage.find((p) => p.page === currentPage)?.text ||
                'Document Content Page ' + currentPage}
            </div>
          )}

          {/* Interactive AI Field Overlays */}
          {currentPageFields.map((field) => {
            const party = getParty(field.partyId);
            const isSelected = field.id === selectedFieldId;
            const isDraggingThis = dragState?.fieldId === field.id;

            // Map 0..1000 coordinate space to percentage
            const topPct = field.box.top / 10;
            const leftPct = field.box.left / 10;
            const widthPct = field.box.width / 10;
            const heightPct = field.box.height / 10;

            return (
              <div
                key={field.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedFieldId(field.id);
                  setDragState({
                    fieldId: field.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    startLeft: field.box.left,
                    startTop: field.box.top
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFieldId(field.id);
                }}
                className={`field-box ${isSelected ? 'active' : ''}`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  minHeight: `${heightPct}%`,
                  backgroundColor: isSelected
                    ? `${party.color}25`
                    : `${party.color}15`,
                  border: `2px solid ${party.color}`,
                  color: party.color,
                  cursor: isDraggingThis ? 'grabbing' : 'grab',
                  boxShadow: isDraggingThis ? `0 8px 24px ${party.color}50` : undefined,
                  zIndex: isDraggingThis ? 40 : (isSelected ? 30 : 20)
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  {getFieldIcon(field.type)}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}>
                    {field.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {field.confidence >= 0.9 ? (
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#059669',
                      fontWeight: 700
                    }}>
                      {Math.round(field.confidence * 100)}%
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#D97706',
                      fontWeight: 700
                    }}>
                      Review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Field Quick Inspector Drawer (Instant Correction) */}
      {selectedField && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          animation: 'modalEnter 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <span className="badge badge-ai" style={{ fontSize: '10px' }}>
                AI Placement
              </span>
              <span>{selectedField.label}</span>
            </div>

            {/* Reassign Party */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned to:</span>
              <select
                value={selectedField.partyId}
                onChange={(e) => {
                  onUpdateField({ ...selectedField, partyId: e.target.value });
                }}
                className="form-input"
                style={{ padding: '4px 10px', fontSize: '12px', width: 'auto' }}
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.role} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            {/* AI Reasoning explanation */}
            {selectedField.reasoning && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <Sparkles size={14} color="var(--purple)" />
                <span>{selectedField.reasoning}</span>
              </div>
            )}
          </div>

          {/* Delete field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                onDeleteField(selectedField.id);
                setSelectedFieldId(null);
              }}
              className="btn btn-ghost"
              style={{ color: '#EF4444', padding: '6px 12px', fontSize: '12px' }}
            >
              <Trash2 size={14} />
              <span>Remove Field</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
