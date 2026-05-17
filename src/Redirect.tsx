import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';
import './index.css';

export default function Redirect() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'expired' | 'invalid' | 'validating'>('checking');
  
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
      setStatus('validating');
      setTimeout(() => {
        window.location.href = decodeURIComponent(targetUrl);
      }, 1500);
    }
  }, [searchParams]);

  if (status === 'checking' || status === 'validating') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <Clock size={64} style={{ color: '#10b981', marginBottom: '1.5rem' }} className={status === 'checking' ? 'spin' : ''} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {status === 'checking' ? 'Verifying Link...' : 'Link is Valid!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {status === 'checking' ? 'Please wait a moment.' : 'This 1-Hour Expiring QR code is still valid. Redirecting you safely...'}
          </p>
        </div>
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
