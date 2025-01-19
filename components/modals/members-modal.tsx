"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/use-modal-store";
import { MemberRole } from "@prisma/client";
import { Check, Gavel, Loader2, MoreVertical, Shield } from "lucide-react";
import React from "react";
import { RoleIcon } from "../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import qs from "query-string"
import { UserAvatar } from "../user-avatar";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation"
import axios from "axios";
import { getAuthToken } from "@/utils/token";
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const MembersModal = () => {
  const {
    isOpen,
    onOpen,
    onClose,
    type,
    data: { server },
  } = useModal();
  const router = useRouter()
  const [loadingId, setLoadingId] = React.useState("")

  const isModalOpen = isOpen && type == "members";
  const membersCount = server?.members?.length || 0;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center">
            {/* Covering impossible edge case of No Members. servers with no members will automatically be deleted in 24 hours. 😋 */}
            {membersCount ? membersCount === 1 ? `${membersCount} Member` : `${membersCount} Members` : "No members"}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <ScrollArea className="mt-8 max-h-[100rem] pr-6">
            {server?.members && (
              server?.members.map(member => (
                <div key={member.id} className="flex items-center gap-x-2 mb-6">
                  <UserAvatar src={member.user.image} />
                  <div className="flex flex-col gap-y-1">
                    <div className="text-xs font-semibold flex items-center">
                      <span>{member.user.name}</span>
                      <div>
                        <RoleIcon role={member.role} />
                      </div>
                    </div>
                  </div>
                  {
                    server.userId != member.user.id && loadingId != member.id &&
                    (
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4 text-zinc-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="left" className="">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center h-6">
                                <Button variant="ghost" className="h-6">
                                  <Shield className="h-4 w-4 mr-3" /><span>Role</span>
                                </Button>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {
                                    Object.keys(MemberRole).map((role) => (
                                      <DropdownMenuItem
                                        key={role}
                                        className="h-6"
                                      >
                                        <Button disabled={member.role == role} variant="ghost" className="w-full flex items-center justify-start h-6">
                                          <RoleIcon role={role} className="mr-2" />
                                          <span>{capitalizeFirstLetter(role)}</span>
                                          {
                                            member.role == role && (
                                              <Check className="ml-auto h-4 w-4" />
                                            )
                                          }
                                        </Button>
                                      </DropdownMenuItem>
                                    ))
                                  }
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="h-6">
                              <Button variant="ghost" className="h-6">
                                <Gavel className="h-4 w-4 mr-3" /><span>Kick</span>
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  }
                  {
                    loadingId === member.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400 ml-auto" />
                    )
                  }
                </div>
              )))
            }
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
