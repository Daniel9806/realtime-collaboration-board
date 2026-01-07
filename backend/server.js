import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import socketHandlers from "./src/socketHandlers.js";
import { loadPersistedState } from "./src/persistence.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, "../frontend/dist");
const FRONTEND_INDEX = path.join(FRONTEND_DIST, "index.html");
const HAS_FRONTEND_DIST = fs.existsSync(FRONTEND_INDEX);

if (HAS_FRONTEND_DIST) app.use(express.static(FRONTEND_DIST));

app.get("/", (_, res) => {
  if (!HAS_FRONTEND_DIST) return res.send({ status: "Backend running" });
  res.sendFile(FRONTEND_INDEX);
});

if (HAS_FRONTEND_DIST) {
  app.get("/*", (_, res) => {
    res.sendFile(FRONTEND_INDEX);
  });
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => socketHandlers(io, socket));

const PORT = Number(process.env.PORT) || 3001;
await loadPersistedState();

server.listen(PORT, () => {
  console.log(`🚀 Backend realtime corriendo en puerto ${PORT}`);
});
