import { Metadata } from "next";
import Landing from "./landing";
export const metadata: Metadata = {
  title: "RelayCat | Fast. Connected. Inspired."
}
const LandingPage = async () => {
  return (
    <Landing />
  )
}
export default LandingPage;