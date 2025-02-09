"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useModal } from "@/shared/hooks/use-modal-store";
import { getAuthTokenOnClient } from "@/shared/utils/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChannelType } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { capitalizeFirstLetter } from "@/shared/utils/misc";
import qs from "query-string";
import { publicEnv } from "@/shared/utils/publicEnv";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Channel name is required.",
  }),
  type: z.nativeEnum(ChannelType)
});

const CreateChannelModal = () => {
  //* component beginning
  const { isOpen, onClose, type, data: { channelType } } = useModal();
  const isModalOpen = isOpen && type == "createChannel";
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const params = useParams<{ serverId: string }>()
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT
    }
  });

  const resetForm = () => {
    form.reset({
      name: "",
      type: ChannelType.TEXT
    });
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const apiEndpoint = publicEnv("API_URL") || "http://localhost:3001"
    try {
      const url = qs.stringifyUrl({
        url: `${apiEndpoint}/channels/create`,
        query: {
          serverId: params.serverId
        }
      })

      await axios.post(url, values, {
        headers: {
          Authorization: `Bearer ${await getAuthTokenOnClient()}`
        }
      })
      form.reset()
      router.refresh()
      onClose()
    } catch (err) {
      console.error("[Error][Create Channel: fn::onSubmit] ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };
  React.useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType)
    } else {
      form.setValue("type", ChannelType.TEXT)
    }
  }, [channelType, form])

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      aria-label="Create New Channel"
    >
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Create New Channel
        </DialogTitle>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-700 dark:text-[#97A6BC]">
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-2 border-black border-solid focus-visible:ring-1 text-black dark:text-[#edf1f8] focus-visible:ring-offset-1 "
                        placeholder="Enter Channel Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-700 dark:text-[#97A6BC]">
                      Channel Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Channel Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                          Object.values(ChannelType).map(type => (
                            <SelectItem key={type} value={type}>
                              {capitalizeFirstLetter(type)}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-2 w-full">
              {errorMessage && (
                <div className="text-red-500  text-center mb-4">
                  {errorMessage}
                </div>
              )}
              <Button className="bg-blue-500 text-white dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800" variant="primary" type="submit" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog >
  );
};

export default CreateChannelModal;
