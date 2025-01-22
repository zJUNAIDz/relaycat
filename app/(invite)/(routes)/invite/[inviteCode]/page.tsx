import { auth } from "@/auth";
import { db } from "@/shared/lib/db";
import { redirect } from "next/navigation";
import React from "react";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InviteCodePage: React.FC<InviteCodePageProps> = async ({
  params,
}) => {

  const profile = await auth().then((session) => session?.user);
  if (!profile) return redirect("/login");
  const { inviteCode } = await params;
  //* If user already in invited server, it will be redirected to that server
  const alreadyInServer = await db.server.findFirst({
    where: {
      members: {
        some: {
          userId: profile.id,
        },
      },
      inviteCode: inviteCode,
    },
  });
  if (alreadyInServer) return redirect(`/servers/${alreadyInServer.id}`);

  //* if not already in server then add it
  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: {
          userId: profile.id,
        },
      },
    },
  });
  if (server) return redirect(`/servers/${server.id}`);

  //TODO: Add UI to accept or reject invite
  return <div>Invite link is Broken</div>;
};

export default InviteCodePage;
