import { ModeToggle } from "@/shared/components/mode-toggle";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import currentProfile from "@/shared/lib/current-profile";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import NavigationItem from "./navigation-item";
import { serverService } from "../server-service";

const NavigationSidebar = async () => {
  const { profile } = await currentProfile();
  if (!profile) return redirect("/login");

  const servers = await serverService.getServersByUserId(profile.id);

  return (
    <div
      className="space-y-4 flex flex-col h-full items-center text-primary w-full
    dark:bg-[#1e1f22] bg-[#e3e5e8] py-3"
    >
      <ScrollArea className="flex flex-1 w-full justify-center items-center ">
        {servers && servers.map(({ id, name, image }) => (
          <div
            key={id}
            className="mb-4 flex w-full justify-center items-center"
          >
            <NavigationItem id={id} name={name} imageUrl={image} />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <NavigationAction />
        <ModeToggle />
      </div>
    </div>
  );
};
export default NavigationSidebar;
