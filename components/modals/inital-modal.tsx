"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import FileUpload from "../file-uploads";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  //TODO: remove this requirement and use fallback image if not specified
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }),
});

const InitialModal = () => { //* component beginning
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  //* workaround to avoid Hydration warnings
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/server/", values);
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error: \n", err);
    }
  };

  return (
    <Dialog open>
      <DialogTrigger>Create</DialogTrigger>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Customize your Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your Server a personality with a Name and an Image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form} >
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
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
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
                    <FormLabel
                      className="uppercase text-xs font-bold text-zinc-700 dark:text-secondary/70"
                    >
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visble:ring-offset-0"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 w-full">
              <Button variant="primary" disabled={isLoading}>Create</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent >
    </Dialog >
  );
};

export default InitialModal;
