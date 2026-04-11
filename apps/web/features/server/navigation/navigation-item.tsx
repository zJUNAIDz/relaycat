"use client";

import defaultServerImage from "@/public/placeholder.webp";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { cn } from "@/shared/utils/cn";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
  const onClickServerIcon = () => (params?.serverId !== id ? router.push(`/channels/${id}`) : null);
  // console.log("imageUrl", imageUrl)
  return (
    <ActionTooltip
      side="right"
      align="center"
      label={name}
    >
      <button onClick={onClickServerIcon} className="group relative flex items-center w-full justify-between">
        <div className={cn(
          "absolute left-0  bg-primary rounded-r-full transition-all w-1",
          params?.serverId !== id && "group-hover:h-6",
          params?.serverId === id ? "h-10" : "h-2"
        )} />
        <div
          className={cn(
            "relative group flex  mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden",
            params?.serverId !== "bg-primary/10 text-primary rounded-2xl"
          )}
        >
          <Image
            fill
            src={imageUrl ? `${imageUrl}` : defaultServerImage}
            sizes="(max-width: 768px) 50px, (max-width: 1200px) 70px"
            quality={30}
            alt={`Server: ${name}`}
            priority={true}
          />
        </div>
      </button>
    </ActionTooltip>
  )
}
export default NavigationItem;