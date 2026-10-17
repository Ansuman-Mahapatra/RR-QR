import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle, Eye, ShieldOff, Download } from 'lucide-react';
import PasscodeGate from './components/PasscodeGate';
import './index.css';

const STORAGE_PREFIX = 'rr_viewed_';
const VIEW_DURATION_SEC = 10;

export default function ViewImage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    'loading' | 'already_viewed' | 'viewing' | 'expired' | 'time_up' | 'invalid'
  >('loading');
  const [imageUrl, setImageUrl] = useState('');
  const [countdown, setCountdown] = useState(VIEW_DURATION_SEC);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const codeParam = searchParams.get('c');
  const modeParam = searchParams.get('m'); // 'v' = view-only, 'e' = expiring/download
  const isViewOnly = modeParam === 'v';
  const isAlreadyUnlocked = searchParams.get('unlocked') === '1';

  // Once unlocked (via passcode or direct from receiving), activate viewing / download
  const handleUnlockSuccess = (imgSrc?: string) => {
    setIsUnlocked(true);
    const targetImg = imgSrc || imageUrl;

    if (isViewOnly && targetImg) {
      const storageKey = STORAGE_PREFIX + btoa(targetImg).slice(0, 32);
      fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(data => {
          localStorage.setItem(storageKey, JSON.stringify({
            ip: data.ip || 'unknown',
            viewedAt: new Date().toISOString()
          }));
        })
        .catch(() => {
          localStorage.setItem(storageKey, JSON.stringify({
            ip: 'unknown',
            viewedAt: new Date().toISOString()
          }));
        })
        .finally(() => {
          setStatus('viewing');
        });
    } else {
      setStatus('viewing');
    }
  };

  useEffect(() => {
    const img = searchParams.get('img');
    const expiry = searchParams.get('e');

    if (!img) {
      setStatus('invalid');
      return;
    }

    const decoded = decodeURIComponent(img);
    setImageUrl(decoded);

    // Check expiry
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      setStatus('expired');
      return;
    }

    // If view-only, check if this device already viewed it
    if (isViewOnly) {
      const storageKey = STORAGE_PREFIX + btoa(decoded).slice(0, 32);
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        setStatus('already_viewed');
        return;
      }
    }

    // If no passcode required or already unlocked from receiving screen
    if (!codeParam || isAlreadyUnlocked) {
      handleUnlockSuccess(decoded);
    }
  }, [searchParams, isViewOnly, codeParam, isAlreadyUnlocked]);

  // Start countdown only AFTER image has fully loaded (view-only mode only)
  useEffect(() => {
    if (!imageLoaded || status !== 'viewing' || !isViewOnly) return;

    setCountdown(VIEW_DURATION_SEC);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus('time_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, imageLoaded, isViewOnly]);

  // Disable right-click on entire page for view-only mode
  useEffect(() => {
    if (!isViewOnly) return;
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, [isViewOnly]);

  // --- UI states ---

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This QR code does not contain a valid image.</p>
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
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '380px' }}>
            This QR code was valid for a limited time and has now expired. Please ask the sender for a new one.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'already_viewed') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <ShieldOff size={64} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Already Viewed
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '380px', lineHeight: 1.7 }}>
            You have already opened this image before.<br />
            This is a <strong style={{ color: 'var(--text-main)' }}>View Only</strong> link and can only be accessed <strong style={{ color: 'var(--text-main)' }}>once</strong> per device.
          </p>
        </div>
      </div>
    );
  }

  // Passcode gate check: only show if passcode is required AND not already unlocked
  if (codeParam && !isUnlocked && !isAlreadyUnlocked) {
    return (
      <PasscodeGate
        expectedHash={codeParam}
        designationType={isViewOnly ? 'view' : 'download'}
        title={isViewOnly ? 'View-Only Protected Image' : 'Protected Image Download'}
        subtitle={
          isViewOnly
            ? 'This image is designated as View Only. Enter the 4-digit code to start your 10-second viewing window.'
            : 'This image is designated for download. Enter the 4-digit code to unlock the download page.'
        }
        onSuccess={() => handleUnlockSuccess()}
      />
    );
  }

  if (status === 'time_up') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <Eye size={64} style={{ color: '#6366f1', marginBottom: '1.5rem', opacity: 0.4 }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Viewing Time Ended
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '380px', lineHeight: 1.7 }}>
            Your {VIEW_DURATION_SEC}-second viewing window has closed.<br />
            This image is no longer accessible on this device.
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'shared-image';
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { /* silent */ }
  };

  // Download designation mode → show download card
  if (!isViewOnly) {
    return (
      <div className="app-container" style={{ marginTop: '10vh', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
            Image Download
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.4rem 1rem', borderRadius: '12px', marginTop: '0.5rem', background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
            <Download size={14} /> Download Designation Unlocked
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gridTemplateColumns: '1fr', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Download size={44} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.4rem', textAlign: 'center' }}>
            Shared Image
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
            Click the button below to download the shared image.
          </p>
          <button onClick={handleDownload} style={{
            background: 'var(--primary)', color: 'white',
            padding: '1rem 2.5rem', borderRadius: '14px', border: 'none',
            fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.35)'
          }}>
            <Download size={22} /> Download Image
          </button>
        </div>
      </div>
    );
  }

  // View-only mode → show image with 10s countdown
  return (
    <div className="app-container" style={{ marginTop: '5vh', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          Image Viewer
        </h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.95rem', padding: '0.4rem 1.2rem', borderRadius: '12px', marginTop: '0.5rem',
          background: !imageLoaded ? 'rgba(99,102,241,0.08)' : countdown <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.1)',
          color: !imageLoaded ? 'var(--text-muted)' : countdown <= 3 ? '#ef4444' : '#818cf8',
          fontWeight: 600, transition: 'all 0.5s'
        }}>
          <Clock size={16} />
          {!imageLoaded ? 'Loading image...' : `Closes in ${countdown}s`}
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gridTemplateColumns: '1fr' }}>
        {!imageLoaded && (
          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '3rem' }}>
            <div className="spin" style={{ width: '48px', height: '48px', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading image...</p>
          </div>
        )}
        <img
          src={imageUrl}
          alt="Shared content"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          onLoad={() => setImageLoaded(true)}
          style={{
            display: imageLoaded ? 'block' : 'none',
            maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain',
            borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
        <div style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', height: '6px' }}>
          <div style={{
            height: '100%',
            width: `${(countdown / VIEW_DURATION_SEC) * 100}%`,
            background: countdown <= 3 ? '#ef4444' : 'var(--primary)',
            transition: 'width 1s linear, background 0.3s',
            borderRadius: '8px'
          }} />
        </div>
      </div>
    </div>
  );
}
