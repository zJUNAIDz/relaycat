import { z } from "zod";

export * from "./permissions";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileLink = { label: string; url: string };

export type Profile = {
  id: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: string | null;
  pronouns: string | null;
  status: string | null;
  links: ProfileLink[];
  /** Null until the user finishes the onboarding wizard; gates the app shell. */
  onboardingCompletedAt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileWithUser = Profile & { user: User };

/**
 * A server role. Permissions are carried as a decimal `bigint` string (see
 * permissions.ts). `position` orders roles for the hierarchy — higher position
 * outranks lower; the default (@everyone) role sits at position 0.
 */
export type Role = {
  id: string;
  serverId: string;
  name: string;
  color: string | null;
  permissions: string;
  position: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export const ChannelType = {
  TEXT: "TEXT",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
} as const;

export type ChannelType = keyof typeof ChannelType;

export type Server = {
  id: string;
  name: string;
  image: string | null;
  /** The single super-user of the server (implicitly has every permission). */
  ownerId: string;
  inviteCode: string;
  banner: string | null;
  description: string | null;
  memberCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export type Member = {
  id: string;
  userId: string;
  serverId: string;
  /** Roles assigned to this member (includes the default @everyone role). */
  roles: Role[];
  createdAt: Date;
  updatedAt: Date | null;
  user: User;
  server: Server;
};

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  serverId: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: User;
  server: Server;
  Message: Message[];
};

export type Message = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  deleted: boolean;
  memberId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date | null;
  member: Member;
  channel: Channel;
};

export type ServerWithMembersAndUser = Server & {
  members: (Member & { user: User })[];
};

export type ServerWithMembersUserAndChannels = Server & {
  members: (Member & { user: User })[];
  channels: Channel[];
};

export type ServerWithMembersOnly = Server & {
  members: Member[];
};

export type ServerWithChannels = Server & {
  channels: Channel[];
};

export const UserAuthStatus = {
  AUTHENTICATED: "AUTHENTICATED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  NOTFOUND: "NOTFOUND",
  DELETED: "DELETED",
  ERROR: "ERROR",
} as const;

export type UserAuthStatusType = keyof typeof UserAuthStatus;

export type UserProfileResponse = {
  profile: User | null;
  status: UserAuthStatusType;
};

export const CreateServerResponseStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  ERROR: "ERROR",
} as const;

export type CreateServerResponseStatusType =
  keyof typeof CreateServerResponseStatus;

export interface CreateServerResponse {
  server: Server | null;
  status: CreateServerResponseStatusType;
}

export type MessageWithMemberWithUser = {
  message: Message;
  member: Member;
  user: User & { image: string | null };
};

/**
 * The persisted message columns as they travel over realtime socket events.
 */
export type ChatMessageRow = {
  id: string;
  content: string | null;
  mentions: string[] | null;
  mentionRoles: string[] | null;
  reactions: string[] | null;
  deleted: boolean;
  authorId: string;
  /** Server-member author; null for DM messages. */
  memberId: string | null;
  channelId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

/**
 * A freshly-created message paired with just enough author identity for the
 * client to render it from scratch. `member`/`user` are structurally minimal on
 * purpose: server channels attach a real member row, DM channels synthesize a
 * lightweight one, and only these fields are relied on downstream.
 */
export type ChatMessageBroadcast = {
  message: ChatMessageRow;
  member: { id: string; userId: string };
  user: { id: string; name: string; image?: string | null };
};

/**
 * Realtime chat events broadcast per channel. Single source of truth for the
 * server emit sites AND the client socket listeners, so an event's name and its
 * payload shape can never drift apart — the drift that once made edits/deletes
 * silently no-op on the client (client read `payload.message.id` while the
 * server sent a bare message row).
 *
 * - `add`    → a brand-new message, wrapped with its author so the client can
 *              render it from scratch.
 * - `update` → the edited message row. The client already holds the author, so
 *              only the message fields are sent and merged into the cache.
 * - `delete` → the soft-deleted message row (same shape as `update`).
 */
export type ChatChannelEventPayloads = {
  add: ChatMessageBroadcast;
  update: ChatMessageRow;
  delete: ChatMessageRow;
};

export type ChatChannelEventKind = keyof ChatChannelEventPayloads;

/** Builds the socket event name for a given channel + event kind. */
export const chatChannelEventKey = {
  add: (channelId: string) => `chat:${channelId}:messages` as const,
  update: (channelId: string) => `chat:${channelId}:messages:update` as const,
  delete: (channelId: string) => `chat:${channelId}:messages:delete` as const,
} satisfies { [K in ChatChannelEventKind]: (channelId: string) => string };

/**
 * Type-safe broadcast of a chat channel event. Couples the event kind to both
 * its key and its payload, so passing the wrong payload shape for an event is a
 * compile error at the emit site instead of a silent runtime mismatch.
 */
export function emitChatChannelEvent<K extends ChatChannelEventKind>(
  io: { emit: (event: string, payload: ChatChannelEventPayloads[K]) => void },
  kind: K,
  channelId: string,
  payload: ChatChannelEventPayloads[K],
): void {
  io.emit(chatChannelEventKey[kind](channelId), payload);
}

export type MemberWithUser = Member & { user: User };
// Server / Guild Module DTOs
export const CreateServerDTO = z.object({
  name: z.string().min(1, "Server name is required").max(100),
  image: z.string().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  banner: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});
export type CreateServerInput = z.infer<typeof CreateServerDTO>;

export const EditServerDTO = CreateServerDTO.partial();
export type EditServerInput = z.infer<typeof EditServerDTO>;

// Channel Module DTOs
export const CreateChannelDTO = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100)
    .refine((name) => name.toLowerCase() !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
  serverId: z.string().uuid("Must be a valid server UUID"),
});
export type CreateChannelInput = z.infer<typeof CreateChannelDTO>;

export const EditChannelDTO = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100)
    .refine((name) => name.toLowerCase() !== "general", {
      message: "Channel name cannot be 'general'",
    }),
});
export type EditChannelInput = z.infer<typeof EditChannelDTO>;

// Roles Module DTOs
const HEX_COLOR_ROLE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
// Permissions cross the wire as a decimal bigint string.
const permissionsString = z
  .string()
  .regex(/^\d+$/, "Permissions must be a decimal bigint string");

export const CreateRoleDTO = z.object({
  name: z.string().min(1, "Role name is required").max(50),
  color: z
    .string()
    .regex(HEX_COLOR_ROLE, "Must be a hex color")
    .nullable()
    .optional(),
  permissions: permissionsString.default("0"),
});
export type CreateRoleInput = z.infer<typeof CreateRoleDTO>;

export const UpdateRoleDTO = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(HEX_COLOR_ROLE, "Must be a hex color")
    .nullable()
    .optional(),
  permissions: permissionsString.optional(),
  position: z.number().int().min(1).optional(),
});
export type UpdateRoleInput = z.infer<typeof UpdateRoleDTO>;

export const AssignRoleDTO = z.object({
  memberId: z.string().uuid(),
  roleId: z.string().uuid(),
});
export type AssignRoleInput = z.infer<typeof AssignRoleDTO>;

// Message Module DTOs
export const CreateMessageDTO = z
  .object({
    content: z.string().nullable().optional(),
    fileUrl: z.string().nullable().optional(),
  })
  .refine((data) => data.content || data.fileUrl, {
    message: "Either content or fileUrl must be provided",
  });
export type CreateMessageInput = z.infer<typeof CreateMessageDTO>;

export const EditMessageDTO = z.object({
  content: z.string().min(1, "Content cannot be empty"),
});
export type EditMessageInput = z.infer<typeof EditMessageDTO>;

// Profile Module DTOs
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const ProfileLinkDTO = z.object({
  label: z.string().min(1, "Label is required").max(40),
  url: z.string().url("Must be a valid URL").max(300),
});

// Username: 2-32 chars, lowercase letters/numbers/._, must start alphanumeric.
export const USERNAME_REGEX = /^[a-z0-9][a-z0-9._]{1,31}$/;

export const UpdateProfileDTO = z.object({
  username: z
    .string()
    .regex(
      USERNAME_REGEX,
      "2-32 chars: lowercase letters, numbers, dot or underscore",
    )
    .nullable()
    .optional(),
  displayName: z.string().min(1).max(50).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  accentColor: z
    .string()
    .regex(HEX_COLOR, "Must be a hex color like #5865F2")
    .nullable()
    .optional(),
  pronouns: z.string().max(40).nullable().optional(),
  status: z.string().max(128).nullable().optional(),
  links: z.array(ProfileLinkDTO).max(5).optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileDTO>;

/** Query for the live handle-availability check used by the onboarding form. */
export const CheckUsernameDTO = z.object({
  username: z.string().regex(USERNAME_REGEX),
});
export type CheckUsernameInput = z.infer<typeof CheckUsernameDTO>;
export type UsernameAvailability = { username: string; available: boolean };

// ---------------------------------------------------------------------------
// Friends Module
// ---------------------------------------------------------------------------
export const FriendshipStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  BLOCKED: "BLOCKED",
} as const;
export type FriendshipStatus = keyof typeof FriendshipStatus;

/** A user as surfaced in friend search / friend lists. */
export type FriendUser = {
  userId: string;
  username: string | null;
  displayName: string | null;
  name: string;
  avatar: string | null;
};

/** Direction of a pending request relative to the current user. */
export type FriendRequestDirection = "incoming" | "outgoing";

export type Friendship = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
};

/** A pending request annotated with the other user and its direction. */
export type FriendRequest = {
  friendshipId: string;
  direction: FriendRequestDirection;
  user: FriendUser;
  createdAt: Date;
};

// ---------------------------------------------------------------------------
// Presence Module
// ---------------------------------------------------------------------------
/**
 * Presence is intentionally split into two vocabularies:
 *
 *  - {@link PresenceStatus} is what *other* users see. "invisible" never leaks
 *    here — an invisible user is reported as "offline" to everyone else.
 *  - {@link PresenceSettableStatus} is what a user can *choose* for themselves.
 *    It adds "invisible" (appear offline while staying connected).
 *
 * "online"/"idle"/"dnd"/"offline" map to the green/yellow/red/grey dots.
 */
export const PRESENCE_STATUSES = ["online", "idle", "dnd", "offline"] as const;
export type PresenceStatus = (typeof PRESENCE_STATUSES)[number];

export const SETTABLE_PRESENCE_STATUSES = [
  "online",
  "idle",
  "dnd",
  "invisible",
] as const;
export type PresenceSettableStatus =
  (typeof SETTABLE_PRESENCE_STATUSES)[number];

/** A single user's presence as broadcast to watchers. */
export type PresenceUpdate = {
  userId: string;
  status: PresenceStatus;
  /** ISO timestamp; only set when the user is offline (null otherwise). */
  lastSeen: string | null;
};

/** Socket.IO event names for the presence protocol (shared client/server). */
export const PRESENCE_EVENTS = {
  /** server -> watchers: a single user's presence changed. */
  update: "presence:update",
  /** server -> requester: full snapshot answering a `subscribe`. */
  sync: "presence:sync",
  /** server -> own sockets: this user's chosen (settable) status. */
  self: "presence:self",
  /** client -> server: watch presence for these userIds. */
  subscribe: "presence:subscribe",
  /** client -> server: stop watching these userIds. */
  unsubscribe: "presence:unsubscribe",
  /** client -> server: set my own status (online/idle/dnd/invisible). */
  set: "presence:set",
  /** client -> server: keep my connection's presence TTL alive. */
  heartbeat: "presence:heartbeat",
} as const;

/** A typing transition for one user in one chat (channel or DM). */
export type TypingUpdate = {
  /** The channel/conversation id the typing is happening in. */
  chatId: string;
  userId: string;
  /** The typer's display name, for rendering "<name> is typing…". */
  name: string;
  /** true = started typing, false = stopped. */
  typing: boolean;
};

/**
 * Socket.IO event names for the typing protocol (shared client/server).
 *
 * Fully ephemeral — nothing is persisted. Viewers `subscribe` to a chat to join
 * its room; typers emit `start`/`stop`, which the server relays as `update` to
 * everyone else in that room.
 */
export const TYPING_EVENTS = {
  /** server -> room: someone started or stopped typing. */
  update: "typing:update",
  /** client -> server: I started typing in this chat. */
  start: "typing:start",
  /** client -> server: I stopped typing in this chat. */
  stop: "typing:stop",
  /** client -> server: join this chat's room to receive typing updates. */
  subscribe: "typing:subscribe",
  /** client -> server: leave this chat's room. */
  unsubscribe: "typing:unsubscribe",
} as const;

// Send a friend request by username.
export const SendFriendRequestDTO = z.object({
  username: z.string().min(1, "Username is required"),
});
export type SendFriendRequestInput = z.infer<typeof SendFriendRequestDTO>;

// Search users by (partial) username.
export const SearchUsersDTO = z.object({
  q: z.string().min(1).max(32),
});
export type SearchUsersInput = z.infer<typeof SearchUsersDTO>;

// ---------------------------------------------------------------------------
// Direct Messages Module
// ---------------------------------------------------------------------------
/** A 1-1 DM channel projected for the current user (the "other" participant). */
export type DmChannel = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  otherUser: FriendUser;
};

// Open (get-or-create) a DM with another user by their id.
export const OpenDmDTO = z.object({
  userId: z.string().min(1, "userId is required"),
});
export type OpenDmInput = z.infer<typeof OpenDmDTO>;

// ---------------------------------------------------------------------------
// Notifications Module
// ---------------------------------------------------------------------------
/**
 * The kinds of events that produce a notification. Kept as a const map so both
 * the server (when creating) and the client (when rendering an icon/label) draw
 * from one vocabulary.
 */
export const NOTIFICATION_TYPES = {
  /** Someone @-mentioned you in a server channel. */
  MENTION: "MENTION",
  /** You received a direct message. */
  DM: "DM",
  /** Someone sent you a friend request. */
  FRIEND_REQUEST: "FRIEND_REQUEST",
  /** Someone accepted your friend request. */
  FRIEND_ACCEPT: "FRIEND_ACCEPT",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/** The actor (who triggered the notification) as surfaced to the recipient. */
export type NotificationActor = {
  id: string;
  name: string;
  avatar: string | null;
};

/** A single notification as delivered to / listed for the recipient. */
export type Notification = {
  id: string;
  type: NotificationType;
  /** Short headline, e.g. "Alice mentioned you in #general". */
  title: string;
  /** Optional preview text (a message snippet). */
  body: string | null;
  read: boolean;
  /** Who caused it (null for system notifications). */
  actor: NotificationActor | null;
  /** Navigation context — where clicking the notification should take you. */
  channelId: string | null;
  serverId: string | null;
  messageId: string | null;
  createdAt: string;
};

/** Server -> client payload announcing a newly created notification. */
export type NotificationEvent = {
  notification: Notification;
  /** The recipient's total unread count after this notification. */
  unread: number;
};

/**
 * Socket.IO event name (per-recipient) for live notification delivery.
 *
 * Follows the existing per-user broadcast convention (see the friends module):
 * the server emits on a userId-scoped event name and each client listens only
 * on its own. History and read-state mutations go over REST.
 */
export const notificationEvent = (userId: string) =>
  `user:${userId}:notifications`;
