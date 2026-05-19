import ServerSidebar from "@/features/server/components/server-sidebar";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
    channelId: string;
  }>
}
const ServerIdLayout: React.FC<ServerIdLayoutProps> = async ({
  children,
  params,
}) => {
  const { serverId, channelId } = await params;
  console.log("ServerIdLayout params: ", { serverId, channelId });
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 fixed inset-y-0">
        <ServerSidebar serverId={serverId} channelId={channelId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;