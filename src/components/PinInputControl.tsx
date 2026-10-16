import { RefreshCw, ShieldCheck, Lock } from 'lucide-react';

interface PinInputControlProps {
  pin: string;
  setPin: (pin: string) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  onRegenerate: () => void;
  label?: string;
  description?: string;
}

export default function PinInputControl({
  pin,
  setPin,
  enabled,
  setEnabled,
  onRegenerate,
  label = '4-Digit Access Passcode',
  description = 'Recipient must enter this 4-digit code to unlock & access the content.',
}: PinInputControlProps) {
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  return (
    <div className="pin-control-card">
      <div className="pin-control-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={16} style={{ color: enabled ? 'var(--primary)' : 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
        </div>
        <label className="pin-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="pin-slider" />
        </label>
      </div>

      {enabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                placeholder="4-digit PIN (e.g. 1234)"
                className="input-field"
                style={{
                  letterSpacing: '0.35rem',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              className="btn-secondary-icon"
              title="Generate Random 4-Digit Code"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-main)',
                padding: '0.75rem',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            {description}
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Passcode protection disabled. Anyone with the QR code can access immediately.
        </p>
      )}
    </div>
  );
}
