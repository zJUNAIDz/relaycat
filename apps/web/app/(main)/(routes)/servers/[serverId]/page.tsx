import DefaultServerPage from "@/features/server/components/default-server-page";
import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";
import queryString from "query-string";
interface ServerIdPageProps {
  params: Promise<{
    serverId: string;
  }>;

}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const { serverId } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect(`${PAGE_ROUTES.AUTH}?login=`)
  }
  const url = queryString.stringifyUrl({
    url: `${CONFIG.API_URL}/channels`,
    query: {
      serverId,
    }
  })
  const { data: { channels } } = await axiosClient.get(url)
  if (!channels) {
    console.log("No channels found")
    return <DefaultServerPage />;
  }
  return redirect(`/servers/${serverId}/channels/${channels[0].id}`)
}
export default ServerIdPage;