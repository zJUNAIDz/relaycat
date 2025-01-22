
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
export const RoleIcon: React.FC<RoleIconProps> = ({ role, className }) => (
  <Image
    className={className || ""}
    src={roleIconMap[role]}
    alt={role}
    height={20}
    width={20}
  />
);