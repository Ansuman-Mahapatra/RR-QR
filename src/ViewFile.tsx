import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import './index.css';

export default function ViewFile() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid'>('loading');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<'s' | 'e'>('s');

  useEffect(() => {
    const f = searchParams.get('f');
    const expiry = searchParams.get('e');
    const m = searchParams.get('m') as 's' | 'e';
    const name = searchParams.get('name');

    if (!f) { setStatus('invalid'); return; }

    setFileUrl(decodeURIComponent(f));
    setFileName(name ? decodeURIComponent(name) : 'File');
    setMode(m || 's');

    if (expiry && Date.now() > parseInt(expiry, 10)) {
      setStatus('expired');
    } else {
      setStatus('valid');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '20vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying access...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This QR code does not contain a valid file.</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <Clock size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            File Link Expired
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '380px', lineHeight: 1.7 }}>
            This {mode === 'e' ? '1-hour' : '24-hour'} file link has expired and is no longer accessible.
            Please ask the sender for a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ marginTop: '10vh', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          File Access
        </h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.9rem', padding: '0.4rem 1rem', borderRadius: '12px', marginTop: '0.5rem',
          background: mode === 'e' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          color: mode === 'e' ? '#ef4444' : '#10b981'
        }}>
          <Clock size={14} />
          {mode === 'e' ? '1-Hour Expiring Link' : '24-Hour Share Link'}
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gridTemplateColumns: '1fr', maxWidth: '500px', margin: '0 auto' }}>
        {/* File icon */}
        <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <FileText size={44} style={{ color: 'var(--primary)' }} />
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center', wordBreak: 'break-all' }}>
          {fileName}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
          A file has been shared with you via a secure QR link.
        </p>

        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'var(--primary)', color: 'white', padding: '1rem 2.5rem',
            borderRadius: '14px', textDecoration: 'none', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.35)', transition: 'all 0.2s'
          }}>
          <Download size={22} /> Open & Download File
        </a>
      </div>
    </div>
  );
}
