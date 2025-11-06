"use client"
import { useSocket } from "@/shared/providers/socket-provider";
import { MessageWithMemberWithUser } from "@/shared/types";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  deleteKey: string;
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
  deleteKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!socket) return;

    const handleDeleteMessage = (message: MessageWithMemberWithUser): QueryData | null => {
      queryClient.setQueryData([queryKey], (oldData: QueryData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }
        // const newData = 
        const res: QueryData = {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((msg: MessageWithMemberWithUser) => {
              
              if (msg.id === message.id) {
                return { ...msg, deleted: true }
              }
            }),
          })),
        }
        return res;
      });
      return null;
    };
    const handleUpdateMessage = (message: MessageWithMemberWithUser) => {
      queryClient.setQueryData([queryKey], (oldData: QueryData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }
        // const newData = 
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((msg: MessageWithMemberWithUser) =>
              msg.id === message.id ? message : msg
            ),
          })),
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
        newPages[0].messages = [message, ...newPages[0].messages];
        
        return {
          ...oldData,
          pages: newPages,
        };
      });
    };

    socket.on(addKey, handleAddMessage);
    socket.on(updateKey, handleUpdateMessage);
    socket.on(deleteKey, handleDeleteMessage)

    return () => {
      socket.off(addKey, handleAddMessage);
      socket.off(updateKey, handleUpdateMessage);
      socket.off(deleteKey, handleDeleteMessage)
    };
  }, [socket, queryKey, updateKey, addKey, deleteKey, queryClient]);

}