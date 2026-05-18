import { SocketIndicator } from "@/features/socket/components/socket-indicator";
import { MobileToggle } from "@/shared/components/mobile-toggle";
import { UserAvatar } from "@/shared/components/user-avatar";
import { Hash } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  type: "channel" | "conversation";
  label: string;
  imageUrl?: string;
}
const ChatHeader: React.FC<ChatHeaderProps> = ({ type, label, imageUrl }) => {
  return (
    <div className="text-md font-semibold px-3  flex gap-x-4 items-center h-12 border-neutral-200  dark:border-neutral-800 border-b-2">
      <MobileToggle />
      {
        imageUrl && (
          <UserAvatar
            src={imageUrl}
          />
        )
      }
      {
        type === "channel" && (
          <Hash className="h-6 w-6 text-zinc-500 dark:text-zinc-400 mr-2" />
        )
      }
      <p className="text-lg text-black dark:text-white/80">
        {label}
      </p>
      <SocketIndicator />
    </div>
  )
}
export default ChatHeader;