import { io, type Socket } from "socket.io-client";
import type {
  BoardDataPayload,
  Note,
  PresenceUsersPayload,
  ServerErrorPayload,
  UserName
} from "@/types/realtime";

export type SocketGatewayOptions = {
  url: string;
};

type SpecificClientToServerEvents = {
  "user:join": (payload: { name: UserName }) => void;
  "board:init": () => void;
  "note:create": (payload: { title?: string; content?: string; x?: number; y?: number }) => void;
  "note:update": (note: Partial<Note> & { id: string }) => void;
  "note:delete": (payload: { id: string }) => void;
  "note:comment": (payload: { noteId: string; text: string }) => void;
};

type SpecificServerToClientEvents = {
  "presence:users": (payload: PresenceUsersPayload) => void;
  "board:data": (payload: BoardDataPayload) => void;
  "note:created": (note: Note) => void;
  "note:updated": (note: Note) => void;
  "note:deleted": (payload: { id: string }) => void;
  "note:commented": (payload: { noteId: string; comment: Note["comments"][number] }) => void;
  "server:error": (payload: ServerErrorPayload) => void;
};

type ClientToServerEvents = Record<string, (...args: any[]) => void> & SpecificClientToServerEvents;

type ServerToClientEvents = Record<string, (...args: any[]) => void> & SpecificServerToClientEvents;

export class SocketGateway {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  connect({ url }: SocketGatewayOptions) {
    if (this.socket) return this.socket;
    this.socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500
    });
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<K extends keyof SpecificServerToClientEvents>(event: K, cb: SpecificServerToClientEvents[K]) {
    if (!this.socket) throw new Error("Socket not connected");
    this.socket.on(event, cb as any);
  }

  off<K extends keyof SpecificServerToClientEvents>(event: K, cb?: SpecificServerToClientEvents[K]) {
    if (!this.socket) return;
    if (cb) this.socket.off(event, cb as any);
    else this.socket.off(event);
  }

  emit<K extends keyof SpecificClientToServerEvents>(
    event: K,
    payload?: Parameters<SpecificClientToServerEvents[K]>[0]
  ) {
    if (!this.socket) throw new Error("Socket not connected");
    (this.socket.emit as any)(event, payload);
  }
}

export const socketGateway = new SocketGateway();
