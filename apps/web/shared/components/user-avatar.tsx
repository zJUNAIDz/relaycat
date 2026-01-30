import { cn } from "@/shared/utils/cn";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";

interface UserAvatarProps {
  src?: string ;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, className }) => {
  return (
    <Avatar className={cn(
      "h-7 w-7 md:h-10 md:w-10 object-cover",
      className
    )}>
      <AvatarImage src={src} />
    </Avatar>
  )
}
