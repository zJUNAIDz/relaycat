import InitialModal from "@/components/modals/inital-modal";
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile = await initialProfile();
  const servers = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (servers) redirect(`/servers/${servers.id}`);

  return <InitialModal />;
};

export default SetupPage;
