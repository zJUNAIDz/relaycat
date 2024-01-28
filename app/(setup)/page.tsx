import InitialModal from "@/components/modals/inital-modal";
import { prisma } from "@/lib/prisma";
import { initialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile = await initialProfile();
  const servers = await prisma.server.findFirst({
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
