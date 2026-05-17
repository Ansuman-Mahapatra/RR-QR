import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import './index.css';

export default function ViewFile() {
  const [searchParams] = useSearchParams();
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const f = searchParams.get('f');
    const name = searchParams.get('name');
    if (f) setFileUrl(decodeURIComponent(f));
    if (name) setFileName(decodeURIComponent(name));
  }, [searchParams]);

  if (!fileUrl) {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '20vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Invalid file link.</p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ marginTop: '10vh', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          File Download
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>A file has been shared with you via QR code.</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gridTemplateColumns: '1fr', maxWidth: '480px', margin: '0 auto' }}>
        {/* File icon */}
        <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <FileText size={44} style={{ color: 'var(--primary)' }} />
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.4rem', textAlign: 'center', wordBreak: 'break-all' }}>
          {fileName || 'Shared File'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
          Click the button below to open and download your file.
        </p>

        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'var(--primary)', color: 'white',
            padding: '1rem 2.5rem', borderRadius: '14px',
            textDecoration: 'none', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
            transition: 'opacity 0.2s'
          }}>
          <Download size={22} /> Download File
        </a>
      </div>
    </div>
  );
}
