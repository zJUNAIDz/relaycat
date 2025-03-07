import { ActionTooltip } from "@/shared/components/action-tooltip";
import { RoleIcon } from "@/shared/components/icons";
import { UserAvatar } from "@/shared/components/user-avatar";
import { MemberWithUser } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { Member, MemberRole, Message } from "@prisma/client";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ChatMessageProps {
  id: string;
  content: Message["content"]
  member: MemberWithUser;
  timestamp: string;
  fileUrl: Message["fileUrl"];
  deleted: Message["deleted"];
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}
export const ChatMessage = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery
}: ChatMessageProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isAdmin = member.role === MemberRole.ADMIN;
  const isModerator = member.role === MemberRole.MODERATOR;
  const isOwner = member.id === currentMember.id; //composer of the message
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const fileType = fileUrl?.split(".").pop();
  const isPDF = fileUrl && fileType === "pdf";
  const isImage = !isPDF && fileUrl;
  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.user.image} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold hover:underline cursor-pointer">
                {member.user.name}
              </p>
              <ActionTooltip label={member.role} side="top" className="text-xs">
                <RoleIcon role={member.role} />
              </ActionTooltip>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
            </div>
            {
              isImage && (
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                >
                  <Image
                    src={fileUrl}
                    alt={content || "an image"}
                    fill
                    className="object-cover"
                  />
                </Link>
              )
            }
            {
              isPDF && (
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                >
                  <embed src={fileUrl} type="pdf" />
                </Link>
              )
            }

          </div>
          {
            !fileUrl && !isEditing && (
              <p className={cn(
                "text-sm text-zinc-800 dark:text-zinc-200 mt-1",
                deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}>
                {content}
                {isUpdated && !deleted && (
                  <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
                    edited
                  </span>
                )}
              </p>
            )
          }
          {/* {isUpdated && !deleted && (
            <span className="text-xs text-gray-500">Edited</span>
          )}
          {deleted ? (
            <span className="text-xs italic text-gray-500">Message deleted</span>
          ) : (
            <p
              className={`text-sm ${fileUrl && "text-blue-500"} ${isUpdated && "italic"}`}
            >
              {content}
            </p>
          )} */}
        </div>
      </div>
      {
        canDeleteMessage && (
          <div className="hidden group-hover:flex item-center gap-x-2 absolute p-1 top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
            {
              canEditMessage && (
                <ActionTooltip label="Edit" side="top">
                  {/* <button
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="sr-only">Edit</span>
                    <Image
                      src="/icons/edit.svg"
                      alt="Edit"
                      height={16}
                      width={16}
                    />
                  </button> */}
                  <Edit className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                </ActionTooltip>
              )
            }
            <ActionTooltip label="Delete" side="top">
              <Trash className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
            </ActionTooltip>
          </div>
        )
      }
    </div>
  )

}