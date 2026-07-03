"use client";

import { RoleBadge } from "@/shared/components/role-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useKickMemberMutation } from "@/features/member/hooks/member-mutations";
import {
  useAssignRoleMutation,
  useRolesQuery,
  useUnassignRoleMutation,
} from "@/features/role/hooks/role-mutations";
import { serverService } from "@/features/server/server-service";
import { useModal } from "@/shared/hooks/use-modal-store";
import { ServerWithMembersAndUser } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Gavel, Loader2, MoreVertical, Shield } from "lucide-react";

const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { server: initialServer } = data as {
    server: ServerWithMembersAndUser;
  };
  const isModalOpen = isOpen && type == "members";
  const serverId = initialServer?.id;

  // Prefer the live cached server (roles/members change as we mutate); fall back
  // to the snapshot the modal was opened with.
  const { data: liveServer } = useQuery({
    queryKey: ["server", serverId],
    queryFn: () => serverService.getServer(serverId),
    enabled: !!serverId && isModalOpen,
    initialData: initialServer,
  });
  const server = liveServer ?? initialServer;

  const kickMutation = useKickMemberMutation();
  const assignMutation = useAssignRoleMutation(serverId);
  const unassignMutation = useUnassignRoleMutation(serverId);
  const { data: roles = [] } = useRolesQuery(serverId, isModalOpen);
  // Assignable roles exclude the implicit @everyone.
  const assignableRoles = roles.filter((r) => !r.isDefault);

  const membersCount = server?.members?.length || 0;

  const loadingId =
    (kickMutation.isPending && kickMutation.variables?.memberId) ||
    (assignMutation.isPending && assignMutation.variables?.memberId) ||
    (unassignMutation.isPending && unassignMutation.variables?.memberId) ||
    "";

  const onKick = (memberId: string) =>
    kickMutation.mutate(
      { serverId, memberId },
      { onError: (err) => console.error("[MEMBERS_MODAL:onKick] ", err) },
    );

  const onToggleRole = (memberId: string, roleId: string, has: boolean) => {
    const mutation = has ? unassignMutation : assignMutation;
    mutation.mutate(
      { memberId, roleId },
      { onError: (err) => console.error("[MEMBERS_MODAL:onToggleRole] ", err) },
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Manage Members
        </DialogTitle>
        <DialogDescription className="text-center">
          {membersCount
            ? membersCount === 1
              ? `${membersCount} Member`
              : `${membersCount} Members`
            : "No members"}
        </DialogDescription>
        <div className="p-6">
          <ScrollArea className="mt-8 max-h-400 pr-6">
            {server?.members &&
              server.members.map((member) => {
                const isOwner = member.userId === server.ownerId;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-x-2 mb-6"
                  >
                    <UserAvatar src={member.user.image ?? undefined} />
                    <div className="flex flex-col gap-y-1">
                      <div className="text-xs font-semibold flex items-center gap-x-1">
                        <span>{member.user.name}</span>
                        {isOwner ? (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <RoleBadge roles={member.roles} />
                        )}
                      </div>
                    </div>
                    {!isOwner && loadingId != member.id && (
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="left">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center h-6">
                                <Button variant="ghost" className="h-6">
                                  <Shield className="h-4 w-4 mr-3" />
                                  <span>Roles</span>
                                </Button>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {assignableRoles.length === 0 && (
                                    <DropdownMenuItem
                                      disabled
                                      className="text-xs"
                                    >
                                      No roles yet
                                    </DropdownMenuItem>
                                  )}
                                  {assignableRoles.map((role) => {
                                    const has = member.roles.some(
                                      (r) => r.id === role.id,
                                    );
                                    return (
                                      <DropdownMenuItem
                                        key={role.id}
                                        className="h-6"
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          onToggleRole(member.id, role.id, has);
                                        }}
                                      >
                                        <span
                                          className="mr-2 inline-block h-2 w-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              role.color ?? "#99aab5",
                                          }}
                                        />
                                        <span>{role.name}</span>
                                        {has && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="h-6"
                              onSelect={() => onKick(member.id)}
                            >
                              <Button variant="ghost" className="h-6">
                                <Gavel className="h-4 w-4 mr-3" />
                                <span>Kick</span>
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    {loadingId === member.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                    )}
                  </div>
                );
              })}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
