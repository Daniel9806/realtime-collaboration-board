import { describe, expect, it, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import BoardCanvas from "@/components/BoardCanvas.vue";
import { useNotesStore } from "@/stores/notes";
import type { Note } from "@/types/realtime";

describe("BoardCanvas", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it("renders one NoteCard per note in the store", () => {
    const notes = useNotesStore();

    const n1: Note = {
      id: "n1",
      title: "A",
      content: "c",
      x: 0,
      y: 0,
      comments: [],
      timestamp: 1
    };

    const n2: Note = {
      id: "n2",
      title: "B",
      content: "c",
      x: 0,
      y: 0,
      comments: [],
      timestamp: 2
    };

    notes.setAll([n1, n2]);

    const wrapper = mount(BoardCanvas, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NoteCard: {
            props: ["noteId"],
            template: "<div class='note-card-stub' :data-note-id='noteId'></div>"
          }
        }
      }
    });

    const stubs = wrapper.findAll(".note-card-stub");
    expect(stubs).toHaveLength(2);
    expect(stubs.map((s) => s.attributes("data-note-id"))).toEqual(["n1", "n2"]);
  });
});
