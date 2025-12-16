import { defineStore } from "pinia";

export const useUsersStore = defineStore("users", {
  state: () => ({
    onlineUsers: [] as string[]
  }),
  actions: {
    setOnlineUsers(users: string[]) {
      this.onlineUsers = users;
    }
  }
});
