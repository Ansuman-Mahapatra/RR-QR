import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';
import PasscodeGate from './components/PasscodeGate';
import './index.css';

export default function Redirect() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'expired' | 'invalid' | 'validating'>('checking');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const targetUrl = searchParams.get('t');
  const expiry = searchParams.get('e');
  const codeParam = searchParams.get('c');

  useEffect(() => {
    if (!targetUrl) {
      setStatus('invalid');
      return;
    }

    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();
      if (now > expiryTime) {
        setStatus('expired');
        return;
      }
    }

    setStatus('checking');
  }, [targetUrl, expiry]);

  // Once unlocked and status is valid, proceed with redirect
  useEffect(() => {
    if (!isUnlocked || status === 'invalid' || status === 'expired' || !targetUrl) return;

    setStatus('validating');
    const timer = setTimeout(() => {
      window.location.href = decodeURIComponent(targetUrl);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isUnlocked, status, targetUrl]);

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

  if (status === 'expired') {
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

  // If passcode is required and not yet unlocked
  if (codeParam && !isUnlocked) {
    return (
      <PasscodeGate
        expectedHash={codeParam}
        designationType="link"
        title="Protected Link"
        subtitle="This destination link requires a 4-digit code. Enter the code provided by the sender to proceed."
        onSuccess={() => setIsUnlocked(true)}
      />
    );
  }

  return (
    <div className="app-container" style={{ textAlign: 'center', marginTop: '15vh' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
        <Clock size={64} style={{ color: '#10b981', marginBottom: '1.5rem' }} className="spin" />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Link Verified!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Security verified. Redirecting you safely...
        </p>
      </div>
    </div>
  );
}
