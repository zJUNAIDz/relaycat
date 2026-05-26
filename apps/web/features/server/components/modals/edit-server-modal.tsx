"use client";

import FileUpload from "@/shared/components/file-uploads";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  image: z.string().min(1, {
    message: "Server image is required.",
  }).default(CONFIG.DEFAULT_SERVER_IMAGE_URL),
});

const EditServerModal = () => {
  const { isOpen, onClose, type, data: { server } } = useModal();
  const mutate = useEditServerMutation(server?.id as string);
  const isModalOpen = isOpen && type == "editServer";
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || "",
      image: server?.image || CONFIG.DEFAULT_SERVER_IMAGE_URL,
    },
  });

  const handleCloseModal = () => {
    form.reset();
    setImageFile(null);
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let finalImageUrl = values.image;
      if (imageFile) {
        const { data: { signedUrl, key, bucketName } } = await axiosClient.get(`/s3/uploads/server-icon?serverName=${form.getValues("name")}&fileType=${imageFile.type}`);

        const uploadResponse = await axiosClient.put(signedUrl, imageFile, {
          headers: { "Content-Type": imageFile.type },
        });
        if (uploadResponse.status !== 200) {
          throw new Error("Failed to upload image to S3.");
        }
        finalImageUrl = `${CONFIG.S3_URL}/${bucketName}/${key}`
      }
      const mutateResponse = await mutate.mutateAsync({
        name: values.name,
        image: finalImageUrl,
      })
      if (mutateResponse.status !== 200) {
        throw new Error("Failed to update server with new image.");
      }
      toast.success("Server updated successfully!");
      handleCloseModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to edit server. Please try again.");
    }
  };

  useEffect(() => {
    if (isModalOpen && server) {
      form.reset({
        name: server.name,
        image: server.image || CONFIG.DEFAULT_SERVER_IMAGE_URL,
      });
    }
  }, [server, isModalOpen, form]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Modify your Server
          </DialogTitle>
          <DialogDescription className="text-center">
            Give your Server a personality with a Name and and Image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center text-center">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          type="image"
                          value={field.value as string}
                          onChange={
                            (previewUrl, file) => {
                              field.onChange(previewUrl);
                              setImageFile(file);
                            }
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        className="border focus-visible:ring-0  focus-visible:ring-offset-0 bg-transparent"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button variant="default" type="submit" disabled={form.formState.isSubmitting}>
                Edit
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

function useEditServerMutation(serverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["server", serverId],
    mutationFn: async ({ name, image }: { name: string, image: string }) => {
      const response = await axiosClient.patch(`/servers/${serverId}`, {
        name,
        image,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", serverId] });
      queryClient.invalidateQueries({ queryKey: ["currentUserServers"] });
    }
  });;
}
export default EditServerModal;
