import { useState } from 'react';
import { Lock, Copy, Check, Eye, Download, Link2, Images, FileText } from 'lucide-react';

interface PinDisplayCardProps {
  pin: string;
  designationType: 'view' | 'download' | 'link' | 'gallery' | 'file';
  customDesignation?: string;
  note?: string;
}

export default function PinDisplayCard({
  pin,
  designationType,
  customDesignation,
  note,
}: PinDisplayCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDesignationBadge = () => {
    if (customDesignation) return customDesignation;
    switch (designationType) {
      case 'view':
        return 'View Only (10s Window)';
      case 'download':
        return 'Download Access';
      case 'link':
        return 'Protected Link';
      case 'gallery':
        return 'Gallery Access';
      case 'file':
        return 'File Download';
      default:
        return 'Protected';
    }
  };

  const getDesignationIcon = () => {
    switch (designationType) {
      case 'view':
        return <Eye size={14} />;
      case 'download':
        return <Download size={14} />;
      case 'link':
        return <Link2 size={14} />;
      case 'gallery':
        return <Images size={14} />;
      case 'file':
        return <FileText size={14} />;
      default:
        return <Lock size={14} />;
    }
  };

  const digits = pin.padEnd(4, '0').slice(0, 4).split('');

  return (
    <div className="pin-display-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Lock size={16} style={{ color: 'var(--primary)' }} />
          <span>4-Digit Access Passcode</span>
        </div>
        <div className={`designation-badge badge-${designationType}`}>
          {getDesignationIcon()}
          <span>{getDesignationBadge()}</span>
        </div>
      </div>

      {/* 4 Digit Boxes */}
      <div className="pin-digit-boxes">
        {digits.map((digit, i) => (
          <div key={i} className="pin-box">
            {digit}
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', margin: '0.6rem 0', lineHeight: 1.4 }}>
        {note || `Recipient must enter this 4-digit code to ${designationType === 'view' ? 'view the content' : 'access & download the content'}.`}
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="pin-copy-btn"
      >
        {copied ? (
          <>
            <Check size={16} style={{ color: '#10b981' }} />
            <span>Code Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy 4-Digit Code</span>
          </>
        )}
      </button>
    </div>
  );
}
