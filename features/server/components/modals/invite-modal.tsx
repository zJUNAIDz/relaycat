"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useOrigin } from "@/shared/hooks/use-origin";
import { getAuthTokenOnClient } from "@/shared/utils/client";
import axios from "axios";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const InviteModal = () => {
  //* component beginning
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    isOpen,
    onOpen,
    onClose,
    type,
    data: { server },
  } = useModal();
  const origin = useOrigin();
  const router = useRouter()
  const isModalOpen = isOpen && type == "invite";
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const onGenerate = async () => {
    try {
      setIsLoading(true);
      const token = await getAuthTokenOnClient();
      const response = await axios.patch(
        `http://localhost:3001/servers/${server?.id}/invite-code`, {}, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      // router.refresh()
      onOpen("invite", { server: response.data.server });
    } catch (err) {
      console.error("Failed to generate new invite link: ", err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseModal = () => {
    // router.refresh()
    onClose()
  }
  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent aria-description="Invite Link" className="overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold">
            Server Invite Link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              type="text"
              disabled={isLoading}
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
              value={inviteUrl}
              readOnly
            />
            <Button
              disabled={isLoading || copied}
              variant="ghost"
              size="icon"
              onClick={onCopy}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={onGenerate}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs mt-4 transition"
          >
            Generate a New Invite Link
            {isLoading ? (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin dark:text-zinc-500 transition" />
            ) : (
              <RefreshCw className="w-4 h-4 ml-2 dark:text-black" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
