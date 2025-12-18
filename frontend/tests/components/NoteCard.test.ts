import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import NoteCard from "@/components/NoteCard.vue";
import { useNotesStore } from "@/stores/notes";
import { useSessionStore } from "@/stores/session";
import type { Note } from "@/types/realtime";

vi.mock("@/services/realtime/realtimeApi", () => {
  return {
    realtimeApi: {
      createNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      addComment: vi.fn()
    }
  };
});

describe("NoteCard", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("debounces updates when editing title", async () => {
    vi.useFakeTimers();

    const notes = useNotesStore();
    const session = useSessionStore();
    session.setUserName("Ana");

    const base: Note = {
      id: "n1",
      title: "Old",
      content: "C",
      x: 10,
      y: 20,
      comments: [],
      timestamp: 1
    };

    notes.upsertLocal(base);

    const { realtimeApi } = await import("@/services/realtime/realtimeApi");

    const wrapper = mount(NoteCard, {
      props: { noteId: "n1" },
      global: {
        plugins: [createPinia()]
      }
    });

    const titleInput = wrapper.find("input");
    await titleInput.setValue("New title");

    vi.advanceTimersByTime(300);

    expect(realtimeApi.updateNote).toHaveBeenCalled();
    const lastCall = (realtimeApi.updateNote as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({
      id: "n1",
      title: "New title",
      editingBy: "Ana"
    });
  });

  it("sends trimmed comment and clears input", async () => {
    const notes = useNotesStore();
    const session = useSessionStore();
    session.setUserName("Ana");

    const base: Note = {
      id: "n1",
      title: "T",
      content: "C",
      x: 0,
      y: 0,
      comments: [],
      timestamp: 1
    };

    notes.upsertLocal(base);

    const { realtimeApi } = await import("@/services/realtime/realtimeApi");

    const wrapper = mount(NoteCard, {
      props: { noteId: "n1" },
      global: {
        plugins: [createPinia()]
      }
    });

    const commentInput = wrapper.find("input[placeholder='Escribir comentario...']");
    await commentInput.setValue("  Hola  ");
    await commentInput.trigger("keyup.enter");

    expect(realtimeApi.addComment).toHaveBeenCalledWith("n1", "Hola");
    expect((commentInput.element as HTMLInputElement).value).toBe("");
  });
});
