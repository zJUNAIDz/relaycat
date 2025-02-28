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
import { getAuthTokenOnClient } from "@/shared/utils/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL!
  const leaveServer = async () => {
    try {
      setIsLoading(true)
      const url = qs.stringifyUrl({
        url: `${API_URL}/servers/leave`,
        query: {
          serverId: server?.id
        }
      })
      await axios.patch(url, {
        serverId: server?.id
      }, {
        headers: {
          Authorization: `Bearer ${await getAuthTokenOnClient()}`
        }
      })
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
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Leave Server
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">
          Are you sure want to leave server <span className="text-blue-500">{server?.name}</span>?
        </DialogDescription>
        <div className="flex items-center justify-around w-full">
          <Button onClick={onClose} variant="ghost" className="border-red-700">Cancel</Button>
          <Button disabled={isLoading} onClick={leaveServer} >Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveServerModal;
