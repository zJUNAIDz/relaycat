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
    <div className="text-md font-semibold px-3 text-foreground flex gap-x-4 items-center h-12 border-border  border-b-2">
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
          <Hash className="h-6 w-6 text-muted-foreground" />
        )
      }
      <p className="text-lg">
        {`${label}`}
      </p>
    </div>
  )
}
export default ChatHeader;