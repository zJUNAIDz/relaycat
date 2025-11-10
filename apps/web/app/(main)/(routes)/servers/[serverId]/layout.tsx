import ServerSidebar from "@/features/server/components/server-sidebar";
import { serverService } from "@/features/server/server-service";
import { DEFAULT_APP_PAGE } from "@/shared/lib/constants";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
  }>
}
const ServerIdLayout: React.FC<ServerIdLayoutProps> = async ({
  children,
  params,
}) => {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth");

  const { serverId } = await params;
  const server = await serverService.getServer(serverId)


  if (!server) redirect(DEFAULT_APP_PAGE);

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 fixed inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-60">{children} </main>
    </div>
  );
};

export default ServerIdLayout;
