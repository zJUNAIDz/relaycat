"use client";

import FileUpload from "@/components/file-uploads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const defaultImageUrl = "https://global.discourse-cdn.com/turtlehead/original/2X/c/c830d1dee245de3c851f0f88b6c57c83c69f3ace.png";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  //TODO: remove this requirement and use fallback image if not specified
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }),
});

const EditServerModal = () => {
  //* component beginning

  const { isOpen, onClose, type, data: { server } } = useModal();
  const isModalOpen = isOpen && type == "editServer";
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl:
        "https://global.discourse-cdn.com/turtlehead/original/2X/c/c830d1dee245de3c851f0f88b6c57c83c69f3ace.png",
    },
  });

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!imageFile) {
        await axios.patch(`/api/servers/${server?.id}`, {
          name: values.name,
          imageUrl: values?.imageUrl,
        });
        form.reset();
        router.refresh();
        window.location.reload();
        return;
      }
      //* Get signed url from api
      const response = await fetch(
        `/api/get-upload-url?serverName=${form.getValues("name")}&fileType=${imageFile.type}`
      );
      const { signedUrl, key, bucketName } = await response.json();
      //* Upload file to S3
      // await fetch(signedUrl, {
      //   method: "PUT",
      //   headers: { "Content-Type": file.type },
      //   body: file,
      // });
      await axios.put(signedUrl, imageFile, {
        headers: { "Content-Type": imageFile.type },
      });
      await axios.patch(`/api/servers/${server?.id}`, {
        name: values.name,
        imageUrl: `https://s3.ap-south-1.amazonaws.com/${bucketName}/${key}`,
      });
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error: \n", err);
    }
  };

  React.useEffect(() => {
    if (server) {
      form.setValue("imageUrl", server?.image)
      form.setValue("name", server?.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleCloseModal = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Modify your Server
          </DialogTitle>
          <DialogDescription className="text-center">
            Give your Server a personality with a Name and an Image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          value={field.value}
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
                    <FormLabel className="uppercase text-xs font-bold text-zinc-700 dark:text-[#97A6BC]">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 focus-visible:ring-0  focus-visble:ring-offset-0"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 w-full">
              <Button variant="primary" type="submit" disabled={isLoading}>
                Edit
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditServerModal;
