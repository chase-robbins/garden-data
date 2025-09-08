import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './AuthContext'
import Login from './Login'

function App() {
  const [serverMessage, setServerMessage] = useState('')
  const [health, setHealth] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetch('/api')
        .then(res => res.json())
        .then(data => setServerMessage(data.message))
        .catch(err => console.error('Error fetching server message:', err))

      fetch('/api/health')
        .then(res => res.json())
        .then(data => setHealth(data))
        .catch(err => console.error('Error fetching health:', err))
    }
  }, [user])

  if (!user) {
    return (
      <div className="App">
        <h1>Garden Data Frontend</h1>
        <Login />
      </div>
    )
  }

  return (
    <div className="App">
      <h1>Garden Data Frontend</h1>
      <Login />
      <div style={{ marginTop: '2rem' }}>
        <p>Server says: {serverMessage}</p>
        {health && (
          <div>
            <p>Server status: {health.status}</p>
            <p>Last check: {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App