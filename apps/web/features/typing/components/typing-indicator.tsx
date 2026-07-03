"use client";

import { useTypers } from "../use-typing";

interface TypingIndicatorProps {
  chatId: string;
  currentUserId: string;
}

/** Phrase the active typers the way Discord does. */
function phrase(names: string[]): string {
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]} are typing…`;
  return "Several people are typing…";
}

/**
 * A subtle line above the input showing who's currently typing. Renders nothing
 * (no reserved space) when the chat is quiet.
 */
export const TypingIndicator = ({ chatId, currentUserId }: TypingIndicatorProps) => {
  const typers = useTypers(chatId, currentUserId);
  if (typers.length === 0) return null;

  return (
    <div className="h-5 px-6 -mt-3 flex items-center gap-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
      </span>
      <span className="font-medium">{phrase(typers)}</span>
    </div>
  );
};