import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from '@/lib/prisma'

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user)
    return redirectToSignIn();

  //* checking for existing profile and return it 
  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    }
  });
  if (profile) return profile;

  //* create new profile in case no profile exist with such id 

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}` || "N/A",
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress || "N/A"
    }
  });
  return newProfile;
}
