import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './AuthContext';

const Login = () => {
  const { user } = useAuth();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                marginBottom: '1rem' 
              }} 
            />
          )}
          <h3 style={{ color: '#5d4e37', fontWeight: '400' }}>Welcome, {user.displayName}!</h3>
          <p style={{ color: '#8b7355', fontStyle: 'italic' }}>{user.email}</p>
        </div>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif',
            transition: 'all 0.2s ease'
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif' }}>
      <h2 style={{ color: '#5d4e37', fontWeight: '400' }}>Please sign in to continue</h2>
      <button 
        onClick={signInWithGoogle}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#8b7355',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          margin: '0 auto',
          gap: '0.5rem',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="m18 9.2c0-.6 0-1.2-.1-1.8H9.2v3.4h4.9c-.2 1.2-.9 2.3-1.8 3v2.5h2.9c1.7-1.6 2.8-4 2.8-6.8"/>
          <path fill="#34A853" d="M9.2 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.9H1.1v2.4C2.6 15.5 5.7 18 9.2 18"/>
          <path fill="#FBBC04" d="M4.1 10.7c-.2-.5-.2-1.1-.2-1.7s.1-1.2.2-1.7V4.9H1.1C.4 6.3 0 7.7 0 9.2s.4 2.9 1.1 4.3l3-2.4"/>
          <path fill="#EA4335" d="M9.2 3.6c1.3 0 2.5.4 3.4 1.3L15 2.6C13.4 1.1 11.3.4 9.2.4 5.7.4 2.6 2.9 1.1 6.2l3 2.4c.7-2.3 2.7-3.9 5.1-3.9"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;