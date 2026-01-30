"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { useModal } from "@/shared/hooks/use-modal-store";
import axiosClient from "@/shared/lib/axios-client";
import { CONFIG } from "@/shared/lib/config";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useRouter } from "next/navigation";
import qs from "query-string";
import React from "react";

const DeleteServerModal = () => {

  const {
    isOpen,
    onClose,
    type,
    data: { server }
  } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type == "deleteServer";
  const [isLoading, setIsLoading] = React.useState(false);

  const leaveServer = async () => {
    try {
      setIsLoading(true)
      const url = qs.stringifyUrl({
        url: `${CONFIG.API_URL}/servers/delete`,
        query: {
          serverId: server?.id
        }
      })
      await axiosClient.delete(url)
      onClose()
      router.refresh()
      router.push(PAGE_ROUTES.HOME)
    } catch (err) {
      console.error("[DELETE_SERVER_MODAL] ", err)
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
          Are you sure want to Delete this Server <span className="text-blue-500">{server?.name}</span>?
        </DialogDescription>
        <div className="flex items-center justify-around w-full">
          <Button onClick={onClose} variant="ghost" className="border border-white">Cancel</Button>
          <Button disabled={isLoading} onClick={leaveServer} className="bg-red-800 text-white hover:bg-red-600/85">Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
