"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { serverService } from "@/features/server/server-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import React from "react";

const LeaveServerModal = () => {

  const {
    isOpen,
    onClose,
    type,
    data: { server }
  } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type == "leaveServer";
  const [isLoading, setIsLoading] = React.useState(false);
  const leaveServer = async () => {
    if (!server) return;
    try {
      setIsLoading(true)
      await serverService.leaveServer(server.id)
      onClose()
      router.refresh()
      router.push("/")
    } catch (err) {
      console.error("[LEAVE_SERVER_MODAL] ", err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent aria-description="Invite Link" className="overflow-hidden w-full">
        <DialogTitle className="text-center text-2xl font-bold">
          Leave Server
        </DialogTitle>
        <DialogDescription className="text-center">
          Are you sure want to leave server <span className="text-brand">{server?.name}</span>?
        </DialogDescription>
        <div className="flex items-center justify-around w-full">
          <Button onClick={onClose} variant="ghost" className="border-destructive">Cancel</Button>
          <Button disabled={isLoading} onClick={leaveServer} >Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveServerModal;