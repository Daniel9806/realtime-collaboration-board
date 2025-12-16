<template>
  <div class="flex min-h-dvh flex-col">
    <header class="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div class="flex items-center gap-3">
        <span class="text-sm text-zinc-400">Usuario:</span>
        <span class="font-medium">{{ session.userName }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs"
          :class="session.connected ? 'bg-emerald-950 text-emerald-300' : 'bg-zinc-900 text-zinc-400'"
        >
          {{ session.connected ? 'online' : 'offline' }}
        </span>
      </div>

      <UserList />
    </header>

    <main class="relative flex-1 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_50%)]"></div>

      <button
        class="absolute right-4 top-4 z-10 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        @click="createNote"
      >
        + Nota
      </button>

      <BoardCanvas />

      <div v-if="session.lastError" class="absolute bottom-4 left-4 z-10 rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
        {{ session.lastError }}
        <button class="ml-3 text-red-200 underline" @click="session.clearError()">Cerrar</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { realtimeApi } from "@/services/realtime/realtimeApi";
import { useSessionStore } from "@/stores/session";
import UserList from "@/components/UserList.vue";
import BoardCanvas from "@/components/BoardCanvas.vue";

const session = useSessionStore();

function createNote() {
  realtimeApi.createNote({ title: "Nueva nota", content: "", x: 120, y: 120 });
}
</script>
