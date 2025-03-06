"use client";

import { RoleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
} from "@/shared/components/ui/dropdown-menu";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useModal } from "@/shared/hooks/use-modal-store";
import { API_URL } from "@/shared/lib/constants";
import { ServerWithMembersAndUser } from "@/shared/types";
import { getAuthTokenOnClient } from "@/shared/utils/client";
import { capitalizeFirstLetter } from "@/shared/utils/misc";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import { Check, Gavel, Loader2, MoreVertical, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import React from "react";


const MembersModal = () => {
  const {
    isOpen,
    onOpen,
    onClose,
    type,
    data,
  } = useModal();
  const router = useRouter()
  const [loadingId, setLoadingId] = React.useState("")
  const { server } = data as { server: ServerWithMembersAndUser };
  const isModalOpen = isOpen && type == "members";
  const membersCount = server?.members?.length || 0;

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId)
      const authToken = await getAuthTokenOnClient()
      const url = qs.stringifyUrl({
        url: `${API_URL}/members/kick`,
        query: {
          serverId: server?.id,
          memberId
        }
      })
      const { data } = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      router.refresh()
      onOpen("members", { server: data.server })
    } catch (err) {
      console.error("[MEMBERS_MODAL:onKick] ", err)
    } finally {
      setLoadingId("")
    }
  }

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId)
      const authToken = await getAuthTokenOnClient()
      const url = qs.stringifyUrl({
        url: `${API_URL}/members/changeRole`,
        query: {
          serverId: server?.id,
          memberId
        }
      })
      const { data } = await axios.patch<{ server: ServerWithMembersAndUser }>(url, { serverId: server.id, memberId, role }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      router.refresh()
      onOpen("members", { server: data.server })
    } catch (error) {
      console.error("[onRoleChange] ", error)
    } finally {
      setLoadingId("")
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden">
          <DialogTitle className="text-center text-2xl font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center">
            {/* Covering impossible edge case of No Members. servers with no members will automatically be deleted in 24 hours. 😋 */}
            {membersCount ? membersCount === 1 ? `${membersCount} Member` : `${membersCount} Members` : "No members"}
          </DialogDescription>
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
                                        <Button
                                          disabled={member.role == role}
                                          variant="ghost"
                                          className="w-full flex items-center justify-start h-6"
                                          onClick={() => onRoleChange(member.id, role as MemberRole)}
                                        >
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
                              <Button variant="ghost" className="h-6" onClick={() => onKick(member.id)}>
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
