"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useAuth } from "@/shared/providers/auth-provider";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
import React from "react";

const DeleteMessageModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data
  } = useModal();
  const { apiUrl } = data;
  const router = useRouter()
  const isModalOpen = isOpen && type == "deleteMessage";
  const [isLoading, setIsLoading] = React.useState(false);
  const { authToken } = useAuth();
  const deleteMessage = async () => {
    try {
      setIsLoading(true)
      const url = qs.stringifyUrl({
        url: apiUrl || "",
      })
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      onClose()
      router.refresh()
    } catch (err) {
      console.error("[DELETE_MESSAGE_MODAL] ", err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent aria-description="Invite Link" className="overflow-hidden w-full">
        <DialogTitle className="text-center text-2xl font-bold">
          Delete Server
        </DialogTitle>
        <DialogDescription className="text-center">
          Are you sure want to Delete this message?
        </DialogDescription>
        <div className="flex items-center justify-around mt-3 w-full">
          <Button onClick={onClose} variant="ghost" className="border border-white">Cancel</Button>
          <Button disabled={isLoading} onClick={deleteMessage} className="bg-red-800 text-white hover:bg-red-600/85">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMessageModal;
