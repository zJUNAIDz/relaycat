import "server-only"
import { auth } from "@/auth";
import { serverService } from "@/features/server/server-service";
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
  if (!profile) return redirect("/auth");
  const { inviteCode } = await params;

  const { serverId } = await serverService.joinServerByInviteCode(inviteCode)
  if (serverId) {
    redirect(`/servers/${serverId}`)
  }
  redirect(`/`)
};

export default InviteCodePage;
