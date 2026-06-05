import { z } from "zod/v3";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const MemberRole = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  GUEST: "GUEST",
} as const;

export type MemberRole = keyof typeof MemberRole;

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
  role: MemberRole;
  userId: string;
  serverId: string;
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

export type MemberWithUser = Member & { user: User };

// Server / Guild Module DTOs
export const CreateServerDTO = z.object({
  name: z.string().min(1, "Server name is required").max(100),
  image: z.string().nullable().optional(),
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

// Member Module DTOs
export const ChangeMemberRoleDTO = z.object({
  role: z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
  memberId: z.string(),
});
export type ChangeMemberRoleInput = z.infer<typeof ChangeMemberRoleDTO>;

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
