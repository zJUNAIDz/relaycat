import DefaultServerPage from "@/features/server/components/default-server-page";
import { API_URL } from "@/shared/lib/constants";
import { getAuthTokenOnServer, getCurrentUser } from "@/shared/utils/server";
import axios from "axios";
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
    redirect("/auth?login=")
  }
  const url = queryString.stringifyUrl({
    url: `${API_URL}/channels`,
    query: {
      serverId,
    }
  })
  const { data: { channels } } = await axios.get(url, {
    headers: {
      "Authorization": `Bearer ${await getAuthTokenOnServer()}`
    }
  })
  if (!channels) {
    return <DefaultServerPage />;
  }
  return redirect(`/servers/${serverId}/channels/${channels[0].id}`)
}
export default ServerIdPage;