import { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Edit3 } from 'lucide-react';

interface PinInputControlProps {
  pin: string;
  setPin: (pin: string) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isCustom: boolean;
  setIsCustom: (isCustom: boolean) => void;
  description?: string;
}

export default function PinInputControl({
  pin,
  setPin,
  enabled,
  setEnabled,
  isCustom,
  setIsCustom,
  description = 'A dynamic 4-digit code will be generated upon QR creation.',
}: PinInputControlProps) {
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  const toggleCustom = () => {
    const next = !showCustomInput;
    setShowCustomInput(next);
    setIsCustom(next);
    if (!next) {
      setPin(''); // Reset so it dynamically generates on click
    }
  };

  return (
    <div className="pin-control-card">
      <div className="pin-control-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={16} style={{ color: enabled ? 'var(--primary)' : 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dynamic 4-Digit Passcode</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
          {!showCustomInput ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99,102,241,0.08)', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 500 }}>
                  Generated dynamically during QR creation
                </span>
              </div>
              <button
                type="button"
                onClick={toggleCustom}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}
                title="Enter custom PIN instead"
              >
                <Edit3 size={13} /> Custom
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="Set custom 4-digit PIN"
                  className="input-field"
                  style={{
                    letterSpacing: '0.35rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="button"
                  onClick={toggleCustom}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--input-border)', color: 'var(--text-muted)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  Auto
                </button>
              </div>
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
            <ShieldCheck size={14} style={{ color: '#10b981', flexShrink: 0 }} />
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
