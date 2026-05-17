import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Loader2, Sparkles, Upload, FileText, X } from 'lucide-react';
import './index.css';

interface FileTabProps {
  dotColor: string;
  bgColor: string;
}

export default function FileTab({ dotColor, bgColor }: FileTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [error, setError] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const getRRLogo = () => {
    const bg = bgColor.replace('#', '%23');
    const fill = dotColor.replace('#', '%23');
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${bg}" rx="25"/><text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="50" fill="${fill}" text-anchor="middle" dominant-baseline="middle">RR</text></svg>`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsGenerated(false);
    setError('');
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsUploading(true);
    setIsGenerated(false);
    setError('');

    try {
      // Step 1: Get a GoFile server
      const serverRes = await fetch('https://api.gofile.io/servers');
      const serverData = await serverRes.json();
      if (serverData.status !== 'ok') throw new Error('Could not connect to upload server.');
      const server = serverData.data.servers[0].name;

      // Step 2: Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.status !== 'ok') throw new Error('Upload failed. Please try again.');

      const filePageUrl = uploadData.data.downloadPage || `https://gofile.io/d/${uploadData.data.code}`;
      const currentDomain = window.location.origin;
      const finalQrUrl = `${currentDomain}/viewfile?f=${encodeURIComponent(filePageUrl)}&name=${encodeURIComponent(file.name)}`;

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

  const handleDownloadQR = () => qrCode.current?.download({ name: 'RR-file-qr', extension: 'png' });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="image-tab-layout">
      <div className="controls-section">

        {/* File upload */}
        <div className="form-group">
          <label>Upload File / Document</label>
          <div className="file-upload">
            <div className="file-upload-btn">
              <Upload size={20} />
              <span>{file ? file.name : 'Choose a file (PDF, DOC, ZIP, etc.)'}</span>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv,.json"
              onChange={handleFileSelect}
            />
          </div>

          {file && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', background: 'rgba(99,102,241,0.08)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setIsGenerated(false); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
          📎 Whoever scans this QR will see a <strong style={{ color: 'var(--text-main)' }}>secure download page</strong> with a button to get your file.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleGenerate}
          disabled={isUploading || !file}
          style={{ width: '100%', opacity: (isUploading || !file) ? 0.7 : 1 }}>
          {isUploading
            ? <><Loader2 size={20} className="spin" /> Uploading & Generating...</>
            : <><Sparkles size={20} /> Generate File QR</>}
        </button>
      </div>

      {/* Preview */}
      <div className="preview-section">
        {!isUploading && !isGenerated && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <FileText size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Upload a file and click Generate</p>
          </div>
        )}
        {isUploading && (
          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '2rem' }}>
            <Loader2 size={64} className="spin" style={{ marginBottom: '1rem' }} />
            <p>Uploading & generating QR...</p>
          </div>
        )}
        {isGenerated && (
          <>
            <div className="qr-container" style={{ backgroundColor: bgColor, borderRadius: '24px', padding: '10px' }}>
              <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              📎 Scan to open download page
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
