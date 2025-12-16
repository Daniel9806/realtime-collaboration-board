import { state } from "./data.js";
import { createNote, createComment } from "./utils.js";
import { schedulePersist } from "./persistence.js";

export default function socketHandlers(io, socket) {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  socket.on("user:join", ({ name }) => {
    state.users[socket.id] = { name };
    io.emit("presence:users", { users: Object.values(state.users) });
  });

  socket.on("board:init", () => {
    socket.emit("board:data", { notes: state.notes });
  });

  socket.on("note:create", (data) => {
    try {
      const note = createNote({
        ...data,
        user: state.users[socket.id]?.name || "unknown"
      });
      state.notes.push(note);
      schedulePersist();
      io.emit("note:created", note);
    } catch (err) {
      socket.emit("server:error", { message: "Error creando la nota." });
    }
  });

  socket.on("note:update", (note) => {
    try {
      const i = state.notes.findIndex((n) => n.id === note.id);
      if (i !== -1) {
        state.notes[i] = {
          ...state.notes[i],
          ...note,
          updatedBy: state.users[socket.id]?.name
        };
        schedulePersist();
        io.emit("note:updated", state.notes[i]);
      }
    } catch (err) {
      socket.emit("server:error", { message: "Error actualizando la nota." });
    }
  });

  socket.on("note:delete", ({ id }) => {
    try {
      state.notes = state.notes.filter((n) => n.id !== id);
      schedulePersist();
      io.emit("note:deleted", { id });
    } catch (err) {
      socket.emit("server:error", { message: "Error eliminando la nota." });
    }
  });

  socket.on("note:comment", ({ noteId, text }) => {
    try {
      const note = state.notes.find((n) => n.id === noteId);
      if (note) {
        const comment = createComment({
          user: state.users[socket.id]?.name || "unknown",
          text
        });
        note.comments.push(comment);
        schedulePersist();
        io.emit("note:commented", { noteId, comment });
      }
    } catch (err) {
      socket.emit("server:error", { message: "Error agregando comentario." });
    }
  });

  socket.on("disconnect", () => {
    delete state.users[socket.id];
    io.emit("presence:users", { users: Object.values(state.users) });
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
}
