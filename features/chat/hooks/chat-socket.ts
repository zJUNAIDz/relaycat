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

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!socket) return;
    socket.on(updateKey, (message: MessageWithMemberWithUser) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {

          return oldData
        }
        const newData = oldData.pages.map((page: any) => {
          return page.map((msg: MessageWithMemberWithUser) => {
            if (msg.id === message.id) {
              return message;
            }
            return msg;
          })
        });
        return {
          ...oldData,
          pages: newData
        }
      })
    });
    socket.on(addKey, (message: MessageWithMemberWithUser) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [[message]]
          }
        }
        const newData = [...oldData.pages];
        newData[0] = [
          ...newData[0],
          message
        ]
        return {
          ...oldData,
          pages: newData
        }
      })
    });
    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    }
  }, [socket, queryKey, updateKey, addKey, queryClient])
}