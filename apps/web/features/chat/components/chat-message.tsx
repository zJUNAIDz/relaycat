import { ActionTooltip } from "@/shared/components/action-tooltip";
import { RoleBadge } from "@/shared/components/role-badge";
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { UserAvatar } from "@/shared/components/user-avatar";
import { UserProfilePopover } from "@/features/profile/components/user-profile-popover";
import { chatService } from "@/features/chat/chat-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { computePermissions, Permission } from "@/shared/lib/permissions";
import { useAuth } from "@/shared/providers/auth-provider";
import { hasPermission, Member, Message, User } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
interface ChatMessageProps {
  id: Message["id"];
  content: Message["content"];
  member: Member;
  user: User & { image: string | null };
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
  user,
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
      // `apiUrl` is the fully-qualified message resource (…/messages/:id) for
      // both server channels and DMs, so edits work the same in either context.
      await chatService.editMessage(apiUrl, values.content)

      setIsEditing(false);
    } catch (err) {
      console.error("[onMessageEdit] ", err)
    }
  }


  React.useEffect(() => {
    if (!isEditing) return;
    const handleEscapeKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKeyDown);
    return () => window.removeEventListener("keydown", handleEscapeKeyDown);
  }, [isEditing])
  React.useEffect(() => {
    form.reset({
      content: content || "",
    })
  }, [content, form]);
  const isAuthor = member.id === currentMember.id; //composer of the message
  // The viewer's effective permissions (UI gate only; server is the authority).
  const viewerPerms = computePermissions(currentMember.roles, false);
  const canManageMessages = hasPermission(
    viewerPerms,
    Permission.MANAGE_MESSAGES,
  );
  const canDeleteMessage = !deleted && (isAuthor || canManageMessages);
  const canEditMessage = !deleted && isAuthor && !fileUrl;
  const fileType = fileUrl?.split(".").pop();
  const isPDF = fileUrl && fileType === "pdf";
  const isImage = !isPDF && fileUrl;
  if (isLoadingAuth) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <UserProfilePopover userId={user.id} name={user.name} avatarUrl={user.image}>
          <div className="cursor-pointer hover:drop-shadow-md transition">
            <UserAvatar src={user.image ?? undefined} />
          </div>
        </UserProfilePopover>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center space-x-2">
              <UserProfilePopover userId={user.id} name={user.name} avatarUrl={user.image}>
                <p className="text-sm font-semibold hover:underline cursor-pointer">
                  {user.name}
                </p>
              </UserProfilePopover>
              <RoleBadge roles={member.roles} />
              <span className="text-xs text-muted-foreground">{timestamp}</span>
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
                "flex flex-col text-md mt-1",
                deleted && "italic text-sm mt-1"
              )}>
                {!deleted ? content : "This message has been deleted."}
                {isUpdated && !deleted && (
                  <span className="text-[0.7rem] italic text-muted-foreground">
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
                                className="p-2 bg-muted border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
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
                  <div className="flex mt-2 text-xs text-muted-foreground gap-1">
                    <div aria-live="polite" className="sr-only" id="editingInstructions">
                      Editing mode enabled. Press Escape to cancel or Enter to save.
                    </div>
                    press escape to
                    <button
                      aria-label="cancel editing message"
                      onClick={() => setIsEditing(false)} className="text-brand hover:underline">
                      cancel
                    </button>
                    • enter to
                    <button
                      aria-label="save edited message"
                      type="submit"
                      className="text-brand hover:underline" role="button">
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
          <div className="hidden group-hover:flex item-center gap-x-2 absolute p-1 top-2 right-5 rounded-sm">
            {
              canEditMessage && (
                <ActionTooltip label="Edit" side="top">
                  <Edit
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer ml-auto w-4 h-4 text-accent-foreground"
                  />
                </ActionTooltip>
              )
            }
            <ActionTooltip label="Delete" side="top">
              <Trash
                onClick={() => onOpen("deleteMessage", { apiUrl })}
                className="cursor-pointer ml-auto w-4 h-4 text-accent-foreground hover:text-destructive" />
            </ActionTooltip>
          </div>
        )
      }
    </div>
  )

}