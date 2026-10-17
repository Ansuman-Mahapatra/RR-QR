import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Lock, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, ExternalLink, QrCode, Upload } from 'lucide-react';
import jsQR from 'jsqr';
import { getTransferByPin, getAllTransfers, type TransferRecord } from '../utils/security';

interface ReceiveScreenProps {
  onBack: () => void;
}

export default function ReceiveScreen({ onBack }: ReceiveScreenProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'photo' | 'pin'>('camera');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // PIN state
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinMatchedTransfer, setPinMatchedTransfer] = useState<TransferRecord | null>(null);
  const [pinSearchError, setPinSearchError] = useState('');
  const [recentTransfers, setRecentTransfers] = useState<TransferRecord[]>([]);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    setRecentTransfers(getAllTransfers());
  }, []);

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    if (activeTab !== 'camera' && cameraActive) {
      stopCamera();
    }
    if (activeTab === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing]);

  // Camera Management
  const startCamera = async () => {
    stopCamera();
    setCameraError('');
    setScannedResult(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanCameraFrame();
      }
    } catch (err: any) {
      setCameraError(err.message || 'Unable to access camera. Please check permissions or upload a photo instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanCameraFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setScannedResult(code.data);
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanCameraFrame);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Photo QR scanning
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setScannedResult(null);
    setIsAnalyzingPhoto(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsAnalyzingPhoto(false);
          setPhotoError('Canvas error. Please retry.');
          return;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsAnalyzingPhoto(false);
        if (code && code.data) {
          setScannedResult(code.data);
        } else {
          setPhotoError('No QR code detected in this photo. Please make sure the code is clear and try again.');
        }
      };
      img.onerror = () => {
        setIsAnalyzingPhoto(false);
        setPhotoError('Failed to read image file.');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 4-Digit PIN lookup
  const handlePinInput = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...pinDigits];
    newDigits[index] = clean.slice(-1);
    setPinDigits(newDigits);
    setPinSearchError('');
    setPinMatchedTransfer(null);

    if (clean && index < 3) {
      pinRefs[index + 1].current?.focus();
    }

    const full = newDigits.join('');
    if (full.length === 4) {
      lookupPin(full);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);

    if (pasted.length === 4) {
      lookupPin(pasted);
    } else {
      pinRefs[pasted.length]?.current?.focus();
    }
  };

  const lookupPin = (pin: string) => {
    const match = getTransferByPin(pin);
    if (match) {
      setPinMatchedTransfer(match);
      setPinSearchError('');
      // Auto redirect seamlessly so user is never prompted for the code again
      setIsAutoRedirecting(true);
      setTimeout(() => {
        navigateToResult(match.url, true);
      }, 700);
    } else {
      setPinMatchedTransfer(null);
      setPinSearchError(`No active transfer with PIN "${pin}" found on this device. If you have the QR code, scan it above with the Camera or Photo selector.`);
    }
  };

  // When alreadyUnlocked is true (e.g. from 4-digit code tab), strip 'c' and set 'unlocked=1'
  // so the destination page NEVER asks for the protected code a second time!
  const navigateToResult = (targetUrl: string, alreadyUnlocked: boolean = false) => {
    if (!targetUrl) return;
    try {
      const parsed = new URL(targetUrl, window.location.origin);
      if (alreadyUnlocked) {
        parsed.searchParams.delete('c');
        parsed.searchParams.set('unlocked', '1');
      }
      if (parsed.origin === window.location.origin) {
        window.location.href = parsed.pathname + parsed.search;
      } else {
        window.location.href = parsed.toString();
      }
    } catch {
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '3rem' }}>
      {/* Top Header with Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          className="back-nav-btn"
          title="Back to Home Menu"
        >
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Receive Content
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Scan via camera, upload a QR photo, or enter a 4-digit code
          </p>
        </div>
        <div style={{ width: '100px' }} />
      </div>

      {/* Receive Method Tabs */}
      <div className="receive-tabs">
        <button
          type="button"
          className={`receive-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => { setActiveTab('camera'); setScannedResult(null); }}
        >
          <Camera size={18} />
          <span>From Camera</span>
        </button>
        <button
          type="button"
          className={`receive-tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => { setActiveTab('photo'); setScannedResult(null); }}
        >
          <ImageIcon size={18} />
          <span>Select Photo</span>
        </button>
        <button
          type="button"
          className={`receive-tab-btn ${activeTab === 'pin' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pin'); setScannedResult(null); }}
        >
          <Lock size={18} />
          <span>4-Digit Code</span>
        </button>
      </div>

      {/* Scanned Result Banner if detected from Camera or Photo */}
      {scannedResult && (
        <div className="scanned-result-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={28} style={{ color: '#10b981' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>QR Code Detected!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Content link is ready to open</p>
            </div>
          </div>
          <div className="scanned-url-box">
            <span style={{ fontSize: '0.85rem', color: '#c7d2fe', wordBreak: 'break-all' }}>{scannedResult}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, padding: '0.85rem 1.5rem', fontSize: '1rem' }}
              onClick={() => navigateToResult(scannedResult, false)}
            >
              <ExternalLink size={18} />
              <span>Open Received Content</span>
            </button>
            <button
              type="button"
              className="btn-secondary-icon"
              style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--input-border)', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer' }}
              onClick={() => { setScannedResult(null); if (activeTab === 'camera') startCamera(); }}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* METHOD 1: CAMERA SCANNER */}
      {activeTab === 'camera' && !scannedResult && (
        <div className="glass-card receive-view-card">
          <div className="scanner-container">
            <video ref={videoRef} className="scanner-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Viewfinder Target & Laser Line */}
            {cameraActive && (
              <div className="scanner-viewfinder">
                <div className="laser-scan-line" />
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />
              </div>
            )}

            {!cameraActive && !cameraError && (
              <div className="scanner-placeholder">
                <Camera size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Camera is idle</p>
                <button type="button" className="btn-primary" style={{ maxWidth: '200px', marginTop: '0.75rem' }} onClick={startCamera}>
                  Start Scanner
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="scanner-error-box">
              <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '0.9rem', color: '#ef4444', margin: 0 }}>{cameraError}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="receive-action-btn"
              onClick={cameraActive ? stopCamera : startCamera}
            >
              <Camera size={16} />
              <span>{cameraActive ? 'Pause Camera' : 'Resume Camera'}</span>
            </button>
            <button
              type="button"
              className="receive-action-btn"
              onClick={toggleCameraFacing}
            >
              <RefreshCw size={16} />
              <span>Flip Camera</span>
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
            Point your camera at the circular QR code. It will automatically detect and open.
          </p>
        </div>
      )}

      {/* METHOD 2: SELECT QR PHOTO */}
      {activeTab === 'photo' && !scannedResult && (
        <div className="glass-card receive-view-card">
          <div className="photo-upload-dropzone">
            <Upload size={44} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.4rem' }}>Select or Drop a QR Code Photo</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              Upload any screenshot or photo containing a Round QR code
            </p>

            <label className="btn-primary" style={{ maxWidth: '240px', cursor: 'pointer' }}>
              <ImageIcon size={18} />
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </label>
          </div>

          {isAnalyzingPhoto && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--primary)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Decoding QR code from photo...</p>
            </div>
          )}

          {photoPreview && !isAnalyzingPhoto && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <img
                src={photoPreview}
                alt="Selected"
                style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '14px', border: '1px solid var(--card-border)', objectFit: 'contain' }}
              />
            </div>
          )}

          {photoError && (
            <div className="scanner-error-box" style={{ marginTop: '1rem' }}>
              <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '0.9rem', color: '#ef4444', margin: 0 }}>{photoError}</p>
            </div>
          )}
        </div>
      )}

      {/* METHOD 3: 4-DIGIT CODE ONLY */}
      {activeTab === 'pin' && (
        <div className="glass-card receive-view-card">
          <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
            <div className="pin-receive-icon-wrap">
              <Lock size={36} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Enter 4-Digit Passcode
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Enter the 4-digit code provided by the sender. Your content will unlock directly without asking for the code again.
            </p>

            {/* 4 Digit Inputs */}
            <div className="gate-inputs-container" style={{ margin: '0 auto 1.5rem auto' }}>
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={pinRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinInput(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onPaste={handlePinPaste}
                  className="gate-digit-input"
                />
              ))}
            </div>

            {/* Auto Redirecting Notice or Matched Transfer Card */}
            {pinMatchedTransfer && (
              <div className="matched-transfer-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={26} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#34d399' }}>
                      {isAutoRedirecting ? 'Code Verified! Unlocking...' : 'Code Verified!'}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      PIN: {pinMatchedTransfer.pin} • Opening {pinMatchedTransfer.type} directly
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#10b981' }}
                  onClick={() => navigateToResult(pinMatchedTransfer.url, true)}
                >
                  <ExternalLink size={16} />
                  <span>Open Content Directly</span>
                </button>
              </div>
            )}

            {pinSearchError && (
              <div className="scanner-error-box" style={{ marginTop: '1rem', textAlign: 'left' }}>
                <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: '#ef4444', margin: 0 }}>{pinSearchError}</p>
              </div>
            )}
          </div>

          {/* Recent Transferred Items */}
          {recentTransfers.length > 0 && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <QrCode size={16} />
                <span>Recent Transfers on this Device:</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentTransfers.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigateToResult(item.url, true)}
                    className="recent-transfer-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="recent-pin-tag">{item.pin}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title || `${item.type} transfer`}</span>
                    </div>
                    <ExternalLink size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
