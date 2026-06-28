"use client";

import { useDeleteChannelMutation } from "@/features/channel/hooks/channel-mutations";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { useModal } from "@/shared/hooks/use-modal-store";
import { useRouter } from "next/navigation";

const DeleteChannelModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { channel }
  } = useModal();
  const router = useRouter();
  const deleteChannelMutation = useDeleteChannelMutation();
  const isModalOpen = isOpen && type == "deleteChannel";

  const deleteChannel = async () => {
    if (!channel) return;
    try {
      await deleteChannelMutation.mutateAsync(channel.id);
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[DELETE_CHANNEL_MODAL] ", err);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent aria-description="Delete Channel" className="overflow-hidden w-full gap-5 bg-background">
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
          <Button disabled={deleteChannelMutation.isPending} onClick={deleteChannel} className="bg-red-800 text-white hover:bg-red-600/85">Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
