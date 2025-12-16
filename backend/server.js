import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import socketHandlers from "./src/socketHandlers.js";
import { loadPersistedState } from "./src/persistence.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send({ status: "Backend running" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => socketHandlers(io, socket));

const PORT = 3001;
await loadPersistedState();

server.listen(PORT, () => {
  console.log(`🚀 Backend realtime corriendo en puerto ${PORT}`);
});
