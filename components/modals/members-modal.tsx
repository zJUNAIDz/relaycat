"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "../user-avatar";
const MembersModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { server },
  } = useModal();
  const isModalOpen = isOpen && type == "members";
  const membersCount = server?.members?.length || 0;

  const roleIconMap: Record<string, string> = {
    "ADMIN": "/icons/admin.svg",
    "MODERATOR": "/icons/moderator.svg",
    "GUEST": "/icons/guest.svg",
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {/* Covering impossible edge case of No Members 😋 */}
            {membersCount ? membersCount === 1 ? `${membersCount} Member` : `${membersCount} Members` : "No members"}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <ScrollArea className="mt-8 max-h-[100rem] pr-6">
            {
              server?.members.map(member => (
                <div key={member.id} className="flex items-center gap-x-2 mb-6">
                  <UserAvatar src={member.user.image} />
                  <div className="flex flex-col gap-y-1">
                    <div className="text-xs font-semibold flex items-center">{member.user.name}</div>
                  </div>
                </div>
              ))
            }
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
