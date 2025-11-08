import InitialModal from "@/features/server/components/modals/inital-modal";
import { serverService } from "@/features/server/server-service";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect, RedirectType } from "next/navigation";

export const dynamic = "force-dynamic";

const SetupPage = async () => {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth", RedirectType.replace);
  //TODO: optimize it to query first server only
  const servers = await serverService.getCurrentUserServers()
  if (servers?.length) redirect(`/servers/${servers[0].id}`);

  return <InitialModal />;
};

export default SetupPage;
