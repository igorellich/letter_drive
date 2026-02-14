import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Scene } from './components/puzo_shark/Scene'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <div style={{ width: '100vw', height: '100vh' }}>
      
       <Scene/>
      
    </div>
   
    {/* <App /> */}
  </StrictMode>,
)
