import { Server, Member, User } from "@prisma/client";

export type ServerWithMembersWithUserProfiles = Server & {
  members: (Member & { user: User })[];
};
