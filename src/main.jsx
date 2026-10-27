import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getInitialTheme } from './context/ThemeContext.jsx'

document.documentElement.dataset.theme = getInitialTheme()
document.documentElement.style.colorScheme = document.documentElement.dataset.theme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
