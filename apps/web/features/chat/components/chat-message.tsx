import { Member, MemberRole, Message } from "@/generated/prisma/client";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { RoleIcon } from "@/shared/components/icons";
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useModal } from "@/shared/hooks/use-modal-store";
import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { useAuth } from "@/shared/providers/auth-provider";
import { MemberWithUser } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import queryString from "query-string";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
interface ChatMessageProps {
  id: Message["id"];
  content: Message["content"];
  member: MemberWithUser;
  timestamp: string;
  fileUrl: Message["fileUrl"];
  deleted: Message["deleted"];
  currentMember: Member;
  isUpdated: boolean;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
}


const formSchema = z.object({
  content: z.string().min(1),
});



export const ChatMessage = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  apiUrl,
  socketUrl,
  socketQuery
}: ChatMessageProps) => {

  const [isEditing, setIsEditing] = React.useState(false);
  const { isLoading: isLoadingAuth, error } = useAuth()
  const router = useRouter();
  const { onOpen } = useModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content || "",
    }
  })

  const isLoading = form.formState.isSubmitting;
  const onMessageEdit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = queryString.stringifyUrl({
        url: `${CONFIG.API_URL}/messages/${id}`,
        query: socketQuery,
      });
      await axiosClient.patch(url, values)

      setIsEditing(false);
    } catch (err) {
      console.log("[onMessageEdit] ", err)
    }
  }

  const onMemberClick = () => {
    if (member.userId !== currentMember.userId)
      router.push(`/servers/${member.serverId}/conversations/${member.userId}`)
    return
  }

  React.useEffect(() => {
    const handleEscapeKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKeyDown);
    return () => window.removeEventListener("keydown", handleEscapeKeyDown);
  })
  React.useEffect(() => {
    form.reset({
      content: content || " ",
    })
  }, [content, form]);
  const isAdmin = member.role === MemberRole.ADMIN;
  const isModerator = member.role === MemberRole.MODERATOR;
  const isOwner = member.id === currentMember.id; //composer of the message
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const fileType = fileUrl?.split(".").pop();
  const isPDF = fileUrl && fileType === "pdf";
  const isImage = !isPDF && fileUrl;
  if (isLoadingAuth) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.user.image} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center space-x-2">
              <p onClick={onMemberClick} className="text-sm font-semibold hover:underline cursor-pointer">
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
                "flex flex-col text-md text-zinc-800 dark:text-zinc-200 mt-1",
                deleted && "italic text-zinc-500 dark:text-zinc-400 text-sm mt-1"
              )}>
                {!deleted ? content : "This message has been deleted."}
                {isUpdated && !deleted && (
                  <span className="text-[0.7rem] italic text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
            )
          }
          {
            !fileUrl && isEditing && (
              <Form {...form}>
                <form
                  className="flex flex-col w-full gap-x-2 pt-2"
                  onSubmit={form.handleSubmit(onMessageEdit)}
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative w-full">
                              <Input
                                className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                placeholder="edited message..."
                                disabled={isLoading}
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                  <div className="flex mt-2 text-xs text-zinc-700 dark:text-zinc-400 gap-1">
                    <div aria-live="polite" className="sr-only" id="editingInstructions">
                      Editing mode enabled. Press Escape to cancel or Enter to save.
                    </div>
                    press escape to
                    <button
                      aria-label="cancel editing message"
                      onClick={() => setIsEditing(false)} className="text-blue-600 dark:text-blue-400 hover:underline">
                      cancel
                    </button>
                    • enter to
                    <button
                      aria-label="save edited message"
                      type="submit"
                      className="text-blue-600 dark:text-blue-400 hover:underline" role="button">
                      save
                    </button>
                  </div>
                </form>

              </Form>

            )
          }
        </div>
      </div>
      {
        canDeleteMessage && (
          <div className="hidden group-hover:flex item-center gap-x-2 absolute p-1 top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
            {
              canEditMessage && (
                <ActionTooltip label="Edit" side="top">
                  <Edit
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  />
                </ActionTooltip>
              )
            }
            <ActionTooltip label="Delete" side="top">
              <Trash
                onClick={() => onOpen("deleteMessage", { apiUrl })}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-300" />
            </ActionTooltip>
          </div>
        )
      }
    </div>
  )

}