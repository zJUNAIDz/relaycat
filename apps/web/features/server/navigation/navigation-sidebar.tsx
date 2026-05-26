"use client";
import { ModeToggle } from "@/shared/components/mode-toggle";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { serverService } from "../server-service";
import NavigationItem from "./navigation-item";
import { CreateServerButton } from "./create-server-button";
import { useQuery } from "@tanstack/react-query";

const NavigationSidebar = () => {
  const query = useQuery({
    queryKey: ["currentUserServers"],
    queryFn: async () => {
      const servers = await serverService.getCurrentUserServers();
      return servers;
    }
  })
  if (query.isLoading) {
    return <LoadingNavigationSidebar />;
  }
  const servers = query.data || [];
  // console.log("servers: ", servers)
  return (
    <div
      className="space-y-4 flex flex-col h-full items-center text-primary w-full py-3 bg-background/70 border-r border-neutral-200 dark:border-neutral-800"
    >
      <ScrollArea className="flex flex-1 w-full justify-center items-center ">
        {servers && servers.map((server) => (
          <div
            key={server.id}
            className="mb-4 flex w-full justify-center items-center"
          >
            <NavigationItem server={server} />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Separator className="h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <CreateServerButton />
        <ModeToggle />
      </div>
    </div>
  );
};
const LoadingNavigationSidebar = () => {
  return (
    <div className="space-y-4 flex flex-col h-full items-center text-primary w-full py-3 animate-pulse">
      <div className="flex flex-col gap-y-2 w-full px-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-zinc-300 dark:bg-zinc-700 rounded-md w-full" />
        ))}
      </div>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Separator className="h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <div className="h-10 bg-zinc-300 dark:bg-zinc-700 rounded-md w-full" />
        <ModeToggle />
      </div>
    </div>
  )
}
export default NavigationSidebar;
