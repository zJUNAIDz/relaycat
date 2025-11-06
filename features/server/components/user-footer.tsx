"use client"
import { ProfileModal } from "@/features/profile/components/profile-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { UserAvatar } from "@/shared/components/user-avatar";
import { DEFAULT_SERVER_IMAGE_URL } from "@/shared/lib/constants";
import { useAuth } from "@/shared/providers/auth-provider";
interface UserFooterProps {
  name: string;
  username: string;
  imageUrl: string;
}
export const UserFooter = ({ name, username, imageUrl }: UserFooterProps) => {
  const { user: profile } = useAuth();
  if (!profile) {
    // return <Loader2 className="animate-spin" />
    return (
      <div className="w-full flex p-1 h-14 bg-slate-200 dark:bg-[#222327]">
        <div className="flex justify-center items-center gap-2 hover:dark:bg-[#3A3B41] p-2 py-3 rounded-md cursor-pointer">
          <Skeleton
            className="h-10 w-10 rounded-full bg-slate-400 dark:bg-slate-500"
          />
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-4 w-28 rounded-md bg-slate-400 dark:bg-slate-500" />
            <Skeleton className="h-4 w-24 rounded-md bg-slate-400 dark:bg-slate-500" />

          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full flex p-1 h-14 bg-slate-200 dark:bg-[#222327]">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex justify-center items-center gap-2 hover:dark:bg-[#3A3B41] p-2 py-3 rounded-md cursor-pointer">
            <UserAvatar src={imageUrl} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-gray-500 overflow-clip">@{username}</span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="ml-10 p-0 h-[530px] w-[350px] ">
          {
            [<ProfileModal
              key={1}
              name={profile.name || "N/A"}
              username={profile.name || "N/A"}
              avatar={profile.image || DEFAULT_SERVER_IMAGE_URL}
              bannerColor="#2FBC3C"
            />]
          }
        </PopoverContent>
      </Popover>
    </div >
  )
}