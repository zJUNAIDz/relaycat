"use client";

import FileUpload from "@/shared/components/file-uploads";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter
} from "@/shared/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { API_URL, DEFAULT_SERVER_IMAGE_URL } from "@/shared/lib/constants";
import { useAuth } from "@/shared/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  //TODO: remove this requirement and use fallback image if not specified
  imageUrl: z
    .string()
    .default(DEFAULT_SERVER_IMAGE_URL),
});

const InitialModal = () => {
  //* component beginning
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: DEFAULT_SERVER_IMAGE_URL,
    },
  });
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  //* workaround to avoid Hydration warnings
  const [isMounted, setIsMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const { authToken } = useAuth();
  React.useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

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
      if (!imageFile) {
        if (!values.imageUrl.length) {
          setErrorMessage("Please upload an image");
          return;
        }
        if (values.imageUrl === DEFAULT_SERVER_IMAGE_URL) {
          await axios.post(`${API_URL}/servers`, {
            name: values.name,
            imageUrl: values.imageUrl,
          }, {
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          });
          resetForm();
          router.refresh();
          return;
        }

        //* impossible edge case
        // if (values.imageUrl !== DEFAULT_SERVER_IMAGE_URL) {
        //   setErrorMessage("Image Url is not valid. please refresh the page");
        //   return;
        // }
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

      await axios.put(signedUrl, imageFile, {
        headers: { "Content-Type": imageFile.type },
      });
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
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("[Error][Create Server: fn::onSubmit] ", err.response?.data);
      }
      console.error("[Error][Create Server: fn::onSubmit] ", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Customize your Server
        </DialogTitle>
        <DialogDescription className="text-center text-zinc-500">
          Give your Server a personality with a Name and an Image. You can
          always change it later.
        </DialogDescription>
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
                          type="image"
                          defaultValue={DEFAULT_SERVER_IMAGE_URL}
                          value={field.value}
                          onChange={(previewUrl, file) => {
                            field.onChange(previewUrl);
                            setImageFile(file);
                          }}
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
                        disabled={isLoading}
                        className="focus-visible:ring-0 focus-visble:ring-offset-0"
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
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModal;
