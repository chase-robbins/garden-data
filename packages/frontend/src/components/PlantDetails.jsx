import { useState, useEffect } from 'react';
import { usePlantNotes } from '../hooks/usePlantNotes';
import { usePlantMeasurements } from '../hooks/usePlantMeasurements';

const PlantDetails = ({ 
  plant, 
  onClose, 
  onSave, 
  onDelete,
  camera
}) => {
  const [formData, setFormData] = useState({
    species: plant?.species || '',
    color: plant?.color || '#4CAF50'
  });
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  
  // Measurements state
  const [newMeasurement, setNewMeasurement] = useState({
    light: '',
    moisture: '',
    soil_ph: '',
    temp: ''
  });
  // Initialize with current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const time = now.toTimeString().slice(0, 5); // HH:MM format
    return { date, time };
  };
  
  const [customDate, setCustomDate] = useState(() => getCurrentDateTime().date);
  const [customTime, setCustomTime] = useState(() => getCurrentDateTime().time);
  const [editingMeasurementId, setEditingMeasurementId] = useState(null);
  const [editingMeasurementData, setEditingMeasurementData] = useState({
    light: '',
    moisture: '',
    soil_ph: '',
    temp: ''
  });

  const { notes, loading: notesLoading, addNote, updateNote, deleteNote } = usePlantNotes(plant?.id);
  const { measurements, loading: measurementsLoading, addMeasurement, updateMeasurement, deleteMeasurement } = usePlantMeasurements(plant?.id);

  useEffect(() => {
    if (plant) {
      setFormData({
        species: plant.species || '',
        color: plant.color || '#4CAF50'
      });
    }
  }, [plant]);

  const handleSave = async () => {
    if (!formData.species.trim()) return;
    
    try {
      await onSave({
        species: formData.species,
        color: formData.color,
        x: plant.x,
        y: plant.y
      });
      onClose();
    } catch (error) {
      console.error('Error saving plant:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addNote(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveNoteEdit = async () => {
    if (!editingNoteText.trim()) return;
    
    try {
      await updateNote(editingNoteId, editingNoteText);
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  // Measurement handlers
  const handleAddMeasurement = async () => {
    const hasAnyValue = Object.values(newMeasurement).some(value => value.trim() !== '');
    if (!hasAnyValue) return;
    
    try {
      const measurementData = {};
      Object.entries(newMeasurement).forEach(([key, value]) => {
        if (value.trim() !== '') {
          measurementData[key] = parseFloat(value);
        }
      });
      
      // Combine date and time into datetime string
      if (customDate.trim() !== '' && customTime.trim() !== '') {
        measurementData.customDateTime = `${customDate}T${customTime}`;
      }
      
      await addMeasurement(measurementData);
      setNewMeasurement({ light: '', moisture: '', soil_ph: '', temp: '' });
      
      // Reset to current date/time
      const currentDateTime = getCurrentDateTime();
      setCustomDate(currentDateTime.date);
      setCustomTime(currentDateTime.time);
    } catch (error) {
      console.error('Error adding measurement:', error);
    }
  };

  const handleEditMeasurement = (measurement) => {
    setEditingMeasurementId(measurement.id);
    setEditingMeasurementData({
      light: measurement.light !== null ? measurement.light.toString() : '',
      moisture: measurement.moisture !== null ? measurement.moisture.toString() : '',
      soil_ph: measurement.soil_ph !== null ? measurement.soil_ph.toString() : '',
      temp: measurement.temp !== null ? measurement.temp.toString() : ''
    });
  };

  const handleSaveMeasurementEdit = async () => {
    const hasAnyValue = Object.values(editingMeasurementData).some(value => value.trim() !== '');
    if (!hasAnyValue) return;
    
    try {
      const measurementData = {};
      Object.entries(editingMeasurementData).forEach(([key, value]) => {
        if (value.trim() !== '') {
          measurementData[key] = parseFloat(value);
        }
      });
      
      await updateMeasurement(editingMeasurementId, measurementData);
      setEditingMeasurementId(null);
      setEditingMeasurementData({ light: '', moisture: '', soil_ph: '', temp: '' });
    } catch (error) {
      console.error('Error updating measurement:', error);
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await deleteMeasurement(measurementId);
      } catch (error) {
        console.error('Error deleting measurement:', error);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (!plant) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      bottom: 0,
      height: 'calc(100vh - 70px)',
      backgroundColor: '#f7f4f0', // Warm cream background
      fontFamily: 'Georgia, Baskerville, "Times New Roman", Times, serif',
      zIndex: 1001,
      display: 'flex'
    }}>
      {/* Left Panel - Plant Details */}
      <div style={{
        width: '25%',
        background: 'linear-gradient(135deg, #6b7c50 0%, #8b9c60 100%)', // Earthy green gradient
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8f5f0',
        position: 'relative',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(248, 245, 240, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#f8f5f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(248, 245, 240, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(248, 245, 240, 0.2)'}
        >
          ×
        </button>

        {/* Plant Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: formData.color,
              border: '3px solid rgba(248, 245, 240, 0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }} />
            <h1 style={{ 
              margin: 0, 
              fontSize: '36px', 
              fontWeight: '400', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {formData.species || 'Unnamed Plant'}
            </h1>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '16px', 
            opacity: 0.8,
            fontStyle: 'italic'
          }}>
            Growing at ({Math.round(plant.x)}, {Math.round(plant.y)})
          </p>
        </div>

        {/* Plant Details Form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Species Input */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '18px', 
              fontWeight: '500', 
              marginBottom: '12px',
              opacity: 0.9
            }}>
              Plant Species
            </label>
            <input
              type="text"
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              placeholder="e.g. Heritage Tomato, Sweet Basil, Garden Rose..."
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid rgba(248, 245, 240, 0.3)',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: 'rgba(248, 245, 240, 0.1)',
                color: '#f8f5f0',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(248, 245, 240, 0.6)';
                e.target.style.backgroundColor = 'rgba(248, 245, 240, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(248, 245, 240, 0.3)';
                e.target.style.backgroundColor = 'rgba(248, 245, 240, 0.1)';
              }}
            />
          </div>

          {/* Color Selector */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '18px', 
              fontWeight: '500', 
              marginBottom: '16px',
              opacity: 0.9
            }}>
              Plant Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid rgba(248, 245, 240, 0.3)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                Current: {formData.color}
              </div>
            </div>
            
            {/* Color Presets */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {[
                { color: '#4CAF50', name: 'Garden Green' },
                { color: '#8BC34A', name: 'Fresh Lime' },
                { color: '#FF6B35', name: 'Autumn Orange' },
                { color: '#6366f1', name: 'Lavender Blue' },
                { color: '#8B5CF6', name: 'Purple Bloom' },
                { color: '#EC4899', name: 'Rose Pink' },
                { color: '#F59E0B', name: 'Sunflower' },
                { color: '#10B981', name: 'Mint Green' }
              ].map(preset => (
                <button
                  key={preset.color}
                  onClick={() => setFormData({ ...formData, color: preset.color })}
                  title={preset.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: preset.color,
                    border: formData.color === preset.color ? '3px solid #f8f5f0' : '2px solid rgba(248, 245, 240, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: formData.color === preset.color ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Location Information */}
          <div style={{
            backgroundColor: 'rgba(248, 245, 240, 0.15)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(248, 245, 240, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '500' }}>
              🗺️ Location Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', opacity: 0.9 }}>
              <div>
                <strong>World Coordinates:</strong> ({Math.round(plant.x)}, {Math.round(plant.y)})
              </div>
              <div>
                <strong>Current View:</strong> ({Math.round(camera.x)}, {Math.round(camera.y)}) @ {camera.zoom.toFixed(1)}x zoom
              </div>
              <div>
                <strong>Garden:</strong> {plant.gardenId || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px'
        }}>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this plant? This will also delete all associated notes.')) {
                onDelete();
                onClose();
              }
            }}
            style={{
              padding: '14px 28px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
          >
            🗑️ Delete Plant
          </button>
          
          <button
            onClick={handleSave}
            disabled={!formData.species.trim()}
            style={{
              padding: '14px 28px',
              backgroundColor: formData.species.trim() ? 'rgba(34, 197, 94, 0.9)' : 'rgba(156, 163, 175, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: formData.species.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              if (formData.species.trim()) {
                e.target.style.backgroundColor = 'rgba(34, 197, 94, 1)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.species.trim()) {
                e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
              }
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Right Panel - Notes Timeline */}
      <div style={{
        flex: 1,
        backgroundColor: '#f7f4f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with Tabs */}
        <div style={{
          padding: '48px 48px 0 48px',
          backgroundColor: '#faf8f4'
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '32px',
            fontWeight: '400',
            color: '#5d4e37',
            textAlign: 'center'
          }}>
            Plant Data
          </h2>
          
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              border: '1px solid #e5ddd0'
            }}>
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'notes' ? '#8b7355' : 'transparent',
                  color: activeTab === 'notes' ? '#f8f5f0' : '#8b7355',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  fontWeight: activeTab === 'notes' ? '500' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                📝 Journal
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'measurements' ? '#8b7355' : 'transparent',
                  color: activeTab === 'measurements' ? '#f8f5f0' : '#8b7355',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  fontWeight: activeTab === 'measurements' ? '500' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                📊 Measurements
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'notes' && (
          <>
            {/* Add Note Section */}
        <div style={{
          padding: '32px 48px',
          borderBottom: '1px solid #e5ddd0',
          backgroundColor: '#fefcf8'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What did you observe today? How is your plant growing? Record any care activities, changes, or thoughts..."
              rows={4}
              style={{
                width: '100%',
                padding: '20px 24px',
                border: '2px solid #e5ddd0',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#5d4e37',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.6',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b7355';
                e.target.style.boxShadow = '0 0 0 4px rgba(139, 115, 85, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5ddd0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: newNote.trim() ? '#8b7355' : '#d1c7b7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (newNote.trim()) {
                  e.target.style.backgroundColor = '#6d5a42';
                }
              }}
              onMouseLeave={(e) => {
                if (newNote.trim()) {
                  e.target.style.backgroundColor = '#8b7355';
                }
              }}
            >
              📝 Add Note
            </button>
          </div>
        </div>

        {/* Notes Timeline */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 48px'
        }}>
          {notesLoading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#8b7355',
              fontSize: '18px'
            }}>
              Loading your plant journal...
            </div>
          )}

          {!notesLoading && notes.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 40px',
              color: '#a69688'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '400', color: '#8b7355' }}>
                Start Your Plant Journal
              </h3>
              <p style={{ margin: 0, fontSize: '16px', fontStyle: 'italic' }}>
                Document your plant's growth journey, care activities, and observations
              </p>
            </div>
          )}

          {/* Timeline Items */}
          <div style={{ position: 'relative' }}>
            {/* Timeline Line */}
            {notes.length > 0 && (
              <div style={{
                position: 'absolute',
                left: '24px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                backgroundColor: '#d1c7b7'
              }} />
            )}

            {notes.map((note, index) => (
              <div key={note.id} style={{
                position: 'relative',
                paddingLeft: '64px',
                marginBottom: '32px'
              }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#8b7355' : '#d1c7b7',
                  border: '3px solid #f7f4f0',
                  zIndex: 1
                }} />

                {/* Note Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5ddd0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.boxShadow = 'none'}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  {editingNoteId === note.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        rows={4}
                        style={{
                          padding: '16px',
                          border: '2px solid #e5ddd0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                          lineHeight: '1.6',
                          color: '#5d4e37'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={handleSaveNoteEdit}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteText('');
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#5d4e37', 
                        lineHeight: '1.7',
                        marginBottom: '16px'
                      }}>
                        {note.text}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderTop: '1px solid #f0ede8',
                        paddingTop: '12px'
                      }}>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#a69688',
                          fontStyle: 'italic'
                        }}>
                          {formatDate(note.createdAt)}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => handleEditNote(note)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8b7355',
                              cursor: 'pointer',
                              fontSize: '14px',
                              padding: '4px 8px',
                              fontFamily: 'inherit'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              fontSize: '14px',
                              padding: '4px 8px',
                              fontFamily: 'inherit'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <>
            {/* Add Measurement Section */}
            <div style={{
              padding: '32px 48px',
              borderBottom: '1px solid #e5ddd0',
              backgroundColor: '#fefcf8'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#5d4e37'
                }}>
                  Add New Measurements
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {[
                    { key: 'light', label: 'Light Level', unit: 'lux' },
                    { key: 'moisture', label: 'Soil Moisture', unit: '%' },
                    { key: 'soil_ph', label: 'Soil pH', unit: 'pH' },
                    { key: 'temp', label: 'Temperature', unit: '°F' }
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#5d4e37',
                        marginBottom: '4px'
                      }}>
                        {label} ({unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement[key]}
                        onChange={(e) => setNewMeasurement({
                          ...newMeasurement,
                          [key]: e.target.value
                        })}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5ddd0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          color: '#5d4e37',
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8b7355';
                          e.target.style.boxShadow = '0 0 0 4px rgba(139, 115, 85, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5ddd0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Custom Date/Time Inputs */}
                <div style={{ 
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#5d4e37',
                      marginBottom: '4px'
                    }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5ddd0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#5d4e37',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8b7355';
                        e.target.style.boxShadow = '0 0 0 4px rgba(139, 115, 85, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5ddd0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#5d4e37',
                      marginBottom: '4px'
                    }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5ddd0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#5d4e37',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8b7355';
                        e.target.style.boxShadow = '0 0 0 4px rgba(139, 115, 85, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5ddd0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={handleAddMeasurement}
                  disabled={!Object.values(newMeasurement).some(v => v.trim() !== '')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: Object.values(newMeasurement).some(v => v.trim() !== '') ? '#8b7355' : '#d1c7b7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: Object.values(newMeasurement).some(v => v.trim() !== '') ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (Object.values(newMeasurement).some(v => v.trim() !== '')) {
                      e.target.style.backgroundColor = '#6d5a42';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (Object.values(newMeasurement).some(v => v.trim() !== '')) {
                      e.target.style.backgroundColor = '#8b7355';
                    }
                  }}
                >
                  📊 Add Measurement
                </button>
              </div>
            </div>

            {/* Measurements Timeline */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '32px 48px'
            }}>
              {measurementsLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  color: '#8b7355',
                  fontSize: '18px'
                }}>
                  Loading measurements...
                </div>
              )}

              {!measurementsLoading && measurements.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px',
                  color: '#a69688'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '400', color: '#8b7355' }}>
                    Start Recording Measurements
                  </h3>
                  <p style={{ margin: 0, fontSize: '16px', fontStyle: 'italic' }}>
                    Track your plant's environmental conditions and growth metrics
                  </p>
                </div>
              )}

              {/* Measurements List */}
              <div style={{ position: 'relative' }}>
                {/* Timeline Line */}
                {measurements.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: '24px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    backgroundColor: '#d1c7b7'
                  }} />
                )}

                {measurements.map((measurement, index) => (
                  <div key={measurement.id} style={{
                    position: 'relative',
                    paddingLeft: '64px',
                    marginBottom: '32px'
                  }}>
                    {/* Timeline Dot */}
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '8px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#8b7355' : '#d1c7b7',
                      border: '3px solid #f7f4f0',
                      zIndex: 1
                    }} />

                    {/* Measurement Card */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5ddd0',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      {editingMeasurementId === measurement.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px'
                          }}>
                            {[
                              { key: 'light', label: 'Light Level', unit: 'lux' },
                              { key: 'moisture', label: 'Soil Moisture', unit: '%' },
                              { key: 'soil_ph', label: 'Soil pH', unit: 'pH' },
                              { key: 'temp', label: 'Temperature', unit: '°F' }
                            ].map(({ key, label, unit }) => (
                              <div key={key}>
                                <label style={{
                                  display: 'block',
                                  fontSize: '12px',
                                  color: '#8b7355',
                                  marginBottom: '4px'
                                }}>
                                  {label} ({unit})
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editingMeasurementData[key]}
                                  onChange={(e) => setEditingMeasurementData({
                                    ...editingMeasurementData,
                                    [key]: e.target.value
                                  })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #e5ddd0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    color: '#5d4e37',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={handleSaveMeasurementEdit}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingMeasurementId(null);
                                setEditingMeasurementData({ light: '', moisture: '', soil_ph: '', temp: '' });
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                            marginBottom: '16px'
                          }}>
                            {[
                              { key: 'light', label: 'Light Level', unit: 'lux' },
                              { key: 'moisture', label: 'Soil Moisture', unit: '%' },
                              { key: 'soil_ph', label: 'Soil pH', unit: 'pH' },
                              { key: 'temp', label: 'Temperature', unit: '°F' }
                            ].map(({ key, label, unit }) => (
                              <div key={key} style={{
                                backgroundColor: measurement[key] !== null ? '#f0ede8' : '#fafafa',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e5ddd0'
                              }}>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#8b7355',
                                  marginBottom: '4px',
                                  fontWeight: '500'
                                }}>
                                  {label}
                                </div>
                                <div style={{
                                  fontSize: '18px',
                                  color: measurement[key] !== null ? '#5d4e37' : '#a69688',
                                  fontWeight: '500'
                                }}>
                                  {measurement[key] !== null ? `${measurement[key]} ${unit}` : '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #f0ede8',
                            paddingTop: '12px'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              color: '#a69688',
                              fontStyle: 'italic'
                            }}>
                              {formatDate(measurement.createdAt)}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                onClick={() => handleEditMeasurement(measurement)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#8b7355',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '4px 8px',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMeasurement(measurement.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '4px 8px',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlantDetails;