import { serverService } from "@/features/server/server-service";
import { PAGE_ROUTES } from "@/shared/lib/routes";
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
  const { inviteCode } = await params;

  const { serverId } = await serverService.joinServerByInviteCode(inviteCode)
  if (serverId) {
    redirect(`/servers/${serverId}`)
  }
  redirect(PAGE_ROUTES.HOME)
};

export default InviteCodePage;
