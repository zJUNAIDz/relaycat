"use client";
import { PresenceAvatar } from "@/features/presence/components/presence-avatar";
import { useWatchPresence } from "@/features/presence/presence-provider";
import { UserProfilePopover } from "@/features/profile/components/user-profile-popover";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { RoleBadge } from "@/shared/components/role-badge";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useModal } from "@/shared/hooks/use-modal-store";
import { Permission, usePermissions } from "@/shared/lib/permissions";
import { useQuery } from "@tanstack/react-query";
import { Search, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { serverService } from "../server-service";
import { useMembersSidebar } from "../hooks/use-members-sidebar";

/**
 * Right-hand, toggleable + searchable roster. Clicking a member opens the
 * shared {@link UserProfilePopover} (profile card with Message / Add friend).
 * Reuses the cached `["server", serverId]` query so it costs no extra fetch.
 */
export const ServerMembersSidebar = ({ serverId }: { serverId: string }) => {
  const { isOpen } = useMembersSidebar();
  const { onOpen } = useModal();
  const [query, setQuery] = useState("");

  const { data: server } = useQuery({
    queryKey: ["server", serverId],
    queryFn: () => serverService.getServer(serverId),
    enabled: !!serverId && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const members = useMemo(() => server?.members ?? [], [server]);
  // One subscription for the whole roster; dots read from the presence store.
  useWatchPresence(members.map((m) => m.user.id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.user.name?.toLowerCase().includes(q));
  }, [members, query]);

  const { can } = usePermissions(server);
  const canManageMembers =
    can(Permission.KICK_MEMBERS) || can(Permission.MANAGE_ROLES);

  if (!isOpen) return null;

  return (
    <aside className="hidden md:flex h-full w-60 shrink-0 flex-col border-l border-border bg-background">
      <div className="h-12 flex items-center justify-between px-3 border-b-2 border-border shrink-0">
        <p className="text-xs uppercase font-semibold text-muted-foreground">
          Members — {members.length}
        </p>
        {canManageMembers && server && (
          <ActionTooltip side="bottom" label="Manage Members" className="text-xs">
            <button
              onClick={() => onOpen("members", { server })}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <Settings className="h-4 w-4" />
            </button>
          </ActionTooltip>
        )}
      </div>

      <div className="p-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            className="h-8 pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 pb-3">
          {filtered.map((member) => (
            <UserProfilePopover
              key={member.id}
              userId={member.user.id}
              name={member.user.name ?? "Unknown"}
              avatarUrl={member.user.image}
            >
              <button className="group px-2 py-1.5 rounded-md flex items-center gap-x-2 w-full text-left hover:bg-accent transition">
                <PresenceAvatar
                  userId={member.user.id}
                  src={member.user.image ?? undefined}
                  className="h-8 w-8"
                />
                <span className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition truncate">
                  {member.user.name}
                </span>
                <RoleBadge className="ml-auto shrink-0" roles={member.roles} />
              </button>
            </UserProfilePopover>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No members found.
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
