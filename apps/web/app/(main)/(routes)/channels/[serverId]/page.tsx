import { serverService } from "@/features/server/server-service";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { notFound, redirect } from "next/navigation";
import "server-only";

interface ServerIdPageProps {
  params: Promise<{ serverId: string }>;
}

/**
 * A server has no page of its own — it's always "the server, at some channel".
 * Landing here (from an invite, or from the sidebar before a channel is known)
 * bounces to its first channel.
 */
const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const { serverId } = await params;
  const server = await serverService.getServer(serverId);

  if (!server) notFound();

  const firstChannel = server.channels?.[0];
  // A server with no channels shouldn't exist, but don't dead-end if one does.
  if (!firstChannel) redirect(PAGE_ROUTES.HOME);

  redirect(`/channels/${serverId}/${firstChannel.id}`);
};

export default ServerIdPage;
