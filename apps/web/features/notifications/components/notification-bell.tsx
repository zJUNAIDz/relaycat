"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import type { Notification } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff, BellRing, CheckCheck } from "lucide-react";
import { useNotifications } from "../use-notifications";
import { useWebPush } from "../push/use-web-push";

/** Bell trigger + dropdown inbox. Drop it into a header/toolbar. */
export const NotificationBell = ({ className }: { className?: string }) => {
  const { items, unread, loaded, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-accent",
          className,
        )}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {loaded && items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => markRead(n.id)}
                />
              ))}
            </ul>
          )}
        </ScrollArea>

        <PushToggle />
      </PopoverContent>
    </Popover>
  );
};

/** Footer control to opt this device in/out of OS-level push notifications. */
function PushToggle() {
  const { status, busy, enable, disable } = useWebPush();

  if (status === "loading" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
        <BellOff className="h-3.5 w-3.5" />
        Push blocked in browser settings
      </div>
    );
  }

  const on = status === "on";
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => (on ? disable() : enable())}
      className={cn(
        "flex w-full items-center gap-2 border-t px-3 py-2 text-xs transition hover:bg-accent disabled:opacity-50",
        on ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {on ? (
        <BellRing className="h-3.5 w-3.5" />
      ) : (
        <Bell className="h-3.5 w-3.5" />
      )}
      {on ? "Push notifications on" : "Enable push notifications"}
    </button>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const { actor, title, body, read, createdAt } = notification;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-accent",
          !read && "bg-accent/40",
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          {actor?.avatar && <AvatarImage src={actor.avatar} alt={actor.name} />}
          <AvatarFallback>
            {(actor?.name ?? "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          {body && (
            <p className="truncate text-xs text-muted-foreground">{body}</p>
          )}
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        {!read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
        )}
      </button>
    </li>
  );
}