import { MobileToggle } from "@/shared/components/mobile-toggle";
import { Server } from "@prisma/client";
import { Hash, Menu } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  serverId: Server["id"];
  type: "channel" | "conversation";
  label: string;
}
const ChatHeader: React.FC<ChatHeaderProps> = ({ type, label, serverId }) => {
  return (
    <div className="text-md font-semibold px-3  flex items-center h-12 border-neutral-200  dark:border-neutral-800 border-b-2">

      {/* <svg x="0" y="0" className="icon__9293f" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" className=""></path></svg> */}
      <MobileToggle serverId={serverId} />
      {
        type === "channel" && (
          <Hash className="h-6 w-6 text-zinc-500 dark:text-zinc-400 mr-2" />
        )
      }
      <p className="text-md text-black dark:text-white/80">
        {label}
      </p>
    </div>
  )
}
export default ChatHeader;