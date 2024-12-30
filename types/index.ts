import { Server, Member, User } from "@prisma/client";
import exp from "constants";

export type ServerWithMembersWithUserProfiles = Server & {
  members: (Member & { user: User })[];
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