import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number; // Represents the total number of items in your message arrays
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  // 1. Handle Pagination (Scrolling up to load historical messages)
  useEffect(() => {
    const topDiv = chatRef?.current;
    if (!topDiv) return;

    const handleScroll = () => {
      const scrollTop = topDiv.scrollTop;
      
      // In a standard scroll layout, scrollTop === 0 means we hit the very top
      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }
    };

    topDiv.addEventListener("scroll", handleScroll);
    return () => topDiv.removeEventListener("scroll", handleScroll);
  }, [shouldLoadMore, loadMore, chatRef]);

  // 2. Handle Auto-Scrolling (Initial load & new incoming messages)
  useEffect(() => {
    const bottomDiv = bottomRef?.current;
    const topDiv = chatRef?.current;

    if (!topDiv || !bottomDiv) return;

    const shouldAutoScroll = () => {
      // Always snap to bottom on the very first render/load
      if (!hasInitialized) {
        setHasInitialized(true);
        return true;
      }

      // Math fix: Determine how many pixels away from the absolute bottom the user is
      const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      
      // If they are within 300px of the bottom, consider them "near the bottom"
      return distanceFromBottom <= 300;
    };

    // Use a tiny macro-task delay to let the DOM paint the incoming messages first
    const timeoutId = setTimeout(() => {
      if (shouldAutoScroll()) {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [bottomRef, chatRef, count, hasInitialized]); // <-- Added 'count' here!
};