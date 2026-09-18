import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import TodoApp from './Todo-App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
)
