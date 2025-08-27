import React, { useRef, useState, useEffect } from "react";
import Button from "./components/Button";
import Box from "./components/Box";
import Heading from "./components/Heading";
import FileUpload from "./components/FileUpload";
import colors from "./constants/colors";
import "./ImageEditor.css";

export default function ImageEditor() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState([]);
  const [drawingColor, setDrawingColor] = useState(colors.drawingColors[0]);
  const [brushSize, setBrushSize] = useState(3);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropFrame, setCropFrame] = useState(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragCropOffset, setDragCropOffset] = useState({ x: 0, y: 0 });
  const [resizingCropHandle, setResizingCropHandle] = useState(null);

  // Undo/Redo state
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [notification, setNotification] = useState('');

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Save state snapshot
  const saveState = () => {
    const snapshot = {
      lines: JSON.parse(JSON.stringify(lines)),
      imageSrc: image ? image.src : null,
    };
    setHistory((prev) => [...prev, snapshot]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [
      ...prev,
      { lines, imageSrc: image ? image.src : null },
    ]);
    setLines(last.lines);
    if (last.imageSrc) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = last.imageSrc;
    } else {
      setImage(null);
    }
    setHistory((prev) => prev.slice(0, -1));
    showNotification('Undo');
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setHistory((prev) => [
      ...prev,
      { lines, imageSrc: image ? image.src : null },
    ]);
    setLines(last.lines);
    if (last.imageSrc) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = last.imageSrc;
    } else {
      setImage(null);
    }
    setRedoStack((prev) => prev.slice(0, -1));
    showNotification('Redo');
  };

  // Load uploaded image
  const handleUpload = (file) => {
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      showNotification('Please select an image file');
      return;
    }
    
    saveState();
    const img = new Image();
    img.onload = () => {
      setImage(img);
      showNotification('Image loaded successfully!');
    };
    img.src = URL.createObjectURL(file);
  };

  // Toggle drawing mode
  const toggleDrawing = () => {
    setDrawMode(!drawMode);
    setCropMode(false);
    showNotification(drawMode ? 'Drawing disabled' : 'Drawing enabled');
  };

  // Toggle crop mode
  const toggleCrop = () => {
    if (!cropMode) {
      setCropFrame({ x: 50, y: 50, w: 200, h: 200 });
      setCropMode(true);
      setDrawMode(false);
      showNotification('Crop mode enabled - drag edges to resize');
    } else {
      setCropMode(false);
      setCropFrame(null);
      showNotification('Crop mode disabled');
    }
  };

  // Apply crop
  const applyCrop = () => {
    if (!cropFrame || !image) {
      showNotification('Please upload an image first');
      return;
    }
    saveState();
    const canvas = document.createElement("canvas");
    canvas.width = cropFrame.w;
    canvas.height = cropFrame.h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      (cropFrame.x / 800) * image.width,
      (cropFrame.y / 600) * image.height,
      (cropFrame.w / 800) * image.width,
      (cropFrame.h / 600) * image.height,
      0,
      0,
      cropFrame.w,
      cropFrame.h
    );
    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      showNotification('Image cropped successfully!');
    };
    newImg.src = canvas.toDataURL();
    setCropMode(false);
    setCropFrame(null);
  };

  // Get 8 resize handles
  const getHandles = (obj) => {
    const { x, y, w, h } = obj;
    return [
      { name: "nw", x, y },
      { name: "n", x: x + w / 2, y },
      { name: "ne", x: x + w, y },
      { name: "e", x: x + w, y: y + h / 2 },
      { name: "se", x: x + w, y: y + h },
      { name: "s", x: x + w / 2, y: y + h },
      { name: "sw", x, y: y + h },
      { name: "w", x, y: y + h / 2 },
    ];
  };

  // Mouse down handler
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (drawMode) {
      setIsDrawing(true);
      setCurrentLine([{ x: mouseX, y: mouseY }]);
      return;
    }

    if (cropMode && cropFrame) {
      const handle = getHandles(cropFrame).find(
        (h) => Math.abs(h.x - mouseX) < 6 && Math.abs(h.y - mouseY) < 6
      );
      if (handle) {
        setResizingCropHandle(handle.name);
        return;
      }
      if (
        mouseX > cropFrame.x &&
        mouseX < cropFrame.x + cropFrame.w &&
        mouseY > cropFrame.y &&
        mouseY < cropFrame.y + cropFrame.h
      ) {
        setIsDraggingCrop(true);
        setDragCropOffset({ x: mouseX - cropFrame.x, y: mouseY - cropFrame.y });
        return;
      }
    }
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (drawMode && isDrawing) {
      setCurrentLine((prev) => [...prev, { x: mouseX, y: mouseY }]);
      return;
    }

    if (resizingCropHandle && cropFrame) {
      setCropFrame((prev) => resizeObj(prev, resizingCropHandle, mouseX, mouseY));
      return;
    }
    if (isDraggingCrop && cropFrame) {
      setCropFrame((prev) => ({
        ...prev,
        x: mouseX - dragCropOffset.x,
        y: mouseY - dragCropOffset.y,
      }));
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (drawMode && isDrawing) {
      saveState();
      setLines((prev) => [...prev, {points: currentLine, color: drawingColor, size: brushSize}]);
      setCurrentLine([]);
      setIsDrawing(false);
    }
    setIsDraggingCrop(false);
    setResizingCropHandle(null);
  };

  // Resize helper
  const resizeObj = (obj, handle, mx, my) => {
    let { x, y, w, h } = obj;
    switch (handle) {
      case "nw":
        w = w + (x - mx);
        h = h + (y - my);
        x = mx;
        y = my;
        break;
      case "n":
        h = h + (y - my);
        y = my;
        break;
      case "ne":
        w = mx - x;
        h = h + (y - my);
        y = my;
        break;
      case "e":
        w = mx - x;
        break;
      case "se":
        w = mx - x;
        h = my - y;
        break;
      case "s":
        h = my - y;
        break;
      case "sw":
        w = w + (x - mx);
        h = my - y;
        x = mx;
        break;
      case "w":
        w = w + (x - mx);
        x = mx;
        break;
    }
    return { ...obj, x, y, w, h };
  };

  // Draw everything on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = colors.canvasBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colors.placeholder;
      ctx.textAlign = 'center';
      ctx.font = '20px Arial';
      ctx.fillText('Upload an image to start editing', canvas.width/2, canvas.height/2);
    }

    // Draw freehand lines
    lines.forEach(line => {
      ctx.beginPath();
      line.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = line.color || 'black';
      ctx.lineWidth = line.size || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    // Draw current line if drawing
    if (isDrawing && currentLine.length > 0) {
      ctx.beginPath();
      currentLine.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw crop frame
    if (cropMode && cropFrame) {
      ctx.strokeStyle = colors.cropFrame;
      ctx.lineWidth = 2;
      ctx.strokeRect(cropFrame.x, cropFrame.y, cropFrame.w, cropFrame.h);

      const handles = getHandles(cropFrame);
      ctx.fillStyle = colors.cropFrame;
      handles.forEach((h) => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [image, cropMode, cropFrame, lines, currentLine, isDrawing, drawingColor, brushSize]);

  return (
    <div className="editor-container">
      <div className="toolbar">
        <Box title="Upload Image" icon="fas fa-upload">
          <FileUpload onFileSelect={handleUpload} accept="image/*" />
        </Box>
        
        <Box title="Drawing Tools" icon="fas fa-pen">
          <Button 
            onClick={toggleDrawing} 
            type={drawMode ? "success" : "primary"}
            icon="fas fa-pen"
          >
            {drawMode ? 'Drawing Active' : 'Enable Drawing'}
          </Button>
          
          {drawMode && (
            <div className="drawing-controls">
              <div className="color-picker">
                {colors.drawingColors.map(color => (
                  <div 
                    key={color}
                    className={`color-option ${drawingColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setDrawingColor(color)}
                  ></div>
                ))}
              </div>
              <div className="brush-size">
                <label>Brush Size: {brushSize}px</label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </Box>
        
        <Box title="Crop Tools" icon="fas fa-crop-alt">
          <Button 
            onClick={toggleCrop} 
            type={cropMode ? "success" : "upload"}
            icon="fas fa-crop-alt"
          >
            {cropMode ? 'Crop Active' : 'Enable Crop'}
          </Button>
          {cropMode && (
            <Button 
              onClick={applyCrop} 
              type="success"
              icon="fas fa-check"
            >
              Apply Crop
            </Button>
          )}
        </Box>
        
        <Box title="History" icon="fas fa-history">
          <div className="history-controls">
            <Button 
              onClick={handleUndo} 
              disabled={history.length === 0}
              type="info"
              icon="fas fa-undo"
              className="history-btn"
            >
              Undo
            </Button>
            <Button 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
              type="info"
              icon="fas fa-redo"
              className="history-btn"
            >
              Redo
            </Button>
          </div>
        </Box>
      </div>
      
      <div className="canvas-container">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: drawMode ? 'crosshair' : 'default' }}
          />
        </div>
      </div>
      
      <div className={`notification ${notification ? 'show' : ''}`}>
        <i className="fas fa-info-circle"></i> {notification}
      </div>
    </div>
  );
}