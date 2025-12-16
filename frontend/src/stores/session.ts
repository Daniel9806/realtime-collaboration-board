import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    userName: "" as string,
    connected: false,
    lastError: "" as string
  }),
  actions: {
    setUserName(name: string) {
      this.userName = name;
    },
    setConnected(v: boolean) {
      this.connected = v;
    },
    setLastError(message: string) {
      this.lastError = message;
    },
    clearError() {
      this.lastError = "";
    }
  }
});
