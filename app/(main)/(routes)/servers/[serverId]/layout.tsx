import ServerSidebar from "@/features/server/components/server-sidebar";
import { serverService } from "@/features/server/server-service";
import currentProfile from "@/shared/lib/current-profile";
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
  const { profile } = await currentProfile();
  if (!profile) return redirect("/auth");

  const { serverId } = await params;
  const server = await serverService.getServer(serverId)


  if (!server) redirect("/setup");

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
