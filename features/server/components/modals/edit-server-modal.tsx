"use client";

import FileUpload from "@/shared/components/file-uploads";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
import { API_URL, DEFAULT_SERVER_IMAGE_URL } from "@/shared/lib/constants";
import { getAuthTokenOnClient } from "@/shared/utils/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  //TODO: remove this requirement and use fallback image if not specified
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }).default(DEFAULT_SERVER_IMAGE_URL),
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
      imageUrl: DEFAULT_SERVER_IMAGE_URL,
    },
  });

  const isLoading = form.formState.isLoading;
  console.log("api url", API_URL)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const authToken = await getAuthTokenOnClient()
      if (!imageFile) {
        await axios.patch(`${API_URL}/servers/${server?.id}`, {
          name: values.name,
          imageUrl: values?.imageUrl,
        },
          {
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          }
        );
        form.reset();
        router.refresh();
        window.location.reload();
        return;
      }
      //* Get signed url from api
      const { data: { signedUrl, key, bucketName } } = await axios.get(
        `${API_URL}/s3/uploadNewImage?serverName=${form.getValues("name")}&fileType=${imageFile.type}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      }
      );
      //* Upload file to S3
      // await fetch(signedUrl, {
      //   method: "PUT",
      //   headers: { "Content-Type": file.type },
      //   body: file,
      // });
      await axios.put(signedUrl, imageFile, {
        headers: { "Content-Type": imageFile.type },
      });
      await axios.patch(`${API_URL}/servers/${server?.id}`, {
        name: values.name,
        imageUrl: `https://s3.ap-south-1.amazonaws.com/${bucketName}/${key}`,
      },
        {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
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
