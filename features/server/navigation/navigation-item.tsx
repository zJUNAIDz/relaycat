"use client";

import { useParams, useRouter } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import Image from "next/image";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  id, name, imageUrl
}) => {

  const params = useParams();
  const router = useRouter();
  const onClickServerIcon = () => (params?.serverId !== id ? router.push(`/servers/${id}`) : null);

  return (
    <ActionTooltip
      side="right"
      align="center"
      label={name}
    >
      <button onClick={onClickServerIcon} className="group relative flex items-center w-full justify-between">
        <div className={cn(
          "absolute left-0  bg-primary rounded-r-full transition-all w-[4px]",
          params?.serverId !== id && "group-hover:h-[24px]",
          params?.serverId === id ? "h-[40px]" : "h-[8px]"
        )} />
        <div
          className={cn(
            "relative group flex  mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverId !== "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image
            fill
            src={imageUrl}
            alt={`Server: ${name}`}
          />
        </div>
      </button>
    </ActionTooltip>
  )
}
export default NavigationItem;