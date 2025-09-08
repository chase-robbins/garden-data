import { useRef, useEffect, useState } from 'react';
import { usePlants } from '../hooks/usePlants';
import { useLines } from '../hooks/useLines';

const GardenCanvas = ({ garden }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('pan'); // 'pan', 'plant', 'line'
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState(null);
  const [currentLineEnd, setCurrentLineEnd] = useState(null);
  const [plantFormData, setPlantFormData] = useState({
    species: '',
    color: '#4CAF50',
    x: 0,
    y: 0
  });

  const { plants, loading, addPlant, updatePlant, deletePlant } = usePlants(garden?.id);
  const { lines, loading: linesLoading, addLine, updateLine, deleteLine } = useLines(garden?.id);

  const PLANT_RADIUS = 8;
  const GRID_SIZE = 40;

  // Check if we should show loading state (only for data loading, not canvas size)
  const shouldShowLoading = loading || linesLoading;

  // Use fallback dimensions if container size isn't detected yet
  const effectiveCanvasSize = canvasSize.width === 0 || canvasSize.height === 0 
    ? { width: 800, height: 600 } 
    : canvasSize;
  

  // Canvas size detection - runs when container is actually rendered
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return false;
      
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: rect.width, height: rect.height });
        return true;
      }
      return false;
    };

    // Immediate check
    if (updateCanvasSize()) return;
    
    // Fallback with short delay
    const timeoutId = setTimeout(updateCanvasSize, 10);
    
    // ResizeObserver for ongoing updates
    let resizeObserver;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(containerRef.current);
    }
    
    // Window resize
    const handleResize = updateCanvasSize;
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldShowLoading]); // Re-run when loading state changes

  // Coordinate conversion functions
  const worldToScreen = (worldX, worldY) => {
    const screenX = (worldX - camera.x) * camera.zoom + effectiveCanvasSize.width / 2;
    const screenY = (worldY - camera.y) * camera.zoom + effectiveCanvasSize.height / 2;
    return { x: screenX, y: screenY };
  };

  const screenToWorld = (screenX, screenY) => {
    const worldX = (screenX - effectiveCanvasSize.width / 2) / camera.zoom + camera.x;
    const worldY = (screenY - effectiveCanvasSize.height / 2) / camera.zoom + camera.y;
    return { x: worldX, y: worldY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effectiveCanvasSize.width === 0 || effectiveCanvasSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#f0f8f0';
    ctx.fillRect(0, 0, effectiveCanvasSize.width, effectiveCanvasSize.height);
    
    // Save context for transformations
    ctx.save();

    // Calculate visible world bounds
    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(effectiveCanvasSize.width, effectiveCanvasSize.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / camera.zoom;
    
    // Calculate grid lines within visible area
    const gridSize = GRID_SIZE;
    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;
    const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;

    // Vertical grid lines
    for (let worldX = startX; worldX <= endX; worldX += gridSize) {
      const screen = worldToScreen(worldX, topLeft.y);
      const screenEnd = worldToScreen(worldX, bottomRight.y);
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screenEnd.x, screenEnd.y);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let worldY = startY; worldY <= endY; worldY += gridSize) {
      const screen = worldToScreen(topLeft.x, worldY);
      const screenEnd = worldToScreen(bottomRight.x, worldY);
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screenEnd.x, screenEnd.y);
      ctx.stroke();
    }


    // Draw lines
    lines.forEach(line => {
      const startScreen = worldToScreen(line.startX, line.startY);
      const endScreen = worldToScreen(line.endX, line.endY);
      
      ctx.strokeStyle = line.color || '#333333';
      ctx.lineWidth = (line.thickness || 2) * camera.zoom;
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(endScreen.x, endScreen.y);
      ctx.stroke();
    });

    // Draw current line being drawn
    if (isDrawingLine && lineStart && currentLineEnd) {
      const startScreen = worldToScreen(lineStart.x, lineStart.y);
      const endScreen = worldToScreen(currentLineEnd.x, currentLineEnd.y);
      
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2 * camera.zoom;
      ctx.setLineDash([5 * camera.zoom, 5 * camera.zoom]);
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(endScreen.x, endScreen.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
    }

    // Draw plants
    plants.forEach(plant => {
      const screenPos = worldToScreen(plant.x, plant.y);
      const screenRadius = PLANT_RADIUS * camera.zoom;
      
      // Only draw if plant is visible
      if (screenPos.x >= -screenRadius && screenPos.x <= effectiveCanvasSize.width + screenRadius &&
          screenPos.y >= -screenRadius && screenPos.y <= effectiveCanvasSize.height + screenRadius) {
        
        // Plant circle
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, 2 * Math.PI);
        ctx.fillStyle = plant.color;
        ctx.fill();
        ctx.strokeStyle = selectedPlant?.id === plant.id ? '#333' : '#666';
        ctx.lineWidth = (selectedPlant?.id === plant.id ? 3 : 1) * camera.zoom;
        ctx.stroke();

        // Plant label
        ctx.fillStyle = '#333';
        ctx.font = `${12 * camera.zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          plant.species || 'Unknown', 
          screenPos.x, 
          screenPos.y - screenRadius - 5 * camera.zoom
        );
      }
    });

    ctx.restore();

  }, [plants, lines, selectedPlant, effectiveCanvasSize, camera, isDrawingLine, lineStart, currentLineEnd]);

  const handleMouseDown = (event) => {
    if (event.button !== 0) return; // Only handle left mouse button
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    if (tool === 'plant') {
      // Add new plant
      setPlantFormData({
        species: '',
        color: '#4CAF50',
        x: worldPos.x,
        y: worldPos.y
      });
      setSelectedPlant(null);
      setShowPlantForm(true);
      return;
    }

    if (tool === 'line') {
      if (!isDrawingLine) {
        // Start drawing line
        setIsDrawingLine(true);
        setLineStart(worldPos);
        setCurrentLineEnd(worldPos);
      } else {
        // Finish drawing line
        const newLine = {
          startX: lineStart.x,
          startY: lineStart.y,
          endX: worldPos.x,
          endY: worldPos.y,
          color: '#333333',
          thickness: 2
        };
        
        addLine(newLine);
        setIsDrawingLine(false);
        setLineStart(null);
        setCurrentLineEnd(null);
      }
      return;
    }

    // Check if clicking on existing plant (only in pan mode)
    if (tool === 'pan') {
      const clickedPlant = plants.find(plant => {
        const distance = Math.sqrt((worldPos.x - plant.x) ** 2 + (worldPos.y - plant.y) ** 2);
        return distance <= PLANT_RADIUS;
      });

      if (clickedPlant) {
        setSelectedPlant(clickedPlant);
        setPlantFormData({
          species: clickedPlant.species,
          color: clickedPlant.color,
          x: clickedPlant.x,
          y: clickedPlant.y
        });
        setShowPlantForm(true);
        return;
      }
    }

    // Start dragging for pan (only in pan mode)
    if (tool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: screenX, y: screenY });
      setLastMousePos({ x: screenX, y: screenY });
      setSelectedPlant(null);
      setShowPlantForm(false);
    }
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Update line drawing preview
    if (isDrawingLine && tool === 'line') {
      setCurrentLineEnd(worldPos);
    }

    // Handle panning
    if (isDragging && tool === 'pan') {
      const deltaX = screenX - lastMousePos.x;
      const deltaY = screenY - lastMousePos.y;

      setCamera(prev => ({
        ...prev,
        x: prev.x - deltaX / prev.zoom,
        y: prev.y - deltaY / prev.zoom
      }));

      setLastMousePos({ x: screenX, y: screenY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Get world position before zoom
    const worldPosBeforeZoom = screenToWorld(screenX, screenY);
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, camera.zoom * zoomFactor));
    
    // Calculate new camera position to keep the mouse point fixed
    const newCamera = { ...camera, zoom: newZoom };
    const worldPosAfterZoom = {
      x: (screenX - effectiveCanvasSize.width / 2) / newZoom + newCamera.x,
      y: (screenY - effectiveCanvasSize.height / 2) / newZoom + newCamera.y
    };
    
    setCamera({
      x: newCamera.x + (worldPosBeforeZoom.x - worldPosAfterZoom.x),
      y: newCamera.y + (worldPosBeforeZoom.y - worldPosAfterZoom.y),
      zoom: newZoom
    });
  };

  const handleSavePlant = async () => {
    try {
      if (selectedPlant) {
        // Update existing plant
        await updatePlant(selectedPlant.id, {
          species: plantFormData.species,
          color: plantFormData.color,
          x: plantFormData.x,
          y: plantFormData.y
        });
      } else {
        // Add new plant
        await addPlant({
          species: plantFormData.species,
          color: plantFormData.color,
          x: plantFormData.x,
          y: plantFormData.y
        });
      }
      setShowPlantForm(false);
      setSelectedPlant(null);
      setPlantFormData({ species: '', color: '#4CAF50', x: 0, y: 0 });
    } catch (error) {
      console.error('Error saving plant:', error);
    }
  };

  const handleDeletePlant = async () => {
    if (selectedPlant && window.confirm('Are you sure you want to delete this plant?')) {
      try {
        await deletePlant(selectedPlant.id);
        setShowPlantForm(false);
        setSelectedPlant(null);
      } catch (error) {
        console.error('Error deleting plant:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowPlantForm(false);
    setSelectedPlant(null);
    setIsAddingPlant(false);
    setPlantFormData({ species: '', color: '#4CAF50', x: 0, y: 0 });
  };

  if (shouldShowLoading) {
    
    return (
      <div style={{ 
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f7fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#4a5568'
      }}>
        Loading garden map...
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#718096', textAlign: 'center', flexDirection: 'column', display: 'flex', gap: '5px' }}>
          <div>Plants: {loading ? 'loading...' : 'ready'}, Lines: {linesLoading ? 'loading...' : 'ready'}</div>
          <div>Canvas: {canvasSize.width}x{canvasSize.height}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: '70px', // Header height
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f7fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '1rem 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Tool Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>Tools:</span>
          <button
            onClick={() => {
              setTool('pan');
              setIsDrawingLine(false);
              setLineStart(null);
              setCurrentLineEnd(null);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: tool === 'pan' ? '#4a5568' : '#e2e8f0',
              color: tool === 'pan' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            🖐️ Pan
          </button>
          <button
            onClick={() => {
              setTool('plant');
              setIsDrawingLine(false);
              setLineStart(null);
              setCurrentLineEnd(null);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: tool === 'plant' ? '#4CAF50' : '#e2e8f0',
              color: tool === 'plant' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            🌱 Plant
          </button>
          <button
            onClick={() => {
              setTool('line');
              setIsDrawingLine(false);
              setLineStart(null);
              setCurrentLineEnd(null);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: tool === 'line' ? '#3b82f6' : '#e2e8f0',
              color: tool === 'line' ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            📏 Line
          </button>
        </div>

        {/* Tool Instructions */}
        {tool === 'plant' && (
          <span style={{ color: '#718096', fontSize: '14px' }}>
            Click on the canvas to place a new plant
          </span>
        )}
        {tool === 'line' && !isDrawingLine && (
          <span style={{ color: '#718096', fontSize: '14px' }}>
            Click to start drawing a line
          </span>
        )}
        {tool === 'line' && isDrawingLine && (
          <span style={{ color: '#3b82f6', fontSize: '14px' }}>
            Click to finish the line
          </span>
        )}
        {tool === 'pan' && (
          <span style={{ color: '#718096', fontSize: '14px' }}>
            Drag to pan • Scroll to zoom • Click plants to edit
          </span>
        )}
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset View
          </button>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            ({Math.round(camera.x)}, {Math.round(camera.y)}) | {camera.zoom.toFixed(1)}x
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: '400px',
          minWidth: '400px'
        }}
      >
        <canvas
          ref={canvasRef}
          width={effectiveCanvasSize.width}
          height={effectiveCanvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ 
            cursor: tool === 'plant' ? 'crosshair' : 
                   tool === 'line' ? 'crosshair' :
                   isDragging ? 'grabbing' : 'grab',
            display: 'block',
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      {showPlantForm && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          padding: '1.5rem',
          minWidth: '300px',
          zIndex: 100
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
            {selectedPlant ? 'Edit Plant' : 'Add New Plant'}
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '0.5rem' }}>
              Species
            </label>
            <input
              type="text"
              value={plantFormData.species}
              onChange={(e) => setPlantFormData({ ...plantFormData, species: e.target.value })}
              placeholder="e.g. Tomato, Basil, Rose..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '0.5rem' }}>
              Color
            </label>
            <input
              type="color"
              value={plantFormData.color}
              onChange={(e) => setPlantFormData({ ...plantFormData, color: e.target.value })}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '0.5rem' }}>
              World Position: ({Math.round(plantFormData.x)}, {Math.round(plantFormData.y)})
            </div>
            <div style={{ fontSize: '12px', color: '#a0aec0' }}>
              Camera: ({Math.round(camera.x)}, {Math.round(camera.y)}) | Zoom: {camera.zoom.toFixed(1)}x
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {selectedPlant && (
              <button
                onClick={handleDeletePlant}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            )}
            <button
              onClick={handleCancel}
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
              onClick={handleSavePlant}
              disabled={!plantFormData.species.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: plantFormData.species.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                opacity: plantFormData.species.trim() ? 1 : 0.6
              }}
            >
              {selectedPlant ? 'Update' : 'Add'} Plant
            </button>
          </div>
        </div>
      )}

      {showPlantForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 99
          }}
          onClick={handleCancel}
        />
      )}
    </div>
  );
};

export default GardenCanvas;