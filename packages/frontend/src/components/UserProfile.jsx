import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <button 
        onClick={signInWithGoogle}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(248, 245, 240, 0.2)',
          color: '#f8f5f0',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '400',
          fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 18 18">
          <path fill="currentColor" d="m18 9.2c0-.6 0-1.2-.1-1.8H9.2v3.4h4.9c-.2 1.2-.9 2.3-1.8 3v2.5h2.9c1.7-1.6 2.8-4 2.8-6.8"/>
          <path fill="currentColor" d="M9.2 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.9H1.1v2.4C2.6 15.5 5.7 18 9.2 18"/>
          <path fill="currentColor" d="M4.1 10.7c-.2-.5-.2-1.1-.2-1.7s.1-1.2.2-1.7V4.9H1.1C.4 6.3 0 7.7 0 9.2s.4 2.9 1.1 4.3l3-2.4"/>
          <path fill="currentColor" d="M9.2 3.6c1.3 0 2.5.4 3.4 1.3L15 2.6C13.4 1.1 11.3.4 9.2.4 5.7.4 2.6 2.9 1.1 6.2l3 2.4c.7-2.3 2.7-3.9 5.1-3.9"/>
        </svg>
        Sign in
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '6px',
          transition: 'background-color 0.2s',
          backgroundColor: showDropdown ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
      >
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              border: '2px solid rgba(248, 245, 240, 0.4)'
            }} 
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', fontWeight: '400', lineHeight: '1.2', fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif' }}>
            {user.displayName}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(248, 245, 240, 0.7)', lineHeight: '1.2', fontStyle: 'italic', fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif' }}>
            {user.email}
          </span>
        </div>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          style={{ 
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <path fill="currentColor" d="M6 8L2 4h8z"/>
        </svg>
      </div>

      {showDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowDropdown(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e5ddd0',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif',
            minWidth: '200px',
            zIndex: 1000
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5ddd0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '400', color: '#5d4e37' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: '12px', color: '#8b7355', fontStyle: 'italic' }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#e53e3e',
                textAlign: 'left',
                borderRadius: '0 0 12px 12px',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;