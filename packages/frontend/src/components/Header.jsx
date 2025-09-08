import { useAuth } from '../AuthContext';
import UserProfile from './UserProfile';
import GardenSelector from './GardenSelector';

const Header = ({ selectedGarden, onGardenChange }) => {
  const { user } = useAuth();

  return (
    <header style={{
      backgroundColor: '#2d3748',
      color: 'white',
      height: '70px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
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
          fontWeight: '600',
          color: '#68d391'
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
          <div style={{ color: '#a0aec0' }}>
            Please sign in
          </div>
        )}
      </div>
      </div>
    </header>
  );
};

export default Header;