"use client";

import { useRef, useState, useEffect, MouseEvent, WheelEvent } from "react";

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Person {
  id: number;
  name: string;
  x: number;
  y: number;
  wikipedia_url: string | null;
}

export default function PoliticalCompass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: -12,
    y: -12,
    width: 24,
    height: 24,
  });

  const drawCompass = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas with background color
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the current state
    ctx.save();

    // Calculate the square size and centering
    const size = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    // Apply transformations for square aspect ratio
    ctx.translate(offsetX, offsetY);
    const scale = size / viewBox.width;
    ctx.scale(scale, scale);
    ctx.translate(-viewBox.x, -viewBox.y);

    // Draw quadrants with muted colors
    // Top-left (Authoritarian Left) - Muted Red
    ctx.fillStyle = "#ef9a9a";
    ctx.fillRect(-10, -10, 10, 10);

    // Top-right (Authoritarian Right) - Muted Blue
    ctx.fillStyle = "#90caf9";
    ctx.fillRect(0, -10, 10, 10);

    // Bottom-left (Libertarian Left) - Muted Green
    ctx.fillStyle = "#a5d6a7";
    ctx.fillRect(-10, 0, 10, 10);

    // Bottom-right (Libertarian Right) - Muted Yellow
    ctx.fillStyle = "#fff59d";
    ctx.fillRect(0, 0, 10, 10);

    // Draw grid
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5 / scale;
    
    // Vertical grid lines
    for (let x = -10; x <= 10; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.lineTo(x, 10);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = -10; y <= 10; y += 1) {
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.lineTo(10, y);
      ctx.stroke();
    }

    // Draw main axes
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = "#333";
    ctx.font = `${16 / scale}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Axis labels
    ctx.fillText("Authoritarian", 0, -11);
    ctx.fillText("Libertarian", 0, 11);
    ctx.textAlign = "right";
    ctx.fillText("Left", -11, 0);
    ctx.textAlign = "left";
    ctx.fillText("Right", 11, 0);

    // Add axis values
    ctx.font = `${10 / scale}px Arial`;
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    // X-axis values
    for (let x = -10; x <= 10; x += 5) {
      if (x !== 0) {
        ctx.fillText(x.toString(), x, 0.2);
      }
    }
    
    // Y-axis values
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let y = -10; y <= 10; y += 5) {
      if (y !== 0) {
        ctx.fillText((-y).toString(), 0.2, y); // Negative because canvas Y is inverted
      }
    }

    // Restore the state before drawing people
    ctx.restore();
    
    // Draw people on top with fresh context
    ctx.save();
    
    // Apply the same transformations for people
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-viewBox.x, -viewBox.y);
    
    people.forEach((person) => {
      // Draw the red dot
      ctx.fillStyle = "#dc2626";
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 2 / scale;
      
      // Canvas Y is inverted, so negate person.y
      ctx.beginPath();
      ctx.arc(person.x, -person.y, 6 / scale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw the name above the dot
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold ${14 / scale}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(person.name, person.x, -person.y - 10 / scale);
    });

    // Restore the state
    ctx.restore();
  };

  // Fetch people from API
  useEffect(() => {
    fetch('/api/people')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched people:', data);
        setPeople(data);
      })
      .catch(err => console.error('Failed to fetch people:', err));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawCompass(ctx);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [viewBox, people]);

  const getMouseCoordinates = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the square size and centering
    const size = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    // Check if mouse is within the square compass area
    if (x < offsetX || x > offsetX + size || y < offsetY || y > offsetY + size) {
      return null;
    }

    // Convert to compass coordinates
    const relX = (x - offsetX) / size;
    const relY = (y - offsetY) / size;
    const compassX = viewBox.x + relX * viewBox.width;
    const compassY = -(viewBox.y + relY * viewBox.height); // Invert Y for compass coordinates

    // Only return coordinates if within the -10 to 10 range
    if (compassX >= -10 && compassX <= 10 && compassY >= -10 && compassY <= 10) {
      return { x: compassX, y: compassY };
    }
    return null;
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the square size and centering
    const size = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    // Convert to compass coordinates
    const relX = (x - offsetX) / size;
    const relY = (y - offsetY) / size;
    const compassX = viewBox.x + relX * viewBox.width;
    const compassY = -(viewBox.y + relY * viewBox.height);

    // Check if click is on a person
    const scale = size / viewBox.width;
    const pixelRadius = 6; // Same as visual radius
    const clickRadius = (pixelRadius * 1.5) / scale; // Convert pixel radius to world units
    const clickedPerson = people.find(person => {
      const distance = Math.sqrt(
        Math.pow(person.x - compassX, 2) + 
        Math.pow(person.y - compassY, 2)
      );
      return distance <= clickRadius;
    });

    if (clickedPerson) {
      setSelectedPerson(clickedPerson);
      setClickPosition({ x: e.clientX, y: e.clientY });
    } else {
      setSelectedPerson(null);
      setClickPosition(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoordinates(e);
    setMouseCoords(coords);

    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const size = Math.min(canvas.width, canvas.height);
    const scale = viewBox.width / size;

    let newX = viewBox.x - dx * scale;
    let newY = viewBox.y - dy * scale;

    // Calculate bounds to keep the map visible
    const mapSize = 20; // The map spans from -10 to 10
    const halfViewWidth = viewBox.width / 2;
    const halfViewHeight = viewBox.height / 2;
    
    // Only apply constraints when zoomed out enough to see the whole map
    if (viewBox.width >= mapSize) {
      // Center the map when fully zoomed out
      newX = -halfViewWidth;
      newY = -halfViewHeight;
    } else {
      // When zoomed in, limit panning to keep some part of the map visible
      const minX = -10 - halfViewWidth;
      const maxX = 10 - halfViewWidth;
      const minY = -10 - halfViewHeight;
      const maxY = 10 - halfViewHeight;
      
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
    }

    setViewBox({
      ...viewBox,
      x: newX,
      y: newY,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setMouseCoords(null);
  };

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const size = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

    // Calculate the point in viewBox coordinates
    const relX = (x - offsetX) / size;
    const relY = (y - offsetY) / size;
    const viewX = viewBox.x + relX * viewBox.width;
    const viewY = viewBox.y + relY * viewBox.height;

    // Apply zoom
    let newWidth = viewBox.width * zoomFactor;
    let newHeight = viewBox.height * zoomFactor;

    // Enforce minimum zoom (map should not be smaller than screen)
    const maxWidth = 24; // This ensures the map fills the screen when centered
    const minWidth = 2; // This allows zooming in quite close
    
    newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    newHeight = Math.min(Math.max(newHeight, minWidth), maxWidth);

    // Keep the zoom point fixed
    let newX = viewX - relX * newWidth;
    let newY = viewY - relY * newHeight;

    // Apply the same panning constraints
    const mapSize = 20;
    const halfViewWidth = newWidth / 2;
    const halfViewHeight = newHeight / 2;
    
    if (newWidth >= mapSize) {
      // Center the map when fully zoomed out
      newX = -halfViewWidth;
      newY = -halfViewHeight;
    } else {
      // When zoomed in, limit panning to keep some part of the map visible
      const minX = -10 - halfViewWidth;
      const maxX = 10 - halfViewWidth;
      const minY = -10 - halfViewHeight;
      const maxY = 10 - halfViewHeight;
      
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
    }

    setViewBox({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <div className="relative w-full h-full">
      {mouseCoords && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow-md z-10">
          <span className="font-mono text-sm">
            X: {mouseCoords.x.toFixed(2)}, Y: {mouseCoords.y.toFixed(2)}
          </span>
        </div>
      )}
      
      {selectedPerson && clickPosition && (
        <div 
          className="absolute bg-white p-3 rounded shadow-lg z-20 min-w-[200px]"
          style={{
            left: `${clickPosition.x}px`,
            top: `${clickPosition.y + 10}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold text-sm">{selectedPerson.name}</div>
          <div className="text-xs text-gray-600 mt-1">
            Position: ({selectedPerson.x}, {selectedPerson.y})
          </div>
          {selectedPerson.wikipedia_url && (
            <a 
              href={selectedPerson.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs mt-2 inline-block"
            >
              View on Wikipedia →
            </a>
          )}
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
    </div>
  );
}