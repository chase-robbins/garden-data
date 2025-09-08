import { useState } from 'react';
import { useGardens } from '../hooks/useGardens';

const GardenSelector = ({ selectedGarden, onGardenChange }) => {
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

  if (loading) return <div>Loading gardens...</div>;
  if (error) return <div>Error loading gardens: {error}</div>;

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