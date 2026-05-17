import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Download, FileText } from 'lucide-react';
import './index.css';

interface FileData {
  name: string;
  url: string;
}

export default function ViewMultiFile() {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<FileData[]>([]);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) { setStatus('invalid'); return; }
    try {
      const decoded: FileData[] = JSON.parse(decodeURIComponent(atob(data)));
      if (!Array.isArray(decoded) || decoded.length === 0) throw new Error();
      setFiles(decoded);
      setStatus('valid');
    } catch {
      setStatus('invalid');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '20vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading files...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Invalid File Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This QR code does not contain a valid file list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ marginTop: '5vh', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          File Bundle
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{files.length} file{files.length > 1 ? 's' : ''} shared via QR</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', gridTemplateColumns: '1fr', padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {files.map((file, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                <FileText size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</span>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--primary)', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flexShrink: 0
                }}>
                <Download size={16} /> Open
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
