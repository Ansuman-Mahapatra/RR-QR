import { Send, QrCode, ShieldCheck, Zap, Lock, Sparkles, ArrowRight, Eye, Files } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectSend: () => void;
  onSelectReceive: () => void;
}

export default function WelcomeScreen({ onSelectSend, onSelectReceive }: WelcomeScreenProps) {
  return (
    <div className="welcome-container">
      {/* Animated Hero Header */}
      <div className="welcome-hero">
        <div className="hero-badge-wrap">
          <div className="hero-logo-ring">
            <svg className="rotating-ring" width="100" height="100" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#gradientRing)"
                strokeWidth="3"
                strokeDasharray="8 6"
              />
              <defs>
                <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="hero-logo-center">
              <span className="hero-logo-text">RR</span>
            </div>
          </div>
        </div>

        <div className="hero-pill">
          <Sparkles size={14} style={{ color: '#818cf8' }} />
          <span>Next-Gen Encrypted Peer Transfer</span>
        </div>

        <h1 className="welcome-title">
          Round <span className="gradient-text">QR</span>
        </h1>
        <p className="welcome-tagline">
          Create modern, circular QR codes with dynamically generated 4-digit passcodes,
          or receive and unlock content with camera, photo, or PIN.
        </p>
      </div>

      {/* Choice Grid: Send or Receive */}
      <div className="action-cards-grid">
        {/* SEND CARD */}
        <div className="action-card send-card" onClick={onSelectSend}>
          <div className="card-top">
            <div className="card-icon-wrap send-icon-wrap">
              <Send size={32} />
            </div>
            <span className="card-badge badge-send">Send Mode</span>
          </div>

          <h2 className="card-title">Send Content</h2>
          <p className="card-description">
            Generate customized circular QR codes for URLs, single/multi images, or file bundles.
            A secure 4-digit code is dynamically created when you generate the QR.
          </p>

          <ul className="card-feature-list">
            <li>
              <Zap size={14} />
              <span>4-digit code generated dynamically on creation</span>
            </li>
            <li>
              <Eye size={14} />
              <span>View-only (10s timer) & permanent modes</span>
            </li>
            <li>
              <Files size={14} />
              <span>Multi-image galleries & file bundles</span>
            </li>
          </ul>

          <button type="button" className="action-card-btn btn-send">
            <span>Create & Send QR</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* RECEIVE CARD */}
        <div className="action-card receive-card" onClick={onSelectReceive}>
          <div className="card-top">
            <div className="card-icon-wrap receive-icon-wrap">
              <QrCode size={32} />
            </div>
            <span className="card-badge badge-receive">Receive Mode</span>
          </div>

          <h2 className="card-title">Receive Content</h2>
          <p className="card-description">
            Access protected content shared with you. Scan directly from your device camera,
            select an image from your gallery, or unlock directly using the 4-digit passcode.
          </p>

          <ul className="card-feature-list">
            <li>
              <QrCode size={14} />
              <span>Live viewfinder camera scanner</span>
            </li>
            <li>
              <Sparkles size={14} />
              <span>Instant photo & screenshot QR reader</span>
            </li>
            <li>
              <Lock size={14} />
              <span>4-digit passcode direct unlock</span>
            </li>
          </ul>

          <button type="button" className="action-card-btn btn-receive">
            <span>Scan & Receive</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Trust & Features Footer */}
      <div className="welcome-footer-features">
        <div className="footer-feature-item">
          <ShieldCheck size={18} style={{ color: '#10b981' }} />
          <span>4-Digit Salted SHA-256 Passcodes</span>
        </div>
        <div className="footer-feature-item">
          <Lock size={18} style={{ color: '#818cf8' }} />
          <span>Zero Account Registration</span>
        </div>
        <div className="footer-feature-item">
          <Zap size={18} style={{ color: '#f59e0b' }} />
          <span>Client-Side Dynamic Encoding</span>
        </div>
      </div>
    </div>
  );
}
