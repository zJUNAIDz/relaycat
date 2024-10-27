import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const currentProfile = async () => {
  const session = await auth();
  const user = session?.user;
  if (!user) return redirect("/login");
  const profile = await db.user.findUnique({
    where: {
      id: user.id
    }
  });
  return profile;
}
export default currentProfile;