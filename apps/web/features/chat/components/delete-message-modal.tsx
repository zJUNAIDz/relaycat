"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { chatService } from "@/features/chat/chat-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useRouter } from "next/navigation";
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
  const deleteMessage = async () => {
    if (!apiUrl) return;
    try {
      setIsLoading(true)
      await chatService.deleteMessage(apiUrl)
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
      <DialogContent aria-description="Delete Message" className="overflow-hidden w-full">
        <DialogTitle className="text-center text-2xl font-bold">
          Delete Message
        </DialogTitle>
        <DialogDescription className="text-center">
          Are you sure want to Delete this message?
        </DialogDescription>
        <div className="flex items-center justify-around mt-3 w-full">
          <Button onClick={onClose} variant="ghost" className="border border-white">Cancel</Button>
          <Button disabled={isLoading} onClick={deleteMessage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMessageModal;