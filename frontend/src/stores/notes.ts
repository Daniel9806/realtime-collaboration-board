import { defineStore } from "pinia";
import type { Comment, Note } from "@/types/realtime";

function isNewer(a?: number, b?: number) {
  const ta = a ?? 0;
  const tb = b ?? 0;
  return ta >= tb;
}

export const useNotesStore = defineStore("notes", {
  state: () => ({
    byId: {} as Record<string, Note>
  }),
  getters: {
    list(state: { byId: Record<string, Note> }): Note[] {
      return Object.values(state.byId).sort((a: Note, b: Note) => a.timestamp - b.timestamp);
    }
  },
  actions: {
    setAll(notes: Note[]) {
      const next: Record<string, Note> = {};
      for (const n of notes) next[n.id] = n;
      this.byId = next;
    },
    upsertLocal(note: Note) {
      this.byId[note.id] = note;
    },
    upsertRemote(note: Note) {
      const existing = this.byId[note.id];
      if (!existing || isNewer(note.timestamp, existing.timestamp)) {
        this.byId[note.id] = note;
      }
    },
    remove(id: string) {
      delete this.byId[id];
    },
    addCommentRemote(noteId: string, comment: Comment) {
      const n = this.byId[noteId];
      if (!n) return;
      const exists = n.comments.some((c: Comment) => c.id === comment.id);
      if (exists) return;
      this.byId[noteId] = { ...n, comments: [...n.comments, comment] };
    }
  }
});
