"use client";

import FileUpload from "@/shared/components/file-uploads";
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
// import { api } from "@/lib/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { API_URL, DEFAULT_SERVER_IMAGE_URL } from "@/shared/lib/constants";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.string().optional().default(DEFAULT_SERVER_IMAGE_URL),
});



const CreateServerModal = () => {
  //* component beginning
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type == "createServer";
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl:
        DEFAULT_SERVER_IMAGE_URL,
    },
  });


  const resetForm = () => {
    form.reset({
      name: "",
      imageUrl: DEFAULT_SERVER_IMAGE_URL,
    });
    setImageFile(null);
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const authToken = await getAuthTokenOnClient();
      if (!imageFile) {
        if (!values.imageUrl.length) {
          setErrorMessage("Please upload an image");
          return;
        }
        if (values.imageUrl === DEFAULT_SERVER_IMAGE_URL) {
          await axios.post(`${API_URL}/servers/`, {
            name: values.name,
            imageUrl: form.getValues("imageUrl"),
          }, {
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          });
          resetForm();
          router.refresh();
          onClose();
          return;
        }

        //* impossible edge case
        if (values.imageUrl !== DEFAULT_SERVER_IMAGE_URL) {
          setErrorMessage("Image Url is not valid. please refresh the page");
          return;
        }
        setErrorMessage("No image found")
        return;
      }
      const { data: { signedUrl, key, bucketName } } = await axios.get(
        `${API_URL}/s3/uploadNewImage?serverName=${form.getValues("name")}&fileType=${imageFile.type}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      }
      );

      if (!signedUrl || !key || !bucketName) {
        setErrorMessage("Error uploading image");
        return;
      }
      const s3BaseUrl = "https://s3.ap-south-1.amazonaws.com";
      const imageUrl = `${s3BaseUrl}/${bucketName}/${key}`;

      const signedUrlResponse = await axios.put(signedUrl, imageFile, {
        headers: { "Content-Type": imageFile.type },
      });
      console.log({ signedUrlResponse });
      await axios.post(`${API_URL}/servers`, {
        name: values.name,
        imageUrl,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      });

      // await axios.post("/api/servers", {
      //   name: values.name,
      //   imageUrl,
      // });
      resetForm();
      router.refresh();
      onClose();
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("[Error][Create Server: fn::onSubmit] ", err.response?.data);
      }
      console.error("[Error][Create Server: fn::onSubmit] ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      aria-label="Add New Server"
    >
      <DialogContent className="overflow-hidden">
        {/* <DialogHeader> */}
        <DialogTitle className="text-center text-2xl font-bold">
          Customize your Server
        </DialogTitle>
        <DialogDescription className="text-center">
          Give your Server a personality with a Name and an Image. You can
          always change it later.
        </DialogDescription>
        {/* </DialogHeader> */}
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
                        className="border-2 border-black border-solid focus-visible:ring-1 text-black dark:text-[#edf1f8] focus-visible:ring-offset-1 "
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
    </Dialog>
  );
};

export default CreateServerModal;
