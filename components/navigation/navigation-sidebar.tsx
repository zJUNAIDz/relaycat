import { ModeToggle } from "@/components/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import currentProfile from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import NavigationItem from "./navigation-item";

const NavigationSidebar = async () => {
  const user = await currentProfile();
  if (!user) return redirect("/");

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  return (
    <div
      className="space-y-4 flex flex-col h-full items-center text-primary w-full
    dark:bg-[#1e1f22] bg-[#e3e5e8] py-3"
    >
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex flex-1 w-full justify-center items-center ">
        {servers.map(({ id, name, image }) => (
          <div
            key={id}
            className="mb-4 flex w-full justify-center items-center"
          >
            <NavigationItem id={id} name={name} imageUrl={image} />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
      </div>
    </div>
  );
};
export default NavigationSidebar;
