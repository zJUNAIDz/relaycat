"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { useOrigin } from "@/hooks/use-origin";
import axios from "axios";
import { Check, Copy, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

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
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );
      onOpen("invite", { server: response.data });
    } catch (err) {
      console.error("Failed to generate new invite link: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server Invite Link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              type="text"
              disabled={isLoading}
              className="bg-zinc-300/50  border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button
              disabled={isLoading}
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
            className="text-xs text-zinc-500 mt-4 transition"
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
