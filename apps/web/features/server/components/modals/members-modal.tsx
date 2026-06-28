"use client";

import { RoleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
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
import {
  useChangeMemberRoleMutation,
  useKickMemberMutation,
} from "@/features/member/hooks/member-mutations";
import { useModal } from "@/shared/hooks/use-modal-store";
import { MemberRole, ServerWithMembersAndUser } from "@/shared/types";
import { capitalizeFirstLetter } from "@/shared/utils/misc";
import { Check, Gavel, Loader2, MoreVertical, Shield } from "lucide-react";

const MembersModal = () => {
  const {
    isOpen,
    onOpen,
    onClose,
    type,
    data,
  } = useModal();
  const kickMutation = useKickMemberMutation();
  const changeRoleMutation = useChangeMemberRoleMutation();
  const { server } = data as { server: ServerWithMembersAndUser };
  const isModalOpen = isOpen && type == "members";
  const membersCount = server?.members?.length || 0;

  // The kicked/updated member id for either in-flight mutation, used to show a
  // per-row spinner. React Query exposes the in-flight variables for us.
  const loadingId =
    (kickMutation.isPending && kickMutation.variables?.memberId) ||
    (changeRoleMutation.isPending && changeRoleMutation.variables?.memberId) ||
    "";

  // Re-feed the modal store with the server returned by the mutation so the
  // member list re-renders; the mutation already invalidated the sidebar query.
  const refreshMembers = (updatedServer: ServerWithMembersAndUser) =>
    onOpen("members", { server: updatedServer });

  const onKick = (memberId: string) => {
    kickMutation.mutate(
      { serverId: server.id, memberId },
      {
        onSuccess: refreshMembers,
        onError: (err) => console.error("[MEMBERS_MODAL:onKick] ", err),
      },
    );
  };

  const onRoleChange = (memberId: string, role: MemberRole) => {
    changeRoleMutation.mutate(
      { serverId: server.id, memberId, role },
      {
        onSuccess: refreshMembers,
        onError: (err) => console.error("[onRoleChange] ", err),
      },
    );
  };


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
          <ScrollArea className="mt-8 max-h-400 pr-6">
            {server?.members && (
              server?.members.map(member => (
                <div key={member.id} className="flex items-center gap-x-2 mb-6">
                  <UserAvatar src={member.user.image ?? undefined} />
                  <div className="flex flex-col gap-y-1">
                    <div className="text-xs font-semibold flex items-center">
                      <span>{member.user.name}</span>
                      <div>
                        <RoleIcon role={member.role} />
                      </div>
                    </div>
                  </div>
                  {
                    member.role != MemberRole.ADMIN  && loadingId != member.id &&
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
