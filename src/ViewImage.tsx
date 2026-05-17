import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle, Eye } from 'lucide-react';
import './index.css';

export default function ViewImage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'valid' | 'expired' | 'invalid'>('checking');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const img = searchParams.get('img');
    const expiry = searchParams.get('e');

    if (!img) {
      setStatus('invalid');
      return;
    }

    const decoded = decodeURIComponent(img);
    setImageUrl(decoded);

    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        setStatus('expired');
      } else {
        setStatus('valid');
      }
    } else {
      // No expiry = view only, permanent
      setStatus('valid');
    }
  }, [searchParams]);

  if (status === 'checking') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>This QR code does not contain a valid image.</p>
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
            Image Access Expired
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', textAlign: 'center' }}>
            This QR code was valid for 1 hour only. Please ask the sender for a new one.
          </p>
        </div>
      </div>
    );
  }

  // Valid — show image
  const isExpiring = !!searchParams.get('e');
  return (
    <div className="app-container" style={{ marginTop: '5vh', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          Image Viewer
        </h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.4rem 1rem', borderRadius: '12px', marginTop: '0.5rem',
          background: isExpiring ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          color: isExpiring ? '#ef4444' : '#10b981'
        }}>
          {isExpiring ? <Clock size={14} /> : <Eye size={14} />}
          {isExpiring ? '1-Hour Expiring Link' : 'Permanent View Link'}
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gridTemplateColumns: '1fr' }}>
        <img
          src={imageUrl}
          alt="Shared content"
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}
        />
        <a
          href={imageUrl}
          download
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: '1.5rem',
            background: 'var(--primary)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
          Open Full Image ↗
        </a>
      </div>
    </div>
  );
}
