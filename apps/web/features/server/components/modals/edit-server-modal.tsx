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
import { CONFIG } from "@/shared/lib/config";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useS3Uploads } from "../../hooks/use-s3-uploads";
import { useEditServerMutation } from "../../hooks/server-mutations";


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
  const editServerMutation = useEditServerMutation(server?.id as string);
  const isModalOpen = isOpen && type == "editServer";
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const { isUploading, uploadServerIcon } = useS3Uploads();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || "",
      image: server?.image || CONFIG.DEFAULT_SERVER_IMAGE_URL,
    },
  });
  const isSubmitting = form.formState.isSubmitting || isUploading || editServerMutation.isPending;

  useEffect(() => {
    if (isModalOpen && server) {
      form.reset({
        name: server.name,
        image: server.image || CONFIG.DEFAULT_SERVER_IMAGE_URL,
      });
    }
  }, [server, isModalOpen, form]);

  const handleCloseModal = () => {
    form.reset();
    setImageFile(null);
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const imageUrl = imageFile ? await uploadServerIcon(imageFile, values.name) : values.image;
      const mutateResponse = await editServerMutation.mutateAsync({
        name: values.name,
        image: imageUrl,
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
                  disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
              <Button variant="default" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};


export default EditServerModal;
