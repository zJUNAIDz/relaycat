"use client";
import ServerSidebar from "@/features/server/components/server-sidebar";
import NavigationSidebar from "@/features/server/navigation/navigation-sidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useParams } from "next/navigation";

export const MobileToggle = () => {
  const { serverId, channelId } = useParams();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="flex md:hidden">
          <Menu className="h-6 w-6 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0" aria-description="mobile sidebar">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <div className="w-18">
          <NavigationSidebar />
        </div>
        <ServerSidebar serverId={serverId as string} channelId={channelId as string} />
      </SheetContent>
    </Sheet>
  )
}