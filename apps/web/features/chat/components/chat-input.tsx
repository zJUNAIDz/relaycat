"use client"
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { chatService } from "@/features/chat/chat-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod/v4";
import { useTypingNotifier } from "@/features/typing/use-typing";
import { EmojiPicker } from "./emoji-picker";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, unknown>;
  name: string;
  type: "conversation" | "channel";
  /** The chat (channel/conversation) id this input posts to. */
  chatId: string;
  /** The current user's display name, broadcast with typing events. */
  selfName: string;
}

const formSchema = z.object({
  content: z.string().min(1)
})


export const ChatInput = ({ apiUrl, query, name, type, chatId, selfName }: ChatInputProps) => {
  const { onOpen } = useModal();
  const router = useRouter();
  const notifyTyping = useTypingNotifier(chatId, selfName);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ""
    }
  });

  React.useEffect(() => {
    form.setFocus("content")
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Clear synchronously so the input stays mounted, enabled and focused:
    // disabling it (or awaiting before reset) blurs it and drops the mobile keyboard.
    form.reset();
    try {
      await chatService.sendMessage(apiUrl, values.content);
      router.refresh();
    } catch (error) {
      console.error("[ChatInput:onSubmit] ", error);
      form.setValue("content", values.content);
    }
  }
  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <div className="relative p-4 pb-6">
                    <button
                      type="button"
                      onClick={() => onOpen("messageFile", { apiUrl, query })}
                      className="absolute top-7 left-7 h-6 w-6  transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-foreground" />
                    </button>
                    <Input
                      placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                      className="px-14 py-6 bg-blend-lighten border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 "
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        notifyTyping();
                      }}
                    />
                    <div className="absolute top-7 right-8">
                      <EmojiPicker onChange={(value) => field.onChange(field.value + value)} />
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )
          }}
        />
      </form>
    </Form >
  )
}