const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 5000 });
let waitingUser = null;

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    const data = JSON.parse(message);
    
    if (data.type === "join") {
      socket.username = data.username;
      if (waitingUser) {
        socket.pair = waitingUser;
        waitingUser.pair = socket;
        waitingUser.send(JSON.stringify({ type: "system", text: "Matched!" }));
        socket.send(JSON.stringify({ type: "system", text: "Matched!" }));
        waitingUser = null;
      } else {
        waitingUser = socket;
      }
    }
    
    if (data.type === "message" && socket.pair) {
      socket.pair.send(JSON.stringify({ username: socket.username, text: data.text }));
    }
  });
  
  socket.on("close", () => {
    if (waitingUser === socket) waitingUser = null;
    if (socket.pair) socket.pair.send(JSON.stringify({ type: "system", text: "User disconnected." }));
  });
});

console.log("WebSocket server running on ws://localhost:5000");
