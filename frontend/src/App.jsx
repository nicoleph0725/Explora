import { useState } from 'react'
import Homepage from './homepage.jsx'
import LoginPage from './login.jsx'
import ScrapbookEditor from './scrapbook'

export default function App() {
  // Check if a token exists in localStorage on initial load
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('token'))
  })

  const [currentView, setCurrentView] = useState('home') // 'home' | 'editor'
  const [selectedScrapbook, setSelectedScrapbook] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_full_name')
    localStorage.removeItem('explora_user_journals')
    setIsLoggedIn(false)
    setCurrentView('home')
    setSelectedScrapbook(null)
  }

  const handleOpenScrapbook = (scrapbook) => {
    setSelectedScrapbook(scrapbook)
    setCurrentView('editor')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedScrapbook(null)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  if (currentView === 'editor') {
    return (
      <ScrapbookEditor
        scrapbook={selectedScrapbook}
        onBack={handleBackToHome}
      />
    )
  }

  return (
    <Homepage
      onLogout={handleLogout}
      onOpenScrapbook={handleOpenScrapbook}
    />
  )
}
