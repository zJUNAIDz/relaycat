"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { serverService } from "@/features/server/server-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useOrigin } from "@/shared/hooks/use-origin";
import { Check, Copy, RefreshCw } from "lucide-react";
import React from "react";
import { toast } from "sonner";


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
  const isModalOpen = isOpen && type == "invite";
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const onGenerate = async () => {
    if (!server) return;
    try {
      setIsLoading(true);
      const updatedServer = await serverService.regenerateInviteCode(server.id);
      onOpen("invite", { server: updatedServer });
    } catch (err) {
      console.error("Failed to generate new invite link: ", err);
      toast.error("Failed to generate new invite link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseModal = () => {
    onClose()
  }
  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent aria-description="Invite Link" className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Invite Friends
        </DialogTitle>
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
