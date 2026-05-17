import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Clock, Loader2, Sparkles, Globe, Upload, Image as ImageIcon, Eye, X } from 'lucide-react';
import './index.css';

interface ImageTabProps {
  dotColor: string;
  bgColor: string;
}

export default function ImageTab({ dotColor, bgColor }: ImageTabProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'expiring' | 'viewonly'>('viewonly');
  const [apiKey, setApiKey] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [error, setError] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const getRRLogo = () => {
    const bg = bgColor.replace('#', '%23');
    const fill = dotColor.replace('#', '%23');
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${bg}" rx="25"/><text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="50" fill="${fill}" text-anchor="middle" dominant-baseline="middle">RR</text></svg>`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setIsGenerated(false);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    if (!apiKey.trim()) {
      setError('Please enter your free ImgBB API key to upload images.');
      return;
    }

    setIsUploading(true);
    setIsGenerated(false);
    setError('');

    try {
      // Upload image to ImgBB
      const formData = new FormData();
      formData.append('image', imageFile);
      if (mode === 'expiring') {
        formData.append('expiration', '3600'); // 1 hour in seconds
      }

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed. Check your API key.');
      }

      const hostedUrl = data.data.url;
      const currentDomain = window.location.origin;

      let finalQrUrl = '';
      if (mode === 'expiring') {
        const timeMs = Date.now() + 1 * 60 * 60 * 1000;
        setExpiryTime(timeMs);
        finalQrUrl = `${currentDomain}/view?img=${encodeURIComponent(hostedUrl)}&e=${timeMs}`;
      } else {
        setExpiryTime(null);
        finalQrUrl = `${currentDomain}/view?img=${encodeURIComponent(hostedUrl)}`;
      }

      setEncodedUrl(finalQrUrl);
      setIsGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isGenerated || !encodedUrl) return;

    const opts: any = {
      width: 300,
      height: 300,
      type: 'svg',
      data: encodedUrl,
      image: getRRLogo(),
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: dotColor, type: 'rounded' },
      backgroundOptions: { color: bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 },
      cornersSquareOptions: { type: 'extra-rounded', color: dotColor },
      cornersDotOptions: { type: 'dot', color: dotColor },
    };

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling(opts);
    } else {
      qrCode.current.update(opts);
    }

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [isGenerated, encodedUrl, dotColor, bgColor]);

  const handleDownload = () => {
    qrCode.current?.download({ name: 'RR-image-qr', extension: 'png' });
  };

  const formattedTime = expiryTime
    ? new Date(expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="image-tab-layout">
      {/* Controls */}
      <div className="controls-section">

        {/* Mode toggle */}
        <div className="form-group">
          <label>QR Code Type</label>
          <div style={{ display: 'flex', gap: '1rem', background: 'var(--input-bg)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
            <button
              onClick={() => { setMode('viewonly'); setIsGenerated(false); }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === 'viewonly' ? 'var(--primary)' : 'transparent',
                color: mode === 'viewonly' ? 'white' : 'var(--text-main)',
                fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
              <Eye size={18} /> View Only
            </button>
            <button
              onClick={() => { setMode('expiring'); setIsGenerated(false); }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === 'expiring' ? 'var(--primary)' : 'transparent',
                color: mode === 'expiring' ? 'white' : 'var(--text-main)',
                fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
              <Clock size={18} /> 1-Hour Expiring
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label>Upload Image / Logo</label>
          <div className="file-upload">
            <div className="file-upload-btn">
              <Upload size={20} />
              <span>{imageFile ? imageFile.name : 'Choose a photo or logo'}</span>
            </div>
            <input type="file" accept="image/*" onChange={handleFileSelect} />
          </div>
          {imagePreview && (
            <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '12px', border: '1px solid var(--input-border)' }}
              />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); setIsGenerated(false); }}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ImgBB API Key */}
        <div className="form-group">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            ImgBB API Key
            <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Get Free Key ↗</a>
          </label>
          <input
            type="password"
            className="input-field"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setError(''); }}
            placeholder="Paste your free ImgBB API key"
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Free at imgbb.com — needed to host your image publicly.
          </span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={isUploading || !imageFile}
          style={{ width: '100%', opacity: (isUploading || !imageFile) ? 0.7 : 1 }}
        >
          {isUploading ? (
            <><Loader2 size={20} className="spin" /> Uploading & Generating...</>
          ) : (
            <><Sparkles size={20} /> Generate Image QR</>
          )}
        </button>
      </div>

      {/* Preview */}
      <div className="preview-section">
        {!isUploading && !isGenerated && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <ImageIcon size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Upload an image and click Generate</p>
          </div>
        )}

        {isUploading && (
          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '2rem' }}>
            <Loader2 size={64} className="spin" style={{ marginBottom: '1rem' }} />
            <p>Uploading image & generating QR...</p>
          </div>
        )}

        {isGenerated && (
          <>
            <div className="qr-container" style={{ backgroundColor: bgColor, borderRadius: '24px', padding: '10px' }}>
              <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
            </div>

            {mode === 'expiring' && expiryTime && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <Clock size={16} /> Valid until {formattedTime}
              </div>
            )}

            {mode === 'viewonly' && (
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <Globe size={16} /> Permanent View Link
              </div>
            )}

            <button className="btn-primary" onClick={handleDownload} style={{ background: '#10b981' }}>
              <Download size={20} /> Download PNG
            </button>
          </>
        )}
      </div>
    </div>
  );
}
