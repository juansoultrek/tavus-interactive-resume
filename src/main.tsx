import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CVIProvider } from './components/cvi/components/cvi-provider'

// StrictMode is intentionally off: it double-mounts effects and makes Daily
// leave/rejoin the Tavus room (visible disconnect/reconnect loops).
createRoot(document.getElementById('root')!).render(
  <CVIProvider>
    <App />
  </CVIProvider>,
)
