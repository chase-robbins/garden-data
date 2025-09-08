import { useAuth } from '../AuthContext';
import UserProfile from './UserProfile';
import GardenSelector from './GardenSelector';

const Header = ({ selectedGarden, onGardenChange }) => {
  const { user } = useAuth();

  return (
    <header style={{
      background: 'linear-gradient(135deg, #6b7c50 0%, #8b9c60 100%)',
      color: '#f8f5f0',
      height: '70px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '0 2rem',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.5rem',
          fontWeight: '400',
          color: '#f8f5f0',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          🌱 Garden Data
        </h1>
        
        {user && (
          <GardenSelector 
            selectedGarden={selectedGarden} 
            onGardenChange={onGardenChange}
            headerMode={true}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <UserProfile />
        ) : (
          <div style={{ color: 'rgba(248, 245, 240, 0.7)', fontStyle: 'italic' }}>
            Please sign in
          </div>
        )}
      </div>
      </div>
    </header>
  );
};

export default Header;