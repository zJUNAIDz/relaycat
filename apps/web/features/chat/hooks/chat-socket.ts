"use client";

import { useSocket } from "@/shared/providers/socket-provider";
import {
  Member,
  Message,
  MessageWithMemberWithUser,
  User,
} from "@/shared/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import React from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  deleteKey: string;
  queryKey: unknown[];
};

// 1. A single chat item item structure
interface ChatItem {
  message: Message;
  member: Member;
  user: User;
}

// 2. A "Page" is simply an array of these items
type ChatPage = {
  result: ChatItem[];
  nextCursor: string | null;
};

// 3. TanStack Query's internal cache representation
type ChatInfiniteData = InfiniteData<ChatPage>;
export const useChatSocket = ({
  addKey,
  updateKey,
  deleteKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!socket) return;

    const cacheKey = [queryKey];

    // Handle incoming new messages
    const handleAddMessage = (payload: ChatItem) => {
      queryClient.setQueryData<ChatInfiniteData>(cacheKey, (oldData) => {
        console.log({ oldData, payload });

        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pageParams: [null],
            pages: [{ result: [payload], nextCursor: null }],
          };
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            // Prepend the new message directly to the first page
            if (index === 0) {
              return { ...page, result: [payload, ...page.result] };
            }
            return page;
          }),
        };
      });
    };

    // Handle inline updates (like editing text)
    const handleUpdateMessage = (updatedMessage: MessageWithMemberWithUser) => {
      queryClient.setQueryData<ChatInfiniteData>(cacheKey, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            ({
              ...page,
              result: page.result.map((item) =>
                item.message.id === updatedMessage.message.id
                  ? { ...item, message: updatedMessage.message }
                  : item,
              ),
            }),
          ),
        };
      });
    };

    // Handle soft deletes (Flipping the `deleted` flag to true)
    const handleDeleteMessage = (deletedMessage: MessageWithMemberWithUser) => {
      queryClient.setQueryData<ChatInfiniteData>(cacheKey, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            ({
              ...page,
              result: page.result.map((item) =>
                item.message.id === deletedMessage.message.id
                  ? { ...item, message: { ...item.message, deleted: true } }
                  : item,
              ),
            }),
          ),
        };
      });
    };

    // Listeners setup
    socket.on(addKey, handleAddMessage);
    socket.on(updateKey, handleUpdateMessage);
    socket.on(deleteKey, handleDeleteMessage);

    return () => {
      socket.off(addKey, handleAddMessage);
      socket.off(updateKey, handleUpdateMessage);
      socket.off(deleteKey, handleDeleteMessage);
    };
  }, [socket, queryKey, addKey, updateKey, deleteKey, queryClient]);
};
