import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Upload, Trash2, Clock, Loader2, Sparkles, Globe, ShieldAlert } from 'lucide-react';
import './index.css';

export default function App() {
  const [url, setUrl] = useState("");
  const [dotColor, setDotColor] = useState("#6366f1");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  
  // Two modes: 'direct' (raw url, no expire) or 'expiring' (redirect app, 1 hr expire)
  const [mode, setMode] = useState<'direct' | 'expiring'>('expiring');
  
  const [encodedUrl, setEncodedUrl] = useState('');
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const handleGenerate = () => {
    if (!url.trim()) return;
    
    setIsGenerating(true);
    setIsGenerated(false);
    
    setTimeout(() => {
      if (mode === 'expiring') {
        const timeMs = Date.now() + 1 * 60 * 60 * 1000;
        setExpiryTime(timeMs);
        
        // Use the current domain (localhost for now, but will be a real domain when deployed)
        const currentDomain = window.location.origin;
        const redirectUrl = `${currentDomain}/r?t=${encodeURIComponent(url)}&e=${timeMs}`;
        setEncodedUrl(redirectUrl);
      } else {
        // Direct mode: just encode the raw URL (no expiration)
        setExpiryTime(null);
        setEncodedUrl(url);
      }
      
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000); 
  };

  useEffect(() => {
    if (!isGenerated || !encodedUrl) return;

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: encodedUrl,
        image: logo || undefined,
        dotsOptions: { color: dotColor, type: "rounded" },
        backgroundOptions: { color: bgColor },
        imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 },
        cornersSquareOptions: { type: "extra-rounded", color: dotColor },
        cornersDotOptions: { type: "dot", color: dotColor }
      });
    } else {
      qrCode.current.update({
        data: encodedUrl,
        image: logo || undefined,
        dotsOptions: { color: dotColor, type: "rounded" },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: "extra-rounded", color: dotColor },
        cornersDotOptions: { type: "dot", color: dotColor }
      });
    }

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [isGenerated, encodedUrl, dotColor, bgColor, logo]);

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({ name: mode === 'expiring' ? "1hr-qr" : "permanent-qr", extension: "png" });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedTime = expiryTime 
    ? new Date(expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="app-container">
      <div className="header">
        <h1>Smart QR Generator</h1>
        <p>Create modern, round QR codes with dynamic features</p>
      </div>

      <div className="glass-card">
        <div className="controls-section">
          
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label>QR Code Type</label>
            <div style={{ display: 'flex', gap: '1rem', background: 'var(--input-bg)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
              <button 
                onClick={() => { setMode('direct'); setIsGenerated(false); }}
                style={{ 
                  flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: mode === 'direct' ? 'var(--primary)' : 'transparent',
                  color: mode === 'direct' ? 'white' : 'var(--text-main)',
                  fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                <Globe size={18} />
                Permanent (Works Everywhere)
              </button>
              <button 
                onClick={() => { setMode('expiring'); setIsGenerated(false); }}
                style={{ 
                  flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: mode === 'expiring' ? 'var(--primary)' : 'transparent',
                  color: mode === 'expiring' ? 'white' : 'var(--text-main)',
                  fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                <Clock size={18} />
                1-Hour Expiring (Requires Hosting)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="url">Destination URL</label>
            <input
              id="url"
              type="text"
              className="input-field"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsGenerated(false); 
              }}
              placeholder="Paste your link here (e.g. https://google.com)"
            />
          </div>
          
          <button 
            className="btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating || !url.trim()}
            style={{ width: '100%', marginBottom: '1rem', opacity: (!url.trim() || isGenerating) ? 0.7 : 1 }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate QR Code
              </>
            )}
          </button>

          <div className="color-pickers">
            <div className="color-picker-group">
              <input type="color" className="color-input" value={dotColor} onChange={(e) => setDotColor(e.target.value)} />
              <span className="color-label">Dots Color</span>
            </div>

            <div className="color-picker-group">
              <input type="color" className="color-input" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <span className="color-label">Background</span>
            </div>
          </div>

          <div className="form-group">
            <label>Embed Logo (Optional)</label>
            <div className="file-upload">
              <div className="file-upload-btn">
                <Upload size={20} />
                <span>{logo ? 'Change Logo' : 'Upload Logo'}</span>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
            {logo && (
              <button className="clear-logo-btn" onClick={() => setLogo(null)}>
                <Trash2 size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="preview-section">
          {!isGenerating && !isGenerated && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <QrCodeIcon size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Paste a link and click Generate</p>
            </div>
          )}

          {isGenerating && (
            <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '2rem' }}>
              <Loader2 size={64} className="spin" style={{ marginBottom: '1rem' }} />
              <p>Encoding your link...</p>
            </div>
          )}

          {isGenerated && (
            <>
              <div className="qr-container" style={{ backgroundColor: bgColor, borderRadius: '24px', padding: '10px' }}>
                <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
              </div>
              
              {mode === 'expiring' && expiryTime && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem 1rem', 
                  borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500
                }}>
                  <Clock size={16} /> Valid until {formattedTime}
                </div>
              )}

              {mode === 'direct' && (
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', 
                  borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500
                }}>
                  <Globe size={16} /> Permanent Link (No Expiration)
                </div>
              )}

              <button className="btn-primary" onClick={handleDownload} style={{ background: '#10b981' }}>
                <Download size={20} />
                Download PNG
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QrCodeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}
