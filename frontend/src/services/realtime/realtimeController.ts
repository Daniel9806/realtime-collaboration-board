import { socketGateway } from "@/services/socket/SocketGateway";
import { useNotesStore } from "@/stores/notes";
import { useUsersStore } from "@/stores/users";
import { useSessionStore } from "@/stores/session";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

let started = false;
let cleanup: Array<() => void> = [];

export function stopRealtime() {
  for (const fn of cleanup) fn();
  cleanup = [];
  started = false;
}

export function startRealtime() {
  if (started) return;
  started = true;

  const session = useSessionStore();
  const notes = useNotesStore();
  const users = useUsersStore();

  const socket = socketGateway.connect({ url: SOCKET_URL });

  const onPresenceUsers = ({ users: online }: { users: Array<{ name: string }> }) => {
    users.setOnlineUsers(online.map((u) => u.name));
  };
  socketGateway.on("presence:users", onPresenceUsers);
  cleanup.push(() => socketGateway.off("presence:users", onPresenceUsers));

  const onBoardData = ({ notes: initial }: { notes: any[] }) => {
    notes.setAll(initial);
  };
  socketGateway.on("board:data", onBoardData);
  cleanup.push(() => socketGateway.off("board:data", onBoardData));

  const onNoteCreated = (note: any) => {
    notes.upsertRemote(note);
  };
  socketGateway.on("note:created", onNoteCreated);
  cleanup.push(() => socketGateway.off("note:created", onNoteCreated));

  const onNoteUpdated = (note: any) => {
    notes.upsertRemote(note);
  };
  socketGateway.on("note:updated", onNoteUpdated);
  cleanup.push(() => socketGateway.off("note:updated", onNoteUpdated));

  const onNoteDeleted = ({ id }: { id: string }) => {
    notes.remove(id);
  };
  socketGateway.on("note:deleted", onNoteDeleted);
  cleanup.push(() => socketGateway.off("note:deleted", onNoteDeleted));

  const onNoteCommented = ({ noteId, comment }: { noteId: string; comment: any }) => {
    notes.addCommentRemote(noteId, comment);
  };
  socketGateway.on("note:commented", onNoteCommented);
  cleanup.push(() => socketGateway.off("note:commented", onNoteCommented));

  const onServerError = ({ message }: { message: string }) => {
    session.setLastError(message);
  };
  socketGateway.on("server:error", onServerError);
  cleanup.push(() => socketGateway.off("server:error", onServerError));

  const onConnect = () => {
    session.setConnected(true);
    if (session.userName) {
      socketGateway.emit("user:join", { name: session.userName });
      socketGateway.emit("board:init");
    }
  };

  //TODO: Revisar pq se desuscribe y vuelve a suscribirse a connect
  socket.off("connect", onConnect);
  socket.on("connect", onConnect);
  cleanup.push(() => socket.off("connect", onConnect));

  const onDisconnect = () => {
    session.setConnected(false);
  };
  socket.off("disconnect", onDisconnect);
  socket.on("disconnect", onDisconnect);
  cleanup.push(() => socket.off("disconnect", onDisconnect));
}
