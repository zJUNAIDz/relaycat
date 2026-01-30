import ServerSidebar from "@/features/server/components/server-sidebar"
import NavigationSidebar from "@/features/server/navigation/navigation-sidebar"
import { Menu } from "lucide-react"
import { useAppContextStore } from "../stores/use-app-store"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

export const MobileToggle = () => {
  const ctx = useAppContextStore()  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        {
          ctx.currentServerId ? (
            <ServerSidebar serverId={ctx.currentServerId} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                Select a server to view its channels
              </p>
            </div>
          )
        }
      </SheetContent>
    </Sheet>
  )
}