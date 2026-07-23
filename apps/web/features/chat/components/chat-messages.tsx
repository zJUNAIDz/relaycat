  "use client"

import { Member, MessageWithMemberWithUser } from "@/shared/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import React from "react";
import { useChatQuery } from "../hooks/chat-query-hook";
import { useChatSocket } from "../hooks/chat-socket";
import { useChatScroll } from "../hooks/use-chat-scroll";
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

/** Format a message timestamp, tolerating missing or malformed dates. */
const formatTimestamp = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, DATE_FORMAT);
};

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

  const chatRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useChatQuery<MessageWithMemberWithUser>({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
  });

  useChatSocket({
    chatId,
    queryKey: [queryKey, paramKey, paramValue],
  });

  // Count the total number of individual messages across all pages
  const totalMessagesCount =
    data?.pages.reduce((acc, page) => acc + page.result.length, 0) ?? 0;

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
        <Loader2 className="h-7 w-7 text-muted-foreground animate-spin my-4" />
        <p className="text-xs text-muted-foreground">
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
          <Loader2 className="h-7 w-7 text-muted-foreground animate-spin my-4" />
          <p className="text-xs text-muted-foreground">
            loading messages...
          </p>
        </div>
      ) : (
        hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="text-muted-foreground text-sm hover:underline my-2">
            load previous messages
          </button>
        )
      )}

      {/* Standard column flow matching DOM positioning */}
      <div className="flex flex-col-reverse mt-auto">
        {/* Anchor element at the very bottom (first child due to flex-col-reverse) */}
        <div ref={bottomRef} className="h-1" />

        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.result.map(
              ({ message, member, user }: MessageWithMemberWithUser) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  currentMember={member}
                  member={member}
                  user={user}
                  content={message.content}
                  fileUrl={message.fileUrl}
                  deleted={message.deleted}
                  timestamp={formatTimestamp(
                    message.updatedAt || message.createdAt,
                  )}
                  isUpdated={message.updatedAt !== null}
                  apiUrl={`${apiUrl}/${message.id}`}
                  socketUrl={socketUrl}
                  socketQuery={socketQuery}
                />
              ),
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};