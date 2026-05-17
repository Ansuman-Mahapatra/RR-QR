import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';
import './index.css';

export default function Redirect() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'expired' | 'invalid'>('checking');
  
  useEffect(() => {
    const targetUrl = searchParams.get('t');
    const expiry = searchParams.get('e');

    if (!targetUrl || !expiry) {
      setStatus('invalid');
      return;
    }

    const expiryTime = parseInt(expiry, 10);
    const now = Date.now();

    if (now > expiryTime) {
      setStatus('expired');
    } else {
      // Still valid, redirect!
      window.location.href = decodeURIComponent(targetUrl);
    }
  }, [searchParams]);

  if (status === 'checking') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
        <h2>Checking Link...</h2>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>This QR code does not contain a valid destination or has been corrupted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
        <Clock size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          QR Code Expired
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px' }}>
          This QR code was set to be valid for a limited time and has now expired. Please request a new one.
        </p>
      </div>
    </div>
  );
}
