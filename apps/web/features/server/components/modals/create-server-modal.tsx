"use client";

import FileUpload from "@/shared/components/file-uploads";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useModal } from "@/shared/hooks/use-modal-store";
import { CONFIG } from "@/shared/lib/config";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod/v3";
import { useS3Uploads } from "../../hooks/use-s3-uploads";
import { useCreateServerMutation } from "../../hooks/server-mutations";
import { toast } from "sonner";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  image: z.string().optional().default(CONFIG.DEFAULT_SERVER_IMAGE_URL),
  description: z.string().max(500, {
    message: "Description must be 500 characters or fewer.",
  }).optional().default(""),
  isPublic: z.boolean().default(true),
});

const CreateServerModal = () => {
  //* component beginning
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type == "createServer";
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const { uploadServerIcon } = useS3Uploads();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const createServerMutation = useCreateServerMutation();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image:
        CONFIG.DEFAULT_SERVER_IMAGE_URL,
      description: "",
      isPublic: true,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      image: CONFIG.DEFAULT_SERVER_IMAGE_URL,
      description: "",
      isPublic: true,
    });
    setImageFile(null);
  }

  const handleCloseModal = () => {
    resetForm();
    router.refresh();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const image = imageFile ? await uploadServerIcon(imageFile, values.name) : values.image;
      const response = await createServerMutation.mutateAsync({
        name: values.name,
        image: image,
        description: values.description?.trim() ? values.description.trim() : null,
        isPublic: values.isPublic,
      });
      resetForm();
      handleCloseModal();
      router.push(`/channels/${response.data.id}/${response.data.channels[0].id}`);
      toast.success("Server created successfully!");
    } catch (err) {
      console.error("Error creating server:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setErrorMessage(
          axiosError.response?.data?.message ||
          "An error occurred while creating the server."
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      aria-label="Add New Server"
    >
      <DialogContent className="overflow-hidden bg-background rounded-lg shadow-lg w-full max-w-md">
        <DialogTitle className="text-center text-2xl font-bold">
          Customize your Server
        </DialogTitle>
        <DialogDescription className="text-center">
          Give your Server a personality with a Name and an Image. You can
          always change it later.
        </DialogDescription>
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
                          defaultValue={CONFIG.DEFAULT_SERVER_IMAGE_URL}
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
                        disabled={isLoading}
                        className="border border-gray-300 focus-visible:ring-1  focus-visible:ring-offset-1"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        className="border border-gray-300 resize-none focus-visible:ring-1 focus-visible:ring-offset-1"
                        placeholder="What is your server about?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold">
                      Visibility
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      value={field.value ? "public" : "private"}
                      onValueChange={(value) => field.onChange(value === "public")}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          Public — anyone can discover and join
                        </SelectItem>
                        <SelectItem value="private">
                          Private — invite only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-accent">
              {errorMessage && (
                <div className="text-red-500  text-center mb-4">
                  {errorMessage}
                </div>
              )}
              <Button variant="default" type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Server"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServerModal;
