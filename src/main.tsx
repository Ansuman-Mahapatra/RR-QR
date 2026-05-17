import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Redirect from './Redirect.tsx'
import ViewImage from './ViewImage.tsx'
import ViewFile from './ViewFile.tsx'
import ViewGallery from './ViewGallery.tsx'
import ViewMultiFile from './ViewMultiFile.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/r" element={<Redirect />} />
        <Route path="/view" element={<ViewImage />} />
        <Route path="/viewfile" element={<ViewFile />} />
        <Route path="/gallery" element={<ViewGallery />} />
        <Route path="/multifile" element={<ViewMultiFile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
