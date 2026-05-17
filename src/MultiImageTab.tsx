import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Loader2, Sparkles, Upload, Image as ImageIcon, X } from 'lucide-react';
import './index.css';

const IMGBB_KEY = '1ee54d2dcc1b17afca1931ceed340d2f';

interface MultiImageTabProps {
  dotColor: string;
  bgColor: string;
}

export default function MultiImageTab({ dotColor, bgColor }: MultiImageTabProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const getRRLogo = () => {
    const bg = bgColor.replace('#', '%23');
    const fill = dotColor.replace('#', '%23');
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${bg}" rx="25"/><text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="50" fill="${fill}" text-anchor="middle" dominant-baseline="middle">RR</text></svg>`;
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const combined = [...files, ...selected].slice(0, 10); // max 10 images
    setFiles(combined);
    setIsGenerated(false);
    setError('');

    combined.forEach((file, i) => {
      if (previews[i]) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => {
          const updated = [...prev];
          updated[i] = ev.target?.result as string;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setIsGenerated(false);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setIsGenerated(false);
    setError('');
    setProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(`Failed to upload image ${i + 1}.`);
        uploadedUrls.push(data.data.url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const currentDomain = window.location.origin;
      const encoded = btoa(JSON.stringify(uploadedUrls));
      const finalQrUrl = `${currentDomain}/gallery?imgs=${encoded}`;

      setEncodedUrl(finalQrUrl);
      setIsGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isGenerated || !encodedUrl) return;
    const opts: any = {
      width: 300, height: 300, type: 'svg', data: encodedUrl,
      image: getRRLogo(),
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: dotColor, type: 'rounded' },
      backgroundOptions: { color: bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 },
      cornersSquareOptions: { type: 'extra-rounded', color: dotColor },
      cornersDotOptions: { type: 'dot', color: dotColor },
    };
    if (!qrCode.current) qrCode.current = new QRCodeStyling(opts);
    else qrCode.current.update(opts);
    if (qrRef.current) { qrRef.current.innerHTML = ''; qrCode.current.append(qrRef.current); }
  }, [isGenerated, encodedUrl, dotColor, bgColor]);

  const handleDownloadQR = () => qrCode.current?.download({ name: 'RR-gallery-qr', extension: 'png' });

  return (
    <div className="image-tab-layout">
      <div className="controls-section">

        <div className="form-group">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Upload Images
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{files.length}/10 selected</span>
          </label>
          <div className="file-upload">
            <div className="file-upload-btn">
              <Upload size={20} />
              <span>Choose multiple images</span>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFilesSelect} />
          </div>
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', background: 'rgba(0,0,0,0.3)' }}>
                <img src={src} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removeFile(i)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', color: 'white', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
          🖼 Whoever scans this QR will see all images in a <strong style={{ color: 'var(--text-main)' }}>gallery</strong> with individual download buttons.
        </p>

        {/* Upload progress */}
        {isUploading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Uploading images...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '6px' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '8px', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleGenerate}
          disabled={isUploading || files.length === 0}
          style={{ width: '100%', opacity: (isUploading || files.length === 0) ? 0.7 : 1 }}>
          {isUploading
            ? <><Loader2 size={20} className="spin" /> Uploading {progress}%...</>
            : <><Sparkles size={20} /> Generate Gallery QR</>}
        </button>
      </div>

      {/* Preview */}
      <div className="preview-section">
        {!isUploading && !isGenerated && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <ImageIcon size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Select images and click Generate</p>
          </div>
        )}
        {isUploading && (
          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '2rem' }}>
            <Loader2 size={64} className="spin" style={{ marginBottom: '1rem' }} />
            <p>Uploading {files.length} image{files.length > 1 ? 's' : ''}...</p>
          </div>
        )}
        {isGenerated && (
          <>
            <div className="qr-container" style={{ backgroundColor: bgColor, borderRadius: '24px', padding: '10px' }}>
              <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              🖼 {files.length} image{files.length > 1 ? 's' : ''} — Scan to open gallery
            </div>
            <button className="btn-primary" onClick={handleDownloadQR} style={{ background: '#10b981' }}>
              <Download size={20} /> Download QR PNG
            </button>
          </>
        )}
      </div>
    </div>
  );
}
