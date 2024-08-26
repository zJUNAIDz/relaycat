import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode,
  params: {
    serverId: string,
  },
}
const ServerIdLayout: React.FC<ServerIdLayoutProps> = async ({ children, params }) => {

  const profile = await currentProfile();
  if (!profile) return redirectToSignIn();

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) redirect("/")

  return (
    <div className="h-full border border-red-800 border-solid">
      <div className="sm:hidden md:flex h-full w-60 z-20 fixed inset-y-0">

      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  )
}

export default ServerIdLayout;