import { serverService } from "@/features/server/server-service";
import { authClient } from "@/shared/lib/auth-client";
import { redirect } from "next/navigation";
import React from "react";
import "server-only";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InviteCodePage: React.FC<InviteCodePageProps> = async ({
  params,
}) => {

  const { error } = await authClient.get();
  if (error) {
    return redirect("/auth");
  }
  const { inviteCode } = await params;

  const { serverId } = await serverService.joinServerByInviteCode(inviteCode)
  if (serverId) {
    redirect(`/servers/${serverId}`)
  }
  redirect(`/`)
};

export default InviteCodePage;
