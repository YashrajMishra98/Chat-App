const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 5000; // fallback for local development

// Allow only your frontend origin
app.use(cors({
  origin: "https://chat-app-4l2o.vercel.app",
  methods: ["GET", "POST"]
}));

const users = {};

app.get("/", (req, res) => {
  res.send("Hello, the chat backend is working!");
});

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "https://chat-app-4l2o.vercel.app",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);

    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${user} has joined`
    });

    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat, ${user}`
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", {
      user: users[id],
      message,
      id
    });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit("leave", {
        user: "Admin",
        message: `${user} has left`
      });
      console.log(`${user} disconnected`);
      delete users[socket.id];
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
