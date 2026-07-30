import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { enforceBrowserSession } from './lib/session-guard'

// Reset the session to a logged-out state if the browser was fully closed
// since the last visit (must run before React renders / routes resolve).
enforceBrowserSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
