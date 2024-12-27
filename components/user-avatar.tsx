import { cn } from "@/utils/cn";
import { Avatar, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
  src?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, className }) => {
  return (
    <Avatar className={cn(
      "h-7 w-7 md:h-10 md:w-10",
      className
    )}>
      <AvatarImage src={src} />
    </Avatar>
  )
}