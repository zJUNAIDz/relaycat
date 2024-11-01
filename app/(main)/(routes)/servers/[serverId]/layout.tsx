import ServerSidebar from "@/components/server/server-sidebar";
import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: {
    serverId: string;
  }
}
const ServerIdLayout: React.FC<ServerIdLayoutProps> = async ({
  children,
  params,
}) => {
  const user = await currentProfile();
  if (!user) return redirect("/login");

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  if (!server) redirect("/");

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 fixed inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="h-full pl-20 md:pl-60">{children} </main>
    </div>
  );
};

export default ServerIdLayout;
