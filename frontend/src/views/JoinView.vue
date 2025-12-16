<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 p-6">
    <h1 class="text-2xl font-semibold">Realtime Collaboration Board</h1>

    <div class="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <label class="mb-2 block text-sm text-zinc-300">Tu nombre</label>
      <input
        v-model="name"
        class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
        placeholder="Ej: Carlos"
        @keyup.enter="join"
      />
      <button
        class="mt-3 w-full rounded-md bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-500"
        @click="join"
      >
        Entrar
      </button>
      <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSessionStore } from "@/stores/session";
import { startRealtime } from "@/services/realtime/realtimeController";

const session = useSessionStore();

const name = ref(session.userName);
const error = ref("");

function join() {
  const trimmed = name.value.trim();
  if (!trimmed) {
    error.value = "Ingresa un nombre.";
    return;
  }
  session.setUserName(trimmed);
  startRealtime();
}
</script>
