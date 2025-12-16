export type UserName = string;

export type Comment = {
  id: string;
  user: UserName;
  text: string;
  timestamp: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  updatedBy?: UserName;
  comments: Comment[];
  timestamp: number;
  editingBy?: UserName;
  editingAt?: number;
};

export type PresenceUsersPayload = {
  users: Array<{ name: UserName }>;
};

export type BoardDataPayload = {
  notes: Note[];
};

export type ServerErrorPayload = {
  message: string;
};
