import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './routes/router'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
