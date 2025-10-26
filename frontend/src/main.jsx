// src/main.jsx
// 목적: React 앱 엔트리. App 컴포넌트를 DOM에 마운트합니다.
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
