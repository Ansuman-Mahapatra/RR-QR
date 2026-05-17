import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Download } from 'lucide-react';
import './index.css';

export default function ViewGallery() {
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    const imgs = searchParams.get('imgs');
    if (!imgs) { setStatus('invalid'); return; }
    try {
      const decoded: string[] = JSON.parse(atob(imgs));
      if (!Array.isArray(decoded) || decoded.length === 0) throw new Error();
      setImages(decoded);
      setStatus('valid');
    } catch {
      setStatus('invalid');
    }
  }, [searchParams]);

  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `image-${index + 1}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { /* silent */ }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
      await new Promise(r => setTimeout(r, 400)); // slight delay between downloads
    }
  };

  if (status === 'loading') {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '20vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading gallery...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="app-container" style={{ marginTop: '10vh' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', gridTemplateColumns: '1fr' }}>
          <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Invalid Gallery Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This QR code does not contain a valid image gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ marginTop: '5vh', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          Image Gallery
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{images.length} image{images.length > 1 ? 's' : ''} shared via QR</p>

        {/* Download All button */}
        <button
          onClick={handleDownloadAll}
          style={{
            marginTop: '1rem', background: 'var(--primary)', color: 'white',
            padding: '0.75rem 2rem', borderRadius: '12px', border: 'none',
            fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
          }}>
          <Download size={20} /> Download All
        </button>
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {images.map((url, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img
              src={url}
              alt={`Image ${i + 1}`}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Image {i + 1}</span>
              <button
                onClick={() => handleDownload(url, i)}
                style={{
                  background: 'var(--primary)', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.35rem'
                }}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
