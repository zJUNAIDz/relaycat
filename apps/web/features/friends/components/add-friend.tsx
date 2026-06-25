"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useFriendActions, useUserSearch } from "../hooks/use-friends";

/**
 * Add-friend surface: type an exact username to send a request, or search to
 * discover users and add them inline.
 */
export const AddFriend = () => {
  const [query, setQuery] = useState("");
  const { sendRequest, sendRequestToUser } = useFriendActions();
  const { data: results, isFetching } = useUserSearch(query);

  const onSubmitExact = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = query.trim().toLowerCase();
    if (handle) sendRequest.mutate(handle);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmitExact} className="space-y-2">
        <p className="text-sm font-semibold">Add friend</p>
        <p className="text-xs text-muted-foreground">
          Find people by their username.
        </p>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="username"
            autoComplete="off"
          />
          <Button type="submit" disabled={!query.trim() || sendRequest.isPending}>
            <UserPlus className="mr-1 h-4 w-4" /> Send
          </Button>
        </div>
      </form>

      {query.trim() && (
        <div className="space-y-1">
          {isFetching && (
            <p className="text-xs text-muted-foreground">Searching…</p>
          )}
          {results?.length === 0 && !isFetching && (
            <p className="text-xs text-muted-foreground">No users found.</p>
          )}
          {results?.map((u) => (
            <div
              key={u.userId}
              className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <UserAvatar src={u.avatar ?? undefined} className="h-8 w-8" />
                <div className="leading-tight">
                  <p className="text-sm font-medium">
                    {u.displayName || u.name}
                  </p>
                  {u.username && (
                    <p className="text-xs text-muted-foreground">
                      @{u.username}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={sendRequestToUser.isPending}
                onClick={() => sendRequestToUser.mutate(u.userId)}
              >
                <UserPlus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
