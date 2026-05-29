import axiosClient from "@/shared/lib/axios-client";
import { useAuth } from "@/shared/providers/auth-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import queryString from "query-string";
import { z } from "zod/v3";

export const cursorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("before"),
    limit: z.coerce.number().min(1).max(100),
    before: z.string(),
  }),
  z.object({
    type: z.literal("after"),
    limit: z.coerce.number().min(1).max(100),
    after: z.string(),
  }),
]);
interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isLoading, session } = useAuth();

  const fetchMessages = async ({ pageParam = undefined }) => {
    // Add runtime validation (safety net)
    const url = queryString.stringifyUrl({
      url: apiUrl,
      query: pageParam,
    });
    const { data } = await axiosClient.get(url);

    return data.result;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey], // Include paramValue in query key
      queryFn: fetchMessages,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: false,
      enabled: !isLoading && !!session, // Only enable when token is available
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
