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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useModal } from "@/shared/hooks/use-modal-store";
import axiosClient from "@/shared/lib/axios-client";
import { ChannelType } from "@/shared/types";
import { capitalizeFirstLetter } from "@/shared/utils/misc";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod/v4";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Channel name is required.",
  }),
  type: z.nativeEnum(ChannelType),
});

const EditChannelModal = () => {
  //* component beginning
  const editChannelMutation = useEditChannelMutation();
  const { isOpen, onClose, type, data: { channel } } = useModal();
  const isModalOpen = isOpen && type == "editChannel";
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: channel?.name || "",
      type: channel?.type || ChannelType.TEXT
    }
  });

  const resetForm = () => {
    form.reset({
      name: "",
      type: ChannelType.TEXT,
    });
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      await editChannelMutation.mutateAsync({
        channelId: channel!.id,
        data: values
      })
      onClose()
    } catch (err) {
      if (err instanceof z.ZodError)
        setErrorMessage(err.message)
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
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      aria-label="Create New Channel"
    >
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Edit this Channel
        </DialogTitle>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-2 border-black border-solid focus-visible:ring-1 focus-visible:ring-offset-1 "
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
                    <FormLabel className="uppercase text-xs font-bold">
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
              <Button className="" variant="default" type="submit" disabled={isLoading}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog >
  );
};

function useEditChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, data }: { channelId: string, data: z.infer<typeof formSchema> }) => {
      return axiosClient.patch(`/channels/${channelId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server"] });
    }
  })
}
export default EditChannelModal;
