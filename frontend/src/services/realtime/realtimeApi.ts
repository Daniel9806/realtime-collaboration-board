import type { Note } from "@/types/realtime";
import { socketGateway } from "@/services/socket/SocketGateway";

export type CreateNotePayload = {
  title?: string;
  content?: string;
  x?: number;
  y?: number;
};

export type UpdateNotePayload = Partial<Note> & { id: string };

export const realtimeApi = {
  createNote(payload: CreateNotePayload) {
    socketGateway.emit("note:create", payload);
  },
  updateNote(payload: UpdateNotePayload) {
    socketGateway.emit("note:update", payload);
  },
  deleteNote(id: string) {
    socketGateway.emit("note:delete", { id });
  },
  addComment(noteId: string, text: string) {
    socketGateway.emit("note:comment", { noteId, text });
  }
};
