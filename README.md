# Round QR - Smart QR Generator with 4-Digit Security Passcode

A modern, dynamic QR code generator built with React and TypeScript. Create highly customizable, round-styled QR codes for URLs, single/multiple images, and single/multiple files with advanced features like **4-digit passcode protection**, expiring links, and view-only designations.

---

## 🔐 4-Digit Passcode & Designation Security System

Every QR code generated can be protected by a **4-digit access passcode (PIN)**:

1. **Auto-Generated or Custom Code**:
   - Every generator tab provides an auto-generated random 4-digit code (e.g. `4829`) with a 1-click randomize button or custom input.
   - You can toggle passcode protection on or off as needed.

2. **Display & Download with PIN**:
   - The 4-digit code is prominently displayed alongside the QR code in a security card with a 1-click **Copy Code** button.
   - Downloaded QR files automatically include the PIN in the filename (e.g., `RR-image-qr-[PIN-4829].png`).

3. **Designation-Based Access at Starting**:
   - When recipients scan the QR code, they are greeted with a sleek **4-Digit Passcode Gate** before any content is revealed:
     - **View-Only Designation (`/view?m=v`)**: Entering the correct 4-digit code starts a **10-second viewing window** with once-per-device restriction, after which access permanently closes.
     - **Image Download Designation (`/view?m=e`)**: Entering the code unlocks the download card with the **Download Image** button.
     - **File Download Designation (`/viewfile`)**: Entering the code unlocks the file download card with the **Download File** button.
     - **Gallery Designation (`/gallery`)**: Entering the code unlocks the full multi-image gallery with **Download All** and individual image download buttons.
     - **File Bundle Designation (`/multifile`)**: Entering the code unlocks the document list with individual open/download buttons.
     - **Protected Link Designation (`/r`)**: Entering the code verifies access and securely redirects to the destination URL.

4. **Secure Hash Verification**:
   - The 4-digit passcode is hashed using salted SHA-256 (`crypto.subtle`) so plain PINs are never exposed in browser URLs.

---

## ✨ Features and Functionalities

### 1. 🔗 URL / Link QR Codes
- **Permanent Mode**: Generates a permanent link directly or protected with a 4-digit passcode gate.
- **1-Hour Expiring Mode**: Generates a temporary link valid for 1 hour that checks expiry before prompting for passcode verification and redirecting.
- **Custom Branding**: Fully customizable dot color, background color, and default centered "RR" badge.

### 2. 🖼️ Image & Gallery QR Codes
- **Single Image**:
  - *View Only*: 10-second viewing window, anti-save/no-download, once-per-device restriction, protected by 4-digit passcode.
  - *Permanent / Expiring Download*: Access download page by entering the 4-digit passcode.
- **Multi Image (Gallery)**: Upload up to 10 photos simultaneously. Scanning the QR code prompts for the 4-digit passcode to unlock the gallery and download options.
- *Powered by ImgBB API for fast image hosting.*

### 3. 📄 File & Document QR Codes
- **Single File**: Upload PDFs, DOCs, ZIPs, or spreadsheets. Generates a QR code leading to a passcode-protected download page.
- **Multi File (Bundles)**: Upload up to 10 files together. Uses GoFile.io bundling to share multiple files behind a single QR code and 4-digit passcode.

---

## 🛠️ Technologies Used

- **Frontend Framework**: React 19
- **Language**: TypeScript (Type-safe throughout)
- **Build Tool**: Vite (Lightning fast compilation and HMR)
- **Routing**: React Router DOM (`/r` for redirects, `/view`, `/gallery`, `/viewfile`, `/multifile` for content pages)
- **Security / Cryptography**: Web Cryptography API (`crypto.subtle` SHA-256 hashing with salt and FNV-1a fallback)
- **QR Code Engine**: `qr-code-styling` for stylized, rounded QR codes (SVG) with custom logos and color mappings
- **Icons**: Lucide React
- **External Hosting APIs**:
  - **ImgBB API**: For image and gallery uploads
  - **GoFile.io API**: For secure file and multi-file document uploads

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
