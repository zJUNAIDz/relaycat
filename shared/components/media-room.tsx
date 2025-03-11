"use client"
import {
  LiveKitRoom,
  VideoConference
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2 } from "lucide-react";
import React from "react";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from 'next-themes';
interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({
  chatId,
  audio,
  video
}: MediaRoomProps) => {
  const { user } = useAuth();
  const [token, setToken] = React.useState("")
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "system" ? "default" : resolvedTheme;

  React.useEffect(() => {
    try {
      (async () => {
        const res = await fetch(`/api/livekit?room=${chatId}&username=${user?.name || "Unknown"}`)
        const data = await res.json()
        setToken(data.token)
      })()

    } catch (error) {
      console.error("[MediaRoom] ", error)
    }
  }, [chatId, user?.name])
  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          loading...
        </p>
      </div>
    )
  }
  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}