import ServerSidebar from "@/features/server/components/server-sidebar";

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
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 fixed inset-y-0">
        <ServerSidebar />
      </div>
      <main className="h-full md:pl-60">{children} </main>
    </div>
  );
};

export default ServerIdLayout;