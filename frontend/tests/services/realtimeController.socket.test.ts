import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useNotesStore } from "@/stores/notes";
import { useUsersStore } from "@/stores/users";
import { useSessionStore } from "@/stores/session";
import type { Note } from "@/types/realtime";

vi.mock("@/services/socket/SocketGateway", () => {
  const serverHandlers = new Map<string, Function>();
  const socketHandlers = new Map<string, Set<Function>>();

  const socket = {
    on: vi.fn((event: string, cb: Function) => {
      let set = socketHandlers.get(event);
      if (!set) {
        set = new Set();
        socketHandlers.set(event, set);
      }
      set.add(cb);
    }),
    off: vi.fn((event: string, cb?: Function) => {
      const set = socketHandlers.get(event);
      if (!set) return;
      if (!cb) {
        set.clear();
        return;
      }
      set.delete(cb);
    }),
    emit: vi.fn()
  };

  const socketGateway = {
    connect: vi.fn(() => socket),
    disconnect: vi.fn(),
    on: vi.fn((event: string, cb: Function) => {
      serverHandlers.set(event, cb);
    }),
    off: vi.fn((event: string) => {
      serverHandlers.delete(event);
    }),
    emit: vi.fn((event: string, payload?: unknown) => {
      socket.emit(event, payload);
    })
  };

  const __testing = {
    triggerServer: (event: string, payload?: unknown) => {
      const cb = serverHandlers.get(event);
      if (!cb) throw new Error(`No handler registered for server event: ${event}`);
      cb(payload);
    },
    triggerSocket: (event: string) => {
      const set = socketHandlers.get(event);
      if (!set || set.size === 0) throw new Error(`No handlers registered for socket event: ${event}`);
      for (const cb of set) cb();
    }
  };

  return { socketGateway, __testing };
});

describe("realtimeController socket integration", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(async () => {
    const { stopRealtime } = await import("@/services/realtime/realtimeController");
    stopRealtime();
    vi.clearAllMocks();
  });

  it("emits join/init on connect and syncs stores from server events", async () => {
    const session = useSessionStore();
    const notes = useNotesStore();
    const users = useUsersStore();

    session.setUserName("Ana");

    const { startRealtime } = await import("@/services/realtime/realtimeController");
    const socketModule = (await import("@/services/socket/SocketGateway")) as any;
    const socketGateway = socketModule.socketGateway;
    const __testing = socketModule.__testing;

    startRealtime();

    __testing.triggerSocket("connect");

    expect(socketGateway.emit).toHaveBeenCalledWith("user:join", { name: "Ana" });
    expect(socketGateway.emit).toHaveBeenCalledWith("board:init");

    __testing.triggerServer("presence:users", { users: [{ name: "Ana" }, { name: "Carlos" }] });
    expect(users.onlineUsers).toEqual(["Ana", "Carlos"]);

    const base: Note = {
      id: "n1",
      title: "A",
      content: "c",
      x: 0,
      y: 0,
      comments: [],
      timestamp: 1
    };

    __testing.triggerServer("board:data", { notes: [base] });
    expect(notes.byId.n1.title).toBe("A");

    __testing.triggerServer("note:updated", { ...base, title: "B", timestamp: 2 });
    expect(notes.byId.n1.title).toBe("B");

    __testing.triggerServer("note:commented", {
      noteId: "n1",
      comment: { id: "c1", user: "Ana", text: "Hola", timestamp: 3 }
    });
    expect(notes.byId.n1.comments).toHaveLength(1);

    __testing.triggerServer("note:deleted", { id: "n1" });
    expect(notes.byId.n1).toBeUndefined();

    __testing.triggerServer("server:error", { message: "boom" });
    expect(session.lastError).toBe("boom");
  });

  it("sets connected=false on disconnect", async () => {
    const session = useSessionStore();
    session.setUserName("Ana");

    const { startRealtime } = await import("@/services/realtime/realtimeController");
    const socketModule = (await import("@/services/socket/SocketGateway")) as any;
    const __testing = socketModule.__testing;

    startRealtime();

    __testing.triggerSocket("connect");
    expect(session.connected).toBe(true);

    __testing.triggerSocket("disconnect");
    expect(session.connected).toBe(false);
  });

  it("stopRealtime removes registered server handlers", async () => {
    const { startRealtime, stopRealtime } = await import("@/services/realtime/realtimeController");
    const socketModule = (await import("@/services/socket/SocketGateway")) as any;
    const __testing = socketModule.__testing;

    startRealtime();
    stopRealtime();

    expect(() => __testing.triggerServer("board:data", { notes: [] })).toThrow(
      /No handler registered for server event: board:data/
    );
  });
});
