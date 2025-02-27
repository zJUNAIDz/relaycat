import InitialModal from "@/features/server/components/modals/inital-modal";
import { serverService } from "@/features/server/server-service";
import currentProfile from "@/shared/lib/current-profile";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const { profile } = await currentProfile();
  if (!profile) return redirect("/auth");
  //TODO: optimize it to query first server only
  const servers = await serverService.getServersByUserId(profile.id)
  if (servers) redirect(`/servers/${servers[0].id}`);

  return <InitialModal />;
};

export default SetupPage;
