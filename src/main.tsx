import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { PasswordGate } from './shared/components/PasswordGate'
import './index.css'

// The password gate is only switched on for the published site (VITE_GATE=1 in the deploy workflow)
const gated = import.meta.env.VITE_GATE === '1'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {gated ? (
      <PasswordGate>
        <App />
      </PasswordGate>
    ) : (
      <App />
    )}
  </StrictMode>,
)
