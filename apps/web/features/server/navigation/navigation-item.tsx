"use client";

import defaultServerImage from "@/public/placeholder.webp";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { ImageWithFallback } from "@/shared/components/image-with-fallback";
import { ServerWithMembersUserAndChannels } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { useParams, useRouter } from "next/navigation";
interface NavigationItemProps {
  server: ServerWithMembersUserAndChannels;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ server }) => {
  const params = useParams();
  const router = useRouter();
  const onClickServerIcon = () => {
    router.push(`/channels/${server.id}/${server.channels?.[0]?.id}`);
  };
  return (
    <ActionTooltip
      side="right"
      align="center"
      label={server.name}
    >
      <button onClick={onClickServerIcon} className="group relative flex items-center w-full justify-between">
        <div className={cn(
          "absolute left-0  bg-primary rounded-r-full transition-all w-1",
          params?.serverId !== server.id && "group-hover:h-6",
          params?.serverId === server.id ? "h-10" : "h-2"
        )} />
        <div
          className={cn(
            "relative group flex  mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden",
            params?.serverId !== server.id && "bg-primary/10 text-primary rounded-2xl"
          )}
        >
          <ImageWithFallback
            fill
            src={server.image ?? defaultServerImage}
            fallbackSrc={defaultServerImage}
            sizes="(max-width: 768px) 50px, (max-width: 1200px) 70px"
            quality={30}
            alt={`Server: ${server.name}`}
            priority={true}
          />
        </div>
      </button>
    </ActionTooltip>
  )
}
export default NavigationItem;