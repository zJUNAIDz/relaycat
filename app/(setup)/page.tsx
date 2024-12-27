import InitialModal from "@/components/modals/inital-modal";
import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const { profile } = await currentProfile();
  if (!profile) return redirect("/login");
  const servers = await db.server.findFirst({
    where: {
      members: {
        some: {
          userId: profile.id,
        },
      },
    },
  });
  if (servers) redirect(`/servers/${servers.id}`);

  return <InitialModal />;
};

export default SetupPage;
