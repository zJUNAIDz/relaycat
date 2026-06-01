import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { UserAvatar } from "@/shared/components/user-avatar";
interface UserFooterProps {
  user: {
    name?: string;
    username?: string;
    image?: string | null;
  }
}
export const UserFooter = ({ user }: UserFooterProps) => {

  return (
    <div className="w-full flex p-1 h-14  bg-background/50 dark:bg-background/10 border-t border-neutral-200 dark:border-neutral-800">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex justify-center items-center gap-2 hover:bg-accent p-2 py-3 rounded-md cursor-pointer">
            <UserAvatar src={user?.image || undefined } />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-gray-500 overflow-clip">@{user.username}</span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="ml-10 p-0 h-132.5 w-87.5 ">
          {
            //TODO: make profile component
          }
        </PopoverContent>
      </Popover>
    </div >
  )
}