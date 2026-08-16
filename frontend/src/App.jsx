import { useState } from 'react'
import Homepage from './homepage.jsx'
import LoginPage from './login.jsx'

export default function App() {
  // Check if a token exists in localStorage on initial load
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('token'))
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_full_name')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return <Homepage onLogout={handleLogout} />
}

