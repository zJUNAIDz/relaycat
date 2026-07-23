"use client";

import { useSocket } from "@/shared/providers/socket-provider";
import {
  ChatChannelEventPayloads,
  ChatMessageBroadcast,
  chatChannelEventKey,
} from "@/shared/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import React from "react";

type ChatSocketProps = {
  chatId: string;
  queryKey: unknown[];
};

// A cache "page" is a batch of message items plus its pagination cursor. Items
// carry the wire shape the socket delivers (message row + minimal author); the
// render layer reads them through the richer MessageWithMemberWithUser view.
type ChatPage = {
  result: ChatMessageBroadcast[];
  nextCursor: string | null;
};

// TanStack Query's internal cache representation for a channel's message list.
type ChatInfiniteData = InfiniteData<ChatPage>;

export const useChatSocket = ({ chatId, queryKey }: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!socket) return;

    const cacheKey = queryKey;
    const addKey = chatChannelEventKey.add(chatId);
    const updateKey = chatChannelEventKey.update(chatId);
    const deleteKey = chatChannelEventKey.delete(chatId);

    // Handle incoming new messages
    const handleAddMessage = (payload: ChatChannelEventPayloads["add"]) => {
      queryClient.setQueryData<ChatInfiniteData>(
        cacheKey,
        (oldData) =>
          produce(oldData, (draft) => {
            if (!draft || !draft.pages || draft.pages.length === 0) {
              return {
                pageParams: [null],
                pages: [{ result: [payload], nextCursor: null }],
              };
            }

            // Prepend the new message directly to the first page
            draft.pages[0]?.result.unshift(payload);
          }),
      );
    };

    // Handle inline updates (like editing text). The server emits the bare
    // updated message row (not the { message, member, user } wrapper the add
    // path uses), so match on its id and merge its fields into the cached
    // message, preserving anything the row omits.
    const handleUpdateMessage = (
      updatedMessage: ChatChannelEventPayloads["update"],
    ) => {
      queryClient.setQueryData<ChatInfiniteData>(cacheKey, (oldData) =>
        produce(oldData, (draft) => {
          if (!draft) return;

          for (const page of draft.pages) {
            const item = page.result.find(
              (item) => item.message.id === updatedMessage.id,
            );
            if (item) {
              Object.assign(item.message, updatedMessage);
            }
          }
        }),
      );
    };

    // Handle soft deletes (flipping the `deleted` flag to true). Payload is the
    // bare message row, same as the update path.
    const handleDeleteMessage = (
      deletedMessage: ChatChannelEventPayloads["delete"],
    ) => {
      queryClient.setQueryData<ChatInfiniteData>(cacheKey, (oldData) =>
        produce(oldData, (draft) => {
          if (!draft) return;

          for (const page of draft.pages) {
            const item = page.result.find(
              (item) => item.message.id === deletedMessage.id,
            );
            if (item) {
              item.message.deleted = true;
            }
          }
        }),
      );
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
  }, [socket, queryKey, chatId, queryClient]);
};
