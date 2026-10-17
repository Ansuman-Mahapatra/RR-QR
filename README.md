# Round QR - Smart & Secure Peer-to-Peer Transfer

A modern, dynamic QR code generator and receiver built with React and TypeScript. Transfer files, photos, and links with **animated Welcome interface**, **Send or Receive modes**, **dynamic 4-digit passcodes generated on creation**, and **multi-channel receiving (Camera scanner, Photo QR reader, and 4-Digit Code unlock)**.

---

## 🌟 Interactive Experience: Send or Receive

### 1. 🚀 Animated Welcome Screen
- Interactive animated hero featuring a rotating holographic gradient ring and glowing "RR" badge.
- Clean, intuitive split choice between **Send Content** and **Receive Content**.

### 2. 📤 Send Mode (Dynamic Code on QR Creation)
- Create round QR codes for **URLs**, **Single/Multi Images**, and **Single/Multi Document Bundles**.
- **Dynamic 4-Digit Passcode**: Unlike static codes, the 4-digit security code is **dynamically generated at the exact moment you click "Generate QR Code"** (with optional custom PIN support).
- Real-time preview with stylized 4-digit code card `[ 4 ] [ 8 ] [ 2 ] [ 9 ]` and 1-click **Copy Code** button.
- Downloaded QR PNG automatically includes the PIN in the filename (e.g. `RR-image-qr-[PIN-4829].png`).

### 3. 📥 Receive Mode (3 Convenient Ways to Unlock)
- **📷 Camera Scanner**:
  - Live viewfinder camera scanner using your device's camera.
  - Animated green laser scanline with target framing.
  - Automatically identifies Round QR codes and opens the received content.
- **🖼️ Photo Selector**:
  - Upload or drop any screenshot or photo containing a QR code.
  - Client-side decoding powered by `jsQR` via HTML canvas.
  - 1-click button to open and unlock the detected content.
- **🔢 4-Digit Passcode Only**:
  - Enter the 4-digit passcode directly on the keypad.
  - Matches against active transfers on the device for instant opening.
  - Displays recent transfers catalog for quick access.

---

## 🔐 Designation-Based Security System

When recipients open a QR code link, they are greeted with a sleek **4-Digit Passcode Gate** before anything is accessed:

- **View-Only Designation (`/view?m=v`)**: Entering the 4-digit code begins a **10-second countdown window** with once-per-device restriction and anti-download protection, after which viewing permanently closes.
- **Image Download Designation (`/view?m=e`)**: Entering the 4-digit code unlocks the download card and the **Download Image** button.
- **File Download Designation (`/viewfile`)**: Entering the 4-digit code unlocks the file download card and the **Download File** button.
- **Gallery Designation (`/gallery`)**: Entering the 4-digit code unlocks the multi-image gallery with **Download All** and individual image download buttons.
- **File Bundle Designation (`/multifile`)**: Entering the 4-digit code unlocks the multi-document list and download buttons.
- **Protected Link Designation (`/r`)**: Entering the 4-digit code verifies access and securely redirects to the destination URL.

---

## 🛠️ Technologies Used

- **Frontend Framework**: React 19
- **Language**: TypeScript (Type-safe throughout)
- **Build Tool**: Vite (Lightning fast compilation and HMR)
- **QR Code Generation**: `qr-code-styling` for circular, custom-branded SVG QR codes
- **QR Code Scanning**: `jsQR` (pure JS QR decoding from camera frames and image uploads)
- **Routing**: React Router DOM (`/r`, `/view`, `/gallery`, `/viewfile`, `/multifile`)
- **Security / Cryptography**: Web Cryptography API (`crypto.subtle` salted SHA-256 with fallback)
- **Icons**: Lucide React
- **Cloud APIs**:
  - **ImgBB API**: For image and gallery hosting
  - **GoFile.io API**: For secure file and multi-file document hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
To build the optimized production version:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```
