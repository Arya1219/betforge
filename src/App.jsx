import { useState } from 'react'
import { LoginScreen } from './LoginScreen'
import BetForge from './BetForge'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) return <LoginScreen onLogin={setUser} />
  return <BetForge currentUser={user} />
}
