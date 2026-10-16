import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Eye, Download, Link2, Images, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyPin } from '../utils/security';

interface PasscodeGateProps {
  expectedHash: string | null;
  designationType: 'view' | 'download' | 'link' | 'gallery' | 'file';
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
}

export default function PasscodeGate({
  expectedHash,
  designationType,
  title,
  subtitle,
  onSuccess,
}: PasscodeGateProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // If no expectedHash was provided in URL, automatically bypass
  useEffect(() => {
    if (!expectedHash) {
      onSuccess();
    } else {
      // Auto-focus first input
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [expectedHash]);

  if (!expectedHash) {
    return null;
  }

  const getDesignationBadge = () => {
    switch (designationType) {
      case 'view':
        return {
          icon: <Eye size={16} />,
          label: 'View-Only Designation',
          colorClass: 'badge-view',
          defaultDesc: 'This image is designated as View Only. Once unlocked, you will have a 10-second viewing window before it permanently closes.',
        };
      case 'download':
        return {
          icon: <Download size={16} />,
          label: 'Download Designation',
          colorClass: 'badge-download',
          defaultDesc: 'Enter the 4-digit code provided by the sender to unlock and download this image.',
        };
      case 'link':
        return {
          icon: <Link2 size={16} />,
          label: 'Protected Link Designation',
          colorClass: 'badge-link',
          defaultDesc: 'Enter the 4-digit code provided by the sender to proceed to the destination link.',
        };
      case 'gallery':
        return {
          icon: <Images size={16} />,
          label: 'Gallery Designation',
          colorClass: 'badge-gallery',
          defaultDesc: 'Enter the 4-digit code provided by the sender to unlock this image gallery.',
        };
      case 'file':
        return {
          icon: <FileText size={16} />,
          label: 'Document Designation',
          colorClass: 'badge-file',
          defaultDesc: 'Enter the 4-digit code provided by the sender to unlock and download the shared document(s).',
        };
      default:
        return {
          icon: <Lock size={16} />,
          label: 'Protected Content',
          colorClass: 'badge-download',
          defaultDesc: 'Enter the 4-digit code provided by the sender to unlock this content.',
        };
    }
  };

  const designationInfo = getDesignationBadge();

  const handleVerify = async (pinToTest: string) => {
    if (pinToTest.length !== 4) {
      setError('Please enter all 4 digits');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyPin(pinToTest, expectedHash);
      if (isValid) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setError('Incorrect 4-digit code. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch {
      setError('Verification error. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit input
    const single = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = single;
    setDigits(newDigits);
    setError('');

    // Advance focus
    if (index < 3) {
      inputRefs[index + 1].current?.focus();
    } else {
      // Reached the 4th digit, automatically trigger verification
      const fullPin = newDigits.join('');
      if (fullPin.length === 4) {
        handleVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter') {
      const fullPin = digits.join('');
      if (fullPin.length === 4) {
        handleVerify(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === 4) {
      inputRefs[3].current?.focus();
      handleVerify(pasted);
    } else {
      inputRefs[pasted.length]?.current?.focus();
    }
  };

  return (
    <div className="app-container" style={{ textAlign: 'center', marginTop: '10vh', paddingBottom: '3rem' }}>
      <div className="glass-card passcode-gate-card">
        {/* Animated icon */}
        <div className={`gate-icon-wrapper ${isSuccess ? 'success' : ''}`}>
          {isSuccess ? (
            <Unlock size={44} style={{ color: '#10b981' }} />
          ) : (
            <Lock size={44} style={{ color: 'var(--primary)' }} />
          )}
        </div>

        {/* Designation Badge */}
        <div className={`designation-badge ${designationInfo.colorClass}`} style={{ margin: '0 auto 1rem auto', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          {designationInfo.icon}
          <span>{designationInfo.label}</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {title || 'Enter 4-Digit Passcode'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          {subtitle || designationInfo.defaultDesc}
        </p>

        {/* 4 Digit Inputs */}
        <div className={`gate-inputs-container ${shake ? 'shake' : ''}`}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying || isSuccess}
              className={`gate-digit-input ${error ? 'error' : ''} ${isSuccess ? 'success' : ''}`}
            />
          ))}
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="gate-error-msg">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="gate-success-msg">
            <CheckCircle2 size={18} />
            <span>Passcode Verified! Accessing...</span>
          </div>
        )}

        {/* Unlock Button */}
        <button
          type="button"
          onClick={() => handleVerify(digits.join(''))}
          disabled={isVerifying || digits.join('').length !== 4 || isSuccess}
          className="btn-primary"
          style={{
            maxWidth: '320px',
            margin: '1.75rem auto 0 auto',
            opacity: digits.join('').length !== 4 || isVerifying ? 0.7 : 1,
            background: isSuccess ? '#10b981' : 'var(--primary)',
          }}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 size={20} /> Unlocked!
            </>
          ) : (
            <>
              <Unlock size={20} /> Unlock Content
            </>
          )}
        </button>
      </div>
    </div>
  );
}
