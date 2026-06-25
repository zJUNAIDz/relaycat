
import Image from "next/image";
import React from "react";

interface RoleIconProps {
  role: string;
  className?: string;
}

const roleIconMap: Record<string, string> = {
  "ADMIN": "/icons/admin.png",
  "MODERATOR": "/icons/moderator.png",
  "GUEST": "/icons/guest.png",
};
export const RoleIcon: React.FC<RoleIconProps> = ({ role, className }) => {
  const src = roleIconMap[role];
  if (!src) return null;
  return (
    <Image
      className={className || ""}
      src={src}
      alt={role}
      height={20}
      width={20}
    />
  );
};

interface ChannelIconProps {
  type: string;
  className?: string;
  height?: number;
  width?: number;
}
const channelIconMap: Record<string, string> = {
  "TEXT": "/icons/text.png",
  "AUDIO": "/icons/audio.png",
  "VIDEO": "/icons/video.png",
};

export const ChannelIcon: React.FC<ChannelIconProps> = ({ type, className, height, width }) => {
  const src = channelIconMap[type];
  if (!src) return null;
  return (
    <Image
      className={className || ""}
      src={src}
      alt={type}
      height={height || 20}
      width={width || 20}
    />
  );
};