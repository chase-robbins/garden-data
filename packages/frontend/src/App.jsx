import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './AuthContext'
import Header from './components/Header'
import Login from './Login'
import GardenCanvas from './components/GardenCanvas'

function App() {
  const [serverMessage, setServerMessage] = useState('')
  const [health, setHealth] = useState(null)
  const [selectedGarden, setSelectedGarden] = useState(null)
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
      <div style={{ 
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f7fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header selectedGarden={null} onGardenChange={() => {}} />
        <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ 
              marginBottom: '1.5rem', 
              color: '#2d3748',
              fontSize: '1.75rem'
            }}>
              Welcome to Garden Data
            </h2>
            <Login />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f7fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header 
        selectedGarden={selectedGarden} 
        onGardenChange={setSelectedGarden} 
      />
      
      <main style={{ 
        flex: 1,
        padding: '2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {selectedGarden ? (
          <GardenCanvas garden={selectedGarden} />
        
        ) : (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
            <h2 style={{ 
              margin: '0 0 1rem 0', 
              color: '#2d3748',
              fontSize: '1.5rem'
            }}>
              Select a Garden
            </h2>
            <p style={{ color: '#718096', margin: 0 }}>
              Choose a garden from the dropdown above or create a new one to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App