import { Server } from "socket.io";

const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

let canvasState = []; // Store shapes on the canvas

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send current canvas state to the newly connected client
  socket.emit("load-canvas", canvasState);

  // Listen for updates from clients
  socket.on("update-canvas", (newState) => {
    canvasState = newState; // Update the global state
    socket.broadcast.emit("update-canvas", newState); // Broadcast to other clients
  });
});
