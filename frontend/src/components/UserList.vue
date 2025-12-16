<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-zinc-400">Online:</span>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="u in users.onlineUsers"
        :key="u"
        class="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200"
      >
        {{ u }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/stores/users";

const users = useUsersStore();
</script>
