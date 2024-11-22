import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import { io } from "socket.io-client";

// Initialize the WebSocket connection
const socket = io("http://localhost:3000");

const CollaborativeCanvas = () => {
  const [shapes, setShapes] = useState([]); // State for shapes on the canvas

  // Load and sync shapes with the server
  useEffect(() => {
    const handleLoadCanvas = (serverShapes) => setShapes(serverShapes);
    const handleUpdateCanvas = (newShapes) => setShapes(newShapes);

    socket.on("load-canvas", handleLoadCanvas);
    socket.on("update-canvas", handleUpdateCanvas);

    // Cleanup listeners on unmount
    return () => {
      socket.off("load-canvas", handleLoadCanvas);
      socket.off("update-canvas", handleUpdateCanvas);
    };
  }, []);

  // Update the position of a shape after dragging
  const handleDragEnd = (index, event) => {
    const updatedShapes = [...shapes];
    updatedShapes[index] = {
      ...updatedShapes[index],
      x: event.target.x(),
      y: event.target.y(),
    };

    setShapes(updatedShapes); // Update local state
    socket.emit("update-canvas", updatedShapes); // Sync with the server
  };

  // Add a new rectangle to the canvas
  const addRectangle = () => {
    const updatedShapes = [
      ...shapes,
      { x: 50, y: 50, width: 100, height: 100, fill: "red" },
    ];
    updateCanvas(updatedShapes);
  };

  // Add a new circle to the canvas
  const addCircle = () => {
    const updatedShapes = [
      ...shapes,
      { x: 100, y: 100, radius: 50, fill: "green" },
    ];
    updateCanvas(updatedShapes);
  };

  // Update the local state and notify the server
  const updateCanvas = (newShapes) => {
    setShapes(newShapes);
    socket.emit("update-canvas", newShapes); // Sync with the server
  };

  // Render shapes based on their properties
  const renderShapes = () =>
    shapes.map((shape, index) =>
      shape.radius ? (
        <Circle
          key={index}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.fill}
          draggable
          onDragEnd={(e) => handleDragEnd(index, e)}
        />
      ) : (
        <Rect
          key={index}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          draggable
          onDragEnd={(e) => handleDragEnd(index, e)}
        />
      )
    );

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={addRectangle}>Add Rectangle</button>
        <button onClick={addCircle}>Add Circle</button>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>{renderShapes()}</Layer>
      </Stage>
    </div>
  );
};

export default CollaborativeCanvas;
