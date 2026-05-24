import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root')!

function updateGap() {
  const gap = Math.log(Math.max(window.innerWidth, window.innerHeight))
  root.style.setProperty('--gap', `${gap}px`)
}

updateGap()
window.addEventListener('resize', updateGap)

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
