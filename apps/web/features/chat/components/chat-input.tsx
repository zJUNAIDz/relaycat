"use client"
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useModal } from "@/shared/hooks/use-modal-store";
import axiosClient from "@/shared/lib/axios-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod/v3";
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

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      await axiosClient.post(apiUrl, values);
      router.refresh();
      form.reset();
      setTimeout(() => {
        form.setFocus("content")
      }, 50)
    } catch (error) {

    } finally {
      form.setFocus("content")
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
                      disabled={isLoading}
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