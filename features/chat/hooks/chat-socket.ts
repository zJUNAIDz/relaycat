"use client"
import { useSocket } from "@/shared/providers/socket-provider";
import { MessageWithMemberWithUser } from "@/shared/types";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
}
interface QueryData {
  pageParams: unknown[];
  pages: {
    messages: MessageWithMemberWithUser[];
  }[];
}
export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!socket) return;

    const handleUpdateMessage = (message: MessageWithMemberWithUser) => {
      queryClient.setQueryData([queryKey], (oldData: QueryData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }
        const newData = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: MessageWithMemberWithUser) =>
            msg.id === message.id ? message : msg
          ),
        }))
        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    const handleAddMessage = (message: MessageWithMemberWithUser) => {
      queryClient.setQueryData([queryKey], (oldData: QueryData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{ messages: [message] }],
          };
        }
        const newPages = [...oldData.pages];
        newPages[0].messages = [...newPages[0].messages, message];
        return {
          ...oldData,
          pages: newPages,
        };
      });
    };

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleAddMessage);

    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleAddMessage);
    };
  }, [socket, queryKey, updateKey, addKey, queryClient]);

}