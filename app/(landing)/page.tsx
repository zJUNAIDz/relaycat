import { getCurrentUser } from "@/shared/utils/server"
import Landing from "./landing"

const LandingPage = async () => {
  const user = await getCurrentUser();
  return (
    <Landing user={user} />
  )
}
export default LandingPage;