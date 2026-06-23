import { useState } from 'react'
import { LoginScreen } from './LoginScreen'
import BetForge from './BetForge'

const STORAGE_KEY = 'betforge_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState(loadUser)

  const handleLogin = (u) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />
  return <BetForge currentUser={user} onLogout={handleLogout} />
}
