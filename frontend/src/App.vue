<template>
  <div class="min-h-dvh bg-zinc-950 text-zinc-100">
    <JoinView v-if="!session.userName" />
    <BoardView v-else />
  </div>
</template>

<script setup lang="ts">
import JoinView from "@/views/JoinView.vue";
import BoardView from "@/views/BoardView.vue";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
</script>
