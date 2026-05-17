import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Loader2, Sparkles, Upload, FileText, X } from 'lucide-react';
import './index.css';

interface MultiFileTabProps {
  dotColor: string;
  bgColor: string;
}

export default function MultiFileTab({ dotColor, bgColor }: MultiFileTabProps) {
  const [files, setFiles] = useState<File[]>([]);
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
    const combined = [...files, ...selected].slice(0, 10); // max 10 files
    setFiles(combined);
    setIsGenerated(false);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setIsGenerated(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setIsGenerated(false);
    setError('');
    setProgress(0);

    const uploadedFiles: { name: string, url: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        // Step 1: Get a GoFile server
        const serverRes = await fetch('https://api.gofile.io/servers');
        const serverData = await serverRes.json();
        if (serverData.status !== 'ok') throw new Error('Could not connect to upload server.');
        const server = serverData.data.servers[0].name;

        // Step 2: Upload the file
        const formData = new FormData();
        formData.append('file', files[i]);

        const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.status !== 'ok') throw new Error(`Failed to upload file ${i + 1}.`);

        const filePageUrl = uploadData.data.downloadPage || `https://gofile.io/d/${uploadData.data.code}`;
        uploadedFiles.push({ name: files[i].name, url: filePageUrl });
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const currentDomain = window.location.origin;
      // encode data securely
      const encoded = btoa(encodeURIComponent(JSON.stringify(uploadedFiles)));
      const finalQrUrl = `${currentDomain}/multifile?data=${encoded}`;

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
      qrOptions: { errorCorrectionLevel: 'L' }, // 'L' because payload could be large
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

  const handleDownloadQR = () => qrCode.current?.download({ name: 'RR-multifile-qr', extension: 'png' });

  return (
    <div className="image-tab-layout">
      <div className="controls-section">

        <div className="form-group">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Upload Documents
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{files.length}/10 selected</span>
          </label>
          <div className="file-upload">
            <div className="file-upload-btn">
              <Upload size={20} />
              <span>Choose multiple files</span>
            </div>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv,.json" 
              multiple 
              onChange={handleFilesSelect} 
            />
          </div>
        </div>

        {/* Selected files list */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {files.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99,102,241,0.08)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <FileText size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
          📎 Whoever scans this QR will see a list of <strong style={{ color: 'var(--text-main)' }}>all files</strong> with download buttons.
        </p>

        {/* Upload progress */}
        {isUploading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Uploading files...</span>
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
            : <><Sparkles size={20} /> Generate Bundle QR</>}
        </button>
      </div>

      {/* Preview */}
      <div className="preview-section">
        {!isUploading && !isGenerated && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <FileText size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Select multiple files and click Generate</p>
          </div>
        )}
        {isUploading && (
          <div style={{ textAlign: 'center', color: 'var(--primary)', padding: '2rem' }}>
            <Loader2 size={64} className="spin" style={{ marginBottom: '1rem' }} />
            <p>Uploading {files.length} file{files.length > 1 ? 's' : ''}...</p>
          </div>
        )}
        {isGenerated && (
          <>
            <div className="qr-container" style={{ backgroundColor: bgColor, borderRadius: '24px', padding: '10px' }}>
              <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              📎 {files.length} file{files.length > 1 ? 's' : ''} — Scan to view list
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
