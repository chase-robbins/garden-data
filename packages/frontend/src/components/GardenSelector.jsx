import { useState } from 'react';
import { useGardens } from '../hooks/useGardens';

const GardenSelector = ({ selectedGarden, onGardenChange, headerMode = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const {
    gardens,
    loading,
    error,
    addGarden
  } = useGardens();

  const handleAddGarden = async (e) => {
    e.preventDefault();
    
    if (!newGardenName.trim()) return;

    setIsAdding(true);
    try {
      const gardenId = await addGarden(newGardenName);
      const newGarden = { id: gardenId, name: newGardenName.trim() };
      onGardenChange(newGarden);
      setNewGardenName('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding garden:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewGardenName('');
    setShowAddForm(false);
  };

  if (loading) return <div style={{ color: headerMode ? '#a0aec0' : 'inherit', fontSize: '14px' }}>Loading gardens...</div>;
  if (error) return <div style={{ color: headerMode ? '#fed7d7' : 'red', fontSize: '14px' }}>Error loading gardens</div>;

  if (headerMode) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
        <select
          value={selectedGarden?.id || ''}
          onChange={(e) => {
            const garden = gardens.find(g => g.id === e.target.value);
            onGardenChange(garden || null);
          }}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '14px',
            border: '1px solid #4a5568',
            borderRadius: '6px',
            backgroundColor: '#4a5568',
            color: 'white',
            minWidth: '160px',
            outline: 'none'
          }}
        >
          <option value="" style={{ backgroundColor: '#2d3748' }}>Select garden...</option>
          {gardens.map((garden) => (
            <option key={garden.id} value={garden.id} style={{ backgroundColor: '#2d3748' }}>
              {garden.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          style={{
            padding: '0.5rem',
            backgroundColor: '#68d391',
            color: '#1a202c',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Add new garden"
        >
          +
        </button>

        {showAddForm && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 999
              }}
              onClick={handleCancel}
            />
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '1rem',
              minWidth: '280px',
              zIndex: 1000
            }}>
              <form onSubmit={handleAddGarden}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2d3748', marginBottom: '0.5rem' }}>
                    Garden Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter garden name"
                    value={newGardenName}
                    onChange={(e) => setNewGardenName(e.target.value)}
                    disabled={isAdding}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isAdding}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e2e8f0',
                      color: '#4a5568',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newGardenName.trim() || isAdding}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#68d391',
                      color: '#1a202c',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {isAdding ? 'Adding...' : 'Add Garden'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    );
  }

  // Original layout for non-header mode
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <label htmlFor="garden-select" style={{ fontWeight: 'bold' }}>
          Select Garden:
        </label>
        <select
          id="garden-select"
          value={selectedGarden?.id || ''}
          onChange={(e) => {
            const garden = gardens.find(g => g.id === e.target.value);
            onGardenChange(garden || null);
          }}
          style={{
            padding: '0.5rem',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '200px'
          }}
        >
          <option value="">Select a garden...</option>
          {gardens.map((garden) => (
            <option key={garden.id} value={garden.id}>
              {garden.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGarden} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Garden name"
              value={newGardenName}
              onChange={(e) => setNewGardenName(e.target.value)}
              disabled={isAdding}
              style={{
                padding: '0.5rem',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minWidth: '200px'
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!newGardenName.trim() || isAdding}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isAdding}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {selectedGarden && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#e9f7ef', 
          border: '1px solid #28a745', 
          borderRadius: '4px' 
        }}>
          <strong>Selected Garden:</strong> {selectedGarden.name}
        </div>
      )}

      {gardens.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          No gardens yet. Click the + button to create your first garden!
        </p>
      )}
    </div>
  );
};

export default GardenSelector;