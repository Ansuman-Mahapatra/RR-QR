import { Send, QrCode, ShieldCheck, Zap, Lock, Sparkles, ArrowRight, Eye, Files, ExternalLink } from 'lucide-react';

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
          <span>RR QR — Fast, Private &amp; Free</span>
        </div>

        <h1 className="welcome-title">
          Free QR Code Generator <span className="gradient-text">Online</span>
        </h1>
        <p className="welcome-tagline">
          Create custom circular QR codes for links, images, and files with optional 4-digit passcode security, or scan and unlock shared content in seconds.
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

          <h2 className="card-title">Send &amp; Generate QR</h2>
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
              <span>View-only (10s timer) &amp; permanent modes</span>
            </li>
            <li>
              <Files size={14} />
              <span>Multi-image galleries &amp; file bundles</span>
            </li>
          </ul>

          <button type="button" className="action-card-btn btn-send">
            <span>Create &amp; Send QR</span>
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

          <h2 className="card-title">Scan &amp; Receive Content</h2>
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
              <span>Instant photo &amp; screenshot QR reader</span>
            </li>
            <li>
              <Lock size={14} />
              <span>4-digit passcode direct unlock</span>
            </li>
          </ul>

          <button type="button" className="action-card-btn btn-receive">
            <span>Scan &amp; Receive</span>
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

      {/* Informative SEO Section: How It Works & Capabilities */}
      <section className="welcome-info-section" aria-label="About RR QR and How It Works">
        <h2 className="info-section-title">
          How <span className="gradient-text">RR QR</span> Works
        </h2>
        <p className="info-section-subtitle">
          RR QR is a free web-based QR code generator and scanner designed for rapid, secure peer-to-peer sharing. Here is how you can generate and receive content:
        </p>

        <div className="info-steps-grid">
          <div className="info-step-card">
            <div className="step-num">1</div>
            <h3 className="step-title">Choose Content Type</h3>
            <p className="step-desc">
              Select <strong>URL / Link</strong> for direct or 1-hour expiring web destinations, <strong>Image</strong> for single photos with 10-second view-only protection or multi-image galleries, or <strong>Files</strong> for documents and archives.
            </p>
          </div>

          <div className="info-step-card">
            <div className="step-num">2</div>
            <h3 className="step-title">Customize &amp; Secure</h3>
            <p className="step-desc">
              Personalize your QR code with custom dot and background colors. Optionally protect access using a dynamically generated 4-digit passcode with salted SHA-256 verification.
            </p>
          </div>

          <div className="info-step-card">
            <div className="step-num">3</div>
            <h3 className="step-title">Generate &amp; Download</h3>
            <p className="step-desc">
              Instantly create a high-resolution circular QR code formatted with rounded corners and download it as a PNG file, ready for digital sharing or print.
            </p>
          </div>

          <div className="info-step-card">
            <div className="step-num">4</div>
            <h3 className="step-title">Scan or Unlock</h3>
            <p className="step-desc">
              Recipients can open content by scanning directly using their device camera, uploading a screenshot/photo QR code, or entering the matching 4-digit security code.
            </p>
          </div>
        </div>
      </section>

      {/* Creator Credits Footer */}
      <footer className="welcome-credits-footer">
        <div className="credits-divider" />
        <div className="credits-content">
          <p className="credits-text">
            Created by <span className="creator-name">Ansuman Mahapatra</span>
          </p>
          <a
            href="https://www.linkedin.com/in/ansumanmahapatra998/"
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin-link"
            title="Connect with Ansuman Mahapatra on LinkedIn"
          >
            <LinkedInIcon size={16} />
            <span>Ansuman Mahapatra | LinkedIn</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </footer>
    </div>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
    </svg>
  );
}

