const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, ".")));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.emit("systemMessage", `Verbunden mit Live-Chat ${room}`);
  });

  socket.on("sendMessage", (payload) => {
    if (payload && payload.room && payload.text && payload.sender) {
      io.to(payload.room).emit("chatMessage", {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
