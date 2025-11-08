"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { useModal } from "@/shared/hooks/use-modal-store";
import axiosClient from "@/shared/lib/axios-client";
import { API_URL } from "@/shared/lib/constants";
import { useRouter } from "next/navigation";
import qs from "query-string";
import React from "react";

const DeleteChannelModal = () => {

  const {
    isOpen,
    onClose,
    type,
    data: { server, channel }
  } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type == "deleteChannel";
  const [isLoading, setIsLoading] = React.useState(false);
  const deleteChannel = async () => {
    try {
      setIsLoading(true)
      const url = qs.stringifyUrl({
        url: `${API_URL}/channels/${channel?.id}`,
      })
      await axiosClient.delete(url);
      onClose()
      router.refresh()
      // router.push("/")
    } catch (err) {
      console.error("[DELETE_CHANNEL_MODAL] ", err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent aria-description="Invite Link" className="overflow-hidden w-full gap-5">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Delete Channel
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-lg">
          Are you sure want to Delete this Channel <span className="text-blue-500 font-semibold">#{channel?.name}</span>? <br />
          <span className="text-blue-500"> #{channel?.name}</span> will be permanently deleted
        </DialogDescription>
        <div className="flex items-center justify-around w-full px-10">
          <Button onClick={onClose} variant="ghost" className="border border-white ">Cancel</Button>
          <Button disabled={isLoading} onClick={deleteChannel} className="bg-red-800 text-white hover:bg-red-600/85">Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
