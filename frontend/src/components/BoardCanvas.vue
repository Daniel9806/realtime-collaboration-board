<template>
  <div ref="el" class="relative h-full w-full">
    <NoteCard v-for="n in notes.list" :key="n.id" :note-id="n.id" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotesStore } from "@/stores/notes";
import NoteCard from "@/components/NoteCard.vue";

const notes = useNotesStore();
const el = ref<HTMLElement | null>(null);
</script>
