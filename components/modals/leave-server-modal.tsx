"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { publicEnv } from "@/utils/publicEnv";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
import React from "react";
import { Button } from "../ui/button";
import { getAuthToken } from "@/utils/token";
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
  const apiEndpoint = publicEnv("API_URL") || "http://localhost:3001"
  const leaveServer = async () => {
    try {
      setIsLoading(true)
      const url = qs.stringifyUrl({
        url: `${apiEndpoint}/servers/leave`,
        query: {
          serverId: server?.id
        }
      })
      await axios.patch(url, {
        serverId: server?.id
      }, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`
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
