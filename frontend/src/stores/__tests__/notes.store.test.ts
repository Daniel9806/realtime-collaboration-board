import { describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useNotesStore } from "@/stores/notes";
import type { Note } from "@/types/realtime";

describe("notes store", () => {
  it("upsertRemote does not overwrite a newer local note", () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const store = useNotesStore();

    const base: Note = {
      id: "n1",
      title: "A",
      content: "c",
      x: 0,
      y: 0,
      comments: [],
      timestamp: 10
    };

    store.upsertLocal(base);

    store.upsertRemote({ ...base, title: "older", timestamp: 5 });
    expect(store.byId.n1.title).toBe("A");

    store.upsertRemote({ ...base, title: "newer", timestamp: 15 });
    expect(store.byId.n1.title).toBe("newer");
  });
});
