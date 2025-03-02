import { getCurrentUser } from "@/shared/utils/server"
import Landing from "./landing"
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "RelayCat | Fast. Connected. Inspired."
}
const LandingPage = async () => {
  const user = await getCurrentUser();
  return (
    <Landing user={user} />
  )
}
export default LandingPage;