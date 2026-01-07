<template>
  <div
    class="absolute w-80 select-none rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl"
    :style="{ left: note.x + 'px', top: note.y + 'px' }"
  >
    <div class="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 cursor-move"
          title="Arrastrar nota"
          @pointerdown="onPointerDown"
        >
          <span class="text-xs leading-none">⋮⋮</span>
        </div>

        <input
          name="noteTitle"
          autocomplete="off"
          v-model="draftTitle"
          class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-100 outline-none"
          @focus="onFocus"
          @blur="onBlur"
          @input="onEdit"
        />
      </div>
      <button
        class="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-950 hover:text-red-300"
        aria-label="Eliminar nota"
        title="Eliminar nota"
        @click.stop="remove"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
    </div>

    <div class="px-3 py-2">
      <textarea
        v-model="draftContent"
        class="min-h-20 w-full resize-none bg-transparent text-sm text-zinc-200 outline-none"
        @focus="onFocus"
        @blur="onBlur"
        @input="onEdit"
      ></textarea>

      <p v-if="editingIndicator" class="mt-2 text-xs text-amber-300">{{ editingIndicator }}</p>

      <div class="mt-3">
        <div class="mb-2 text-xs text-zinc-400">Comentarios</div>
        <div class="max-h-28 space-y-2 overflow-auto">
          <div v-for="c in note.comments" :key="c.id" class="rounded-md bg-zinc-950 px-2 py-1">
            <div class="text-xs text-zinc-300"><span class="font-medium">{{ c.user }}</span> · {{ formatTime(c.timestamp) }}</div>
            <div class="text-sm text-zinc-100">{{ c.text }}</div>
          </div>
        </div>

        <div class="mt-2 flex gap-2">
          <input
            v-model="commentText"
            class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-600"
            placeholder="Escribir comentario..."
            @keyup.enter="sendComment"
          />
          <button class="rounded-md bg-zinc-800 px-2 py-1 text-sm hover:bg-zinc-700" @click="sendComment">Enviar</button>
        </div>
      </div>

      <div class="mt-3 text-xs text-zinc-500">
        <span v-if="note.updatedBy">Actualizado por {{ note.updatedBy }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { realtimeApi } from "@/services/realtime/realtimeApi";
import { useNotesStore } from "@/stores/notes";
import { useSessionStore } from "@/stores/session";

const props = defineProps<{ noteId: string }>();

const notes = useNotesStore();
const session = useSessionStore();

const note = computed(() => notes.byId[props.noteId]);

const draftTitle = ref("");
const draftContent = ref("");
const commentText = ref("");

const isEditingLocal = ref(false);
let lastLocalInputAt = 0;

watch(
  note,
  (n) => {
    if (!n) return;
    if (isEditingLocal.value && n.editingBy === session.userName) return;
    if (isEditingLocal.value && (n.timestamp ?? 0) < lastLocalInputAt) return;
    draftTitle.value = n.title;
    draftContent.value = n.content;
  },
  { immediate: true }
);

const editingIndicator = computed(() => {
  const n = note.value;
  if (!n?.editingBy || n.editingBy === session.userName) return "";
  const age = Date.now() - (n.editingAt ?? 0);
  if (age > 6000) return "";
  return `${n.editingBy} está editando esta nota...`;
});

function now() {
  return Date.now();
}

let drag: null | { pointerId: number; startX: number; startY: number; baseX: number; baseY: number } = null;

function onPointerDown(e: PointerEvent) {
  e.stopPropagation();
  const n = note.value;
  if (!n) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  drag = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, baseX: n.x, baseY: n.y };
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const n = note.value;
  if (!n) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;
  realtimeApi.updateNote({ id: n.id, x: drag.baseX + dx, y: drag.baseY + dy, timestamp: now() });
}

function onPointerUp(e: PointerEvent) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  drag = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
}

let editTimer: number | null = null;

function onEdit() {
  const n = note.value;
  if (!n) return;
  lastLocalInputAt = now();
  if (editTimer) window.clearTimeout(editTimer);
  editTimer = window.setTimeout(() => {
    realtimeApi.updateNote({
      id: n.id,
      title: draftTitle.value,
      content: draftContent.value,
      timestamp: now(),
      editingBy: session.userName,
      editingAt: now()
    });
  }, 250);
}

function onFocus() {
  isEditingLocal.value = true;
  setEditing(true);
}

function setEditing(v: boolean) {
  const n = note.value;
  if (!n) return;
  if (!v) return;
  realtimeApi.updateNote({ id: n.id, editingBy: session.userName, editingAt: now(), timestamp: now() });
}

function onBlur() {
  const n = note.value;
  if (!n) return;
  if (editTimer) {
    window.clearTimeout(editTimer);
    editTimer = null;
    realtimeApi.updateNote({
      id: n.id,
      title: draftTitle.value,
      content: draftContent.value,
      timestamp: now(),
      editingBy: session.userName,
      editingAt: now()
    });
  }
  isEditingLocal.value = false;
  realtimeApi.updateNote({ id: n.id, editingBy: "", editingAt: 0, timestamp: now() });
}

function remove() {
  realtimeApi.deleteNote(props.noteId);
}

function sendComment() {
  const text = commentText.value.trim();
  if (!text) return;
  realtimeApi.addComment(props.noteId, text);
  commentText.value = "";
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}
</script>
