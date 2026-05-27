"use client";
import { ChannelList } from "@/features/channel/components/channels-list";
import { ServerSearch } from "@/features/server/navigation/server-search";
import { RoleIcon } from "@/shared/components/icons";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { ChannelType, MemberRole } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { Hash, Mic, Video } from "lucide-react";
import { redirect } from "next/navigation";
import { serverService } from "../server-service";
import ServerHeader from "./server-header";
import { ServerMembersList } from "./server-member-list";
import { UserFooter } from "./user-footer";


const channelIconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.ADMIN]: <RoleIcon role={MemberRole.ADMIN} />,
  [MemberRole.MODERATOR]: <RoleIcon role={MemberRole.MODERATOR} />,
  [MemberRole.GUEST]: <RoleIcon role={MemberRole.GUEST} />,
}

const ServerSidebar = ({ serverId, channelId }: { serverId: string; channelId: string }) => {
  const { user, isLoading: isUserLoading, error: userError } = useAuth();

  const { data: server, isLoading: isServerDataLoading, isError: isServerDataError } = useQuery({
    queryKey: ["server", serverId],
    queryFn: () => serverService.getServer(serverId),
    enabled: !!serverId
  });
  // Handle loading and error states for user
  if (isUserLoading || isServerDataLoading) {
    return <ServerSidebarLoading />;
  }
  if (userError || !user) {
    redirect(PAGE_ROUTES.AUTH);
  }
  // Handle loading and error states for server data
  if (isServerDataError) {
    redirect(PAGE_ROUTES.HOME);
  }
  if (!server) {
    return <NoServerSelected name={user.name ?? "Na"} image={user.image ?? ""} />;
  }
  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  const members = server?.members;
  const role = server.members.find(
    (member) => member.userId === user.id
  )?.role;
  if (!role) return redirect(PAGE_ROUTES.AUTH);
  return (
    <WrapperDiv>
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <ServerSearch
          data={[
            {
              label: "Text Channels",
              type: "channel",
              data: textChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Voice Channels",
              type: "channel",
              data: audioChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Video Channels",
              type: "channel",
              data: videoChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Members",
              type: "member",
              data: members?.map(member => ({
                icon: roleIconMap[member.role],
                name: member.user?.name || "",
                id: member.userId
              }))
            },
          ]}
        />
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        <ChannelList
          channelsGroupedByType={[
            textChannels,
            audioChannels,
            videoChannels,
          ]}
          role={role}
          server={server}
        />
        <ServerMembersList members={server.members} serverId={server.id} />
      </ScrollArea>
      <UserFooter user={{name: user.name || "NA", username:  "NA", image: user.image || ""}} />
    </WrapperDiv>
  );
};
const NoServerSelected = ({ name, image }: { name: string, image: string }) => {
  return (
    <WrapperDiv>
      {/* Empty header area */}
      <div className="h-12 px-3 flex items-center border-b-2 border-neutral-200 dark:border-neutral-800">
        <div className="text-xs uppercase font-semibold text-zinc-400 dark:text-zinc-500">
          No Server Selected
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-3">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            Welcome to RelayChat
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select a server from the sidebar to start chatting
          </p>
        </div>
      </div>

      {/* Empty footer area */}
      <UserFooter user={{ name, username: "NA", image }} />
    </WrapperDiv>
  )
};

const ServerSidebarLoading = () => {
  return (
    <WrapperDiv>
      {/* Header - h-12 to match ServerHeader */}
      <div className="h-12 px-3 flex items-center border-b-2 border-neutral-200 dark:border-neutral-800">
        <Skeleton className="h-6 w-2/3 rounded-md bg-zinc-300 dark:bg-zinc-700" />
      </div>

      {/* Main content with ScrollArea padding */}
      <div className="flex-1 px-3 overflow-y-auto">
        {/* Search button skeleton - h-8 with py-2 px-2 */}
        <div className="py-2">
          <div className="flex items-center px-2 py-2 gap-x-2 rounded-md">
            <Skeleton className="h-4 w-4 rounded bg-zinc-300 dark:bg-zinc-700" />
            <Skeleton className="h-4 w-2/3 rounded-md bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>

        {/* Separator */}
        <div className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2 h-px" />

        {/* Text Channels Section */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between py-2">
            <Skeleton className="h-3 w-1/4 rounded-md bg-zinc-300 dark:bg-zinc-700" />
            <Skeleton className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-700" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center px-2 py-2 gap-x-2 mb-1">
              <Skeleton className="h-4 w-4 rounded shrink-0 bg-zinc-300 dark:bg-zinc-700" />
              <Skeleton className="h-4 w-1/2 rounded-md flex-1 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          ))}
        </div>

        {/* Voice Channels Section */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between py-2">
            <Skeleton className="h-3 w-1/4 rounded-md bg-zinc-300 dark:bg-zinc-700" />
            <Skeleton className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-700" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center px-2 py-2 gap-x-2 mb-1">
              <Skeleton className="h-4 w-4 rounded shrink-0 bg-zinc-300 dark:bg-zinc-700" />
              <Skeleton className="h-4 w-2/5 rounded-md flex-1 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          ))}
        </div>

        {/* Members Section */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between py-2">
            <Skeleton className="h-3 w-1/4 rounded-md bg-zinc-300 dark:bg-zinc-700" />
            <Skeleton className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-700" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center px-2 py-2 gap-x-2 mb-1">
              <Skeleton className="h-4 w-4 rounded-full shrink-0 bg-zinc-300 dark:bg-zinc-700/50" />
              <Skeleton className="h-4 w-2/5 rounded-md flex-1 bg-zinc-300 dark:bg-zinc-700" />
              <Skeleton className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer - h-14 to match UserFooter */}
      <div className="h-14 p-1 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 px-2 py-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0 bg-zinc-300 dark:bg-zinc-700/50" />
          <div className="flex-1 flex flex-col gap-y-1">
            <Skeleton className="h-3 w-1/3 rounded-md bg-zinc-300 dark:bg-zinc-700" />
            <Skeleton className="h-2 w-1/4 rounded-md bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </WrapperDiv>
  )
};
const WrapperDiv = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full text-primary w-full bg-background border-r border-neutral-200 dark:border-neutral-800">
      {children}
    </div>
  )
}
export default ServerSidebar;
