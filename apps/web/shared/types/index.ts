import { User as AuthUser } from "@/shared/lib/auth-client";

export type User = AuthUser;

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
  image: string;
  inviteCode: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  members?: Member[];
  channels?: Channel[];
};

export type Member = {
  id: string;
  role: MemberRole;
  userId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  server?: Server;
};

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  userId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  server?: Server;
  Message?: Message[];
};

export type Message = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  deleted: boolean;
  memberId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  member?: Member;
  channel?: Channel;
};

export type ServerWithMembersAndUser = Server & {
  members: (Member & { user: User })[];
};

export type ServerWithMembersUserAndChannels = Server & {
  members: (Member & { user: User })[];
  channels: Channel[];
}

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
  // BANNED: "BANNED", //TODO: Make it applicable
  DELETED: "DELETED",
  ERROR: "ERROR",
} as const;

export type UserAuthStatusType = keyof typeof UserAuthStatus;

export type UserProfileResponse = {
  profile: User | null;
  status: UserAuthStatusType;
}


export interface CreateServerRequest {
  name: string;
  imageUrl: string;
}

export const CreateServerResponseStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  ERROR: "ERROR",
} as const;

export type CreateServerResponseStatusType = keyof typeof CreateServerResponseStatus;

export interface CreateServerResponse {
  server: Server | null;
  status: CreateServerResponseStatusType;
}

export type MessageWithMemberWithUser = Message & { member: Member & { user: User } }
export type MemberWithUser = Member & { user: User }