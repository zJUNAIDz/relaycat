"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";
import { useState } from "react";
import {
  useFriendRealtime,
  useFriendRequests,
} from "../hooks/use-friends";
import { AddFriend } from "./add-friend";
import { FriendsList } from "./friends-list";
import { PendingRequests } from "./pending-requests";

type Tab = "all" | "pending" | "add";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All friends" },
  { key: "pending", label: "Pending" },
  { key: "add", label: "Add friend" },
];

export const FriendsPanel = () => {
  const [tab, setTab] = useState<Tab>("all");
  // Live-refresh friends/requests when the server notifies us.
  useFriendRealtime();
  const { data: requests } = useFriendRequests();
  const incoming =
    requests?.filter((r) => r.direction === "incoming").length ?? 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b px-4 py-3">
        <span className="mr-2 font-semibold">Friends</span>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative rounded-md px-3 py-1 text-sm transition",
              tab === t.key
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.key === "pending" && incoming > 0 && (
              <Badge className="ml-1.5 px-1.5 py-0 text-[0.65rem]">
                {incoming}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "all" && <FriendsList />}
        {tab === "pending" && <PendingRequests />}
        {tab === "add" && <AddFriend />}
      </div>
    </div>
  );
};
