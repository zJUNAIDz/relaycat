import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import currentProfile from "./current-profile";

export const initialProfile = async () => {
  const user = await currentProfile();
  if (!user) return redirect("/login");

  //* checking for existing profile and return it
  const profile = await db.user.findUnique({
    where: {
      id: user.id,
    },
  });
  if (profile) return profile;

  //* create new profile in case no profile exist with such id

  const newProfile = await db.user.create({
    data: {
      id: user.id,
      name: `${user.name}` || "N/A",
      image: user.image || "",
      email: user.email || "N/A",
    },
  });
  return newProfile;
};
