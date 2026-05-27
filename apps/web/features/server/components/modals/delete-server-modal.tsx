"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/shared/components/ui/dialog";
import { useModal } from "@/shared/hooks/use-modal-store";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteServerMutation } from "../../hooks/server-mutations";

const DeleteServerModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { server }
  } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type == "deleteServer";
  const deleteServerMutation = useDeleteServerMutation(server?.id as string);

  const onDeleteServer = async () => {
    try {
      await deleteServerMutation.mutateAsync();
      onClose()
      router.push(PAGE_ROUTES.HOME)
      toast.success(`Server ${server?.name} deleted successfully`)
    } catch (err) {
      toast.error("Failed to delete server")
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
          <Button onClick={onClose} variant="ghost" className="border border-white">
            Cancel
          </Button>
          <Button disabled={deleteServerMutation.isPending} onClick={onDeleteServer} className="bg-red-800 text-white hover:bg-red-600/85">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
