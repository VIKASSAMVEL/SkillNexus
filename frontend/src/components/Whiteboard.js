import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Slider,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Brush,
  Clear,
  Undo,
  Redo,
  ColorLens,
  Save,
  Download,
  Palette
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CanvasContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
}));

const Canvas = styled('canvas')({
  display: 'block',
  cursor: 'crosshair',
  borderRadius: 4
});

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
}));

const ColorButton = styled(Button)(({ color, selected }) => ({
  minWidth: 32,
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: color,
  border: selected ? '2px solid #14B8A6' : '2px solid transparent',
  '&:hover': {
    border: '2px solid #14B8A6',
    transform: 'scale(1.1)'
  },
  transition: 'all 0.2s ease'
}));

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080'  // Gray
];

const Whiteboard = ({ socket, sessionId, isOpen, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current && isOpen) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Set initial canvas properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;

      // Save initial state
      saveToHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const saveToHistory = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL();

      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        return newHistory.slice(-20); // Keep only last 20 states
      });
      setHistoryIndex(prev => Math.min(prev + 1, 19));
    }
  }, [historyIndex]);

  const restoreFromHistory = useCallback((index) => {
    if (canvasRef.current && history[index]) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };

      img.src = history[index];
    }
  }, [history]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLastPos(pos);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [getMousePos]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');

      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Send drawing data to other participants
      if (socket) {
        socket.emit('whiteboard-draw', {
          sessionId,
          fromX: lastPos.x,
          fromY: lastPos.y,
          toX: pos.x,
          toY: pos.y,
          color,
          width: brushSize
        });
      }
    }

    setLastPos(pos);
  }, [isDrawing, lastPos, getMousePos, socket, sessionId, color, brushSize]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory();

      // Notify other participants
      if (socket) {
        socket.emit('whiteboard-clear', { sessionId });
      }
    }
  }, [saveToHistory, socket, sessionId]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      restoreFromHistory(historyIndex - 1);
    }
  }, [historyIndex, restoreFromHistory]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      restoreFromHistory(historyIndex + 1);
    }
  }, [historyIndex, history.length, restoreFromHistory]);

  const downloadCanvas = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `whiteboard-${sessionId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  }, [sessionId]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setShowColorPicker(false);
  };

  if (!isOpen) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <ToolbarContainer>
        <Tooltip title="Brush Color">
          <IconButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            sx={{ color: color }}
          >
            <ColorLens />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{ minWidth: 60 }}>
          Size: {brushSize}
        </Typography>
        <Slider
          value={brushSize}
          onChange={(e, newValue) => setBrushSize(newValue)}
          min={1}
          max={20}
          sx={{ width: 100, mx: 1 }}
        />

        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={undo}
              disabled={historyIndex <= 0}
              sx={{ color: historyIndex <= 0 ? '#94A3B8' : '#14B8A6' }}
            >
              <Undo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo">
          <span>
            <IconButton
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              sx={{ color: historyIndex >= history.length - 1 ? '#94A3B8' : '#14B8A6' }}
            >
              <Redo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear Canvas">
          <IconButton onClick={clearCanvas} sx={{ color: '#EF4444' }}>
            <Clear />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download">
          <IconButton onClick={downloadCanvas} sx={{ color: '#14B8A6' }}>
            <Download />
          </IconButton>
        </Tooltip>
      </ToolbarContainer>

      {/* Color Picker Dialog */}
      <Dialog
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#0F766E', color: '#E2E8F0' }}>
          Choose Color
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1A2332', p: 3 }}>
          <Grid container spacing={1}>
            {COLORS.map((colorOption) => (
              <Grid item key={colorOption}>
                <ColorButton
                  color={colorOption}
                  selected={color === colorOption}
                  onClick={() => handleColorChange(colorOption)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1A2332' }}>
          <Button
            onClick={() => setShowColorPicker(false)}
            sx={{ color: '#94A3B8' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Canvas */}
      <Box sx={{ flex: 1, p: 2 }}>
        <CanvasContainer>
          <Canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400
            }}
          />
        </CanvasContainer>
      </Box>

      {/* Instructions */}
      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center' }}>
          Click and drag to draw. Use the toolbar to change colors and brush size.
          All changes are synchronized in real-time with other participants.
        </Typography>
      </Box>
    </Box>
  );
};

export default Whiteboard;