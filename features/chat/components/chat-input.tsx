"use client"
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useAuth } from "@/shared/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import queryString from "query-string";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EmojiPicker } from "./emoji-picker";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1)
})


export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const { authToken } = useAuth();
  React.useEffect(() => {
    form.setFocus("content")
  })
  const { onOpen } = useModal();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ""
    }
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const url = queryString.stringifyUrl({
        url: apiUrl,
        query
      })
      await axios.post(url, values, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
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
                      onClick={() => { console.log("plus clicked"); onOpen("messageFile", { apiUrl, query }) }}
                      className="absolute top-7 left-7 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-white dark:text-[#313338]" />
                    </button>
                    <Input
                      disabled={isLoading}
                      placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                      className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                      {...field}
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