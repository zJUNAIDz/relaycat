import { ProfileEditor } from "@/features/profile/components/profile-editor";

export const metadata = {
  title: "Edit Profile · RelayCat",
};

const ProfileEditPage = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">
            Customize how you show up across RelayCat. Changes are visible to
            other members.
          </p>
        </header>
        <ProfileEditor />
      </div>
    </div>
  );
};

export default ProfileEditPage;
