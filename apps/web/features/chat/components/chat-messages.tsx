"use client"

import { Member, Message, User } from "@/shared/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import React from "react";
import z from "zod";
import { useChatQuery } from "../hooks/chat-query-hook";
import { useChatSocket } from "../hooks/chat-socket";
import { useChatScroll } from "../hooks/use-chat-scroll";
import { ChatMessage } from "./chat-message";
import { ChatWelcome } from "./chat-welcome";

export const cursorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("before"),
    limit: z.coerce.number().min(1).max(100),
    before: z.string(),
  }),
  z.object({
    type: z.literal("after"),
    limit: z.coerce.number().min(1).max(100),
    after: z.string(),
  }),
]);
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
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const deleteKey = `chat:${chatId}:messages:delete`;

  const chatRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

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
  });

  useChatSocket({ addKey, updateKey, queryKey, deleteKey });

  // Count the total number of individual messages across all pages
  const totalMessagesCount = data?.pages.reduce((acc, page) => acc + page.length, 0) ?? 0;

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && hasNextPage,
    count: totalMessagesCount, // Now correctly detects every single message
  });

  // !!! REMOVED: The manual scrollIntoView useEffect that was overriding the hook !!!

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          loading messages...
        </p>
      </div>
    );
  }

  return (
    // Keep standard column flow for calculation predictability
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && (
        <ChatWelcome
          name={name}
          type={type}
        />
      )}

      {hasNextPage && isFetchingNextPage ? (
        <div className="flex flex-col flex-1 justify-center items-center">
          <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            loading messages...
          </p>
        </div>
      ) : (
        hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="text-zinc-500 text-sm hover:underline my-2">
            load previous messages
          </button>
        )
      )}

      {/* Standard column flow matching DOM positioning */}
      <div className="flex flex-col mt-auto">
        {/* Reverse pages array to render older pages at top, newer at bottom */}
        {[...(data?.pages ?? [])].reverse().map((group, i) => (
          <React.Fragment key={i}>
            {group.map(({ message, member, user }: { message: Message; member: Member; user: User & { image: string | null } }) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                currentMember={member}
                member={member}
                user={user}
                content={message.content}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                timestamp={format(new Date(message.updatedAt || message.createdAt), DATE_FORMAT)}
                isUpdated={message.updatedAt !== null}
                apiUrl={`${apiUrl}/${message.id}`}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </React.Fragment>
        ))}
        {/* This acts as our anchor element at the very bottom */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};