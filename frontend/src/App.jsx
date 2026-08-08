import { useState } from 'react'
import Homepage from './homepage.jsx'
import LoginPage from './login.jsx'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return <Homepage onLogout={() => setIsLoggedIn(false)} />
}
