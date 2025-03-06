"use client";

import FileUpload from "@/shared/components/file-uploads";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem
} from "@/shared/components/ui/form";
import { useModal } from "@/shared/hooks/use-modal-store";
import { getAuthTokenOnClient } from "@/shared/utils/client";
// import { api } from "@/lib/api-client";
import { API_URL, DEFAULT_SERVER_IMAGE_URL } from "@/shared/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";


const formSchema = z.object({
  fileUrl: z.string().min(1, {
    message: "Attachment is required."
  }),
});

const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/jpg",
  "image/webp",
  "application/pdf"
];

const MessageFileModal = () => {
  //* component beginning
  const { isOpen, onClose, type, data } = useModal();
  console.log({ data })
  const { apiUrl, query } = data;
  const isModalOpen = isOpen && type == "messageFile";
  console.log(`Message file modal is open: ${isModalOpen}`);
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: DEFAULT_SERVER_IMAGE_URL,
    },
  });

  if (!apiUrl || !query) {
    return (
      <Dialog open={isModalOpen} >
        <DialogContent>
          <DialogTitle> Something went wrong</DialogTitle>
        </DialogContent>
      </Dialog>
    )
  }

  const resetForm = () => {
    form.reset({
      fileUrl: DEFAULT_SERVER_IMAGE_URL,
    });
    setFile(null);
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const authToken = await getAuthTokenOnClient();
      if (!file) {

        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setErrorMessage("image format not supported")
        return;
      }

      const { data: { signedUrl, key, bucketName } } = await axios.get(
        `${API_URL}/s3/uploadNewImage?fileType=${file.type}`, {
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

      await axios.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
      });
      await axios.post(apiUrl, {
        imageUrl,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      });
      resetForm();
      router.refresh();
      onClose();
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("[Error][messageFile: fn::onSubmit] ", err.response?.data);
      }
      console.error("[Error][messageFile: fn::onSubmit] ", err);
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
      aria-label="Upload message file"
    >
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Upload your file
        </DialogTitle>
        <DialogDescription className="text-center">
          Allowed file types are .png, .jpeg, .gif, .jpg, .webp, .pdf
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          type="messageFile"
                          value={field.value}
                          defaultValue={DEFAULT_SERVER_IMAGE_URL}
                          onChange={
                            (previewUrl, file) => {
                              field.onChange(previewUrl);
                              setFile(file);
                            }
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 w-full">
              {errorMessage && (
                <div className="text-red-500  text-center mb-4">
                  {errorMessage}
                </div>
              )}
              <Button className="bg-blue-500 text-white dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800" variant="primary" type="submit" disabled={isLoading}>
                send
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
