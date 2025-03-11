"use client"

import { MessageWithMemberWithUser } from "@/shared/types";
import { Member } from "@prisma/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import React from "react";
import { useChatQuery } from "../hooks/chat-query-hook";
import { useChatSocket } from "../hooks/chat-socket";
import { ChatMessage } from "./chat-message";
import { ChatWelcome } from "./chat-welcome";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}


const DATE_FORMAT = "dd/MM/yyyy, HH:mm"

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`
  const addKey = `chat:${chatId}:messages`
  const updateKey = `chat:${chatId}:messages:update`
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
  })
  useChatSocket({ addKey, updateKey, queryKey })
  const bottomRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [data])
  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          loading messages...
        </p>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && (
        <ChatWelcome
          name={name}
          type={type}
        />
      )}
    
      <div>
        {
          data?.pages.map((group, i) => {
            return (
              <React.Fragment key={i}>
                {group.length !== 0 && group.messages.map((message: MessageWithMemberWithUser) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    currentMember={member}
                    member={message.member}
                    content={message.content}
                    fileUrl={message.fileUrl}
                    deleted={message.deleted}
                    timestamp={format(new Date(message.updatedAt || message.createdAt), DATE_FORMAT)}
                    isUpdated={message.updatedAt !== message.createdAt}
                    apiUrl={`${apiUrl}/${message.id}`}
                    socketUrl={socketUrl}
                    socketQuery={socketQuery}
                  />
                ))
                }
              </React.Fragment>
            )
          })
        }
        <div ref={bottomRef} />
      </div>
    </div >
  )

}