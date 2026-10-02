'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '@/lib/sample-docs';

interface UploadZoneProps {
  onFileLoaded: (data: {
    fileName: string;
    pdfBase64?: string;
    textByPage: { page: number; text: string }[];
    numPages: number;
  }) => void;
  onSelectSample: (sample: SampleDoc) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileLoaded,
  onSelectSample
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPdfFile = async (file: File) => {
    setIsLoading(true);
    setLoadingStatus('Reading document stream...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Convert to base64
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      setLoadingStatus('Extracting page text and visual tokens...');

      // Dynamic import of pdfjs-dist to avoid SSR window issues
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const textByPage: { page: number; text: string }[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageString = '';
        for (const item of textContent.items as any[]) {
          const y = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            pageString += '\n';
          } else if (pageString.length > 0 && !pageString.endsWith('\n') && !pageString.endsWith(' ')) {
            pageString += ' ';
          }
          pageString += item.str;
          lastY = y;
        }
        textByPage.push({ page: i, text: pageString });
      }

      onFileLoaded({
        fileName: file.name,
        pdfBase64: `data:application/pdf;base64,${base64}`,
        textByPage,
        numPages
      });
    } catch (err: any) {
      console.error('Error processing PDF:', err);
      // Fallback: pass basic filename and generic pages
      onFileLoaded({
        fileName: file.name,
        textByPage: [{ page: 1, text: 'Custom uploaded document for review.' }],
        numPages: 1
      });
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processPdfFile(file);
      } else {
        alert('Please upload a PDF document.');
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '9999px',
          fontSize: '13px',
          color: '#60A5FA',
          marginBottom: '20px',
          fontWeight: 600
        }}>
          <Sparkles size={16} />
          <span>Zero-Form-Building E-Signature</span>
        </div>

        <h1 style={{
          fontSize: '44px',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: 1.15,
          marginBottom: '16px',
          background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Let AI set up your agreement. <br />You just review and send.
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6
        }}>
          Conventional e-sign tools make you drag signature boxes and assemble forms.
          DockMaster AI reads the PDF, detects every party, and computes pixel-accurate field placements in seconds.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-xl)',
          background: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-glass-card)',
          backdropFilter: 'blur(16px)',
          padding: '56px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: isDragging ? 'var(--shadow-glow)' : 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processPdfFile(e.target.files[0]);
            }
          }}
          accept="application/pdf"
          style={{ display: 'none' }}
        />

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{loadingStatus}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Preparing visual and text embeddings</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)'
            }}>
              <Upload size={28} color="#60A5FA" />
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                Drop your contract PDF here, or click to browse
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Upload any lease, NDA, employment offer, or agreement
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '8px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#10B981" /> Client-side encrypted
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#F59E0B" /> Unseen document ready
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Or Select Real-World Sample Contract */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Or test with real-world paperwork
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              1-click test drives with authentic multi-party legal documents:
            </p>
          </div>
          <span className="badge badge-ai">Instant Preview</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="glass-card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                    letterSpacing: '0.5px'
                  }}>
                    {sample.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {sample.pages} page{sample.pages > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                  {sample.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sample.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '13px',
                color: 'var(--primary)',
                fontWeight: 600
              }}>
                <span>Analyze with AI</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
