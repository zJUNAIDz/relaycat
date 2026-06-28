import axiosClient from "@/shared/lib/axios-client";
import { useAuth } from "@/shared/providers/auth-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import queryString from "query-string";
import { z } from "zod/v4";

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

export type Cursor = z.infer<typeof cursorSchema>;

export type ChatPage<T> = {
  result: T[];
  nextCursor: string | null;
};

export const useChatQuery = <T,>({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isLoading, session } = useAuth();

  const fetchMessages = async ({
    pageParam,
  }: {
    pageParam?: unknown;
  }): Promise<ChatPage<T>> => {
    const parsedCursor =
      pageParam == null
        ? ({ success: true, data: undefined } as const)
        : cursorSchema.safeParse(pageParam);

    const url = queryString.stringifyUrl({
      url: apiUrl,
      query: parsedCursor.data,
    });

    const { data } = await axiosClient.get(url);
    return data as ChatPage<T>;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey, paramKey, paramValue],
      queryFn: fetchMessages,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage?.nextCursor
          ? ({
              type: "before",
              limit: 10,
              before: lastPage.nextCursor,
            } satisfies Cursor)
          : undefined,
      refetchInterval: false,
      enabled: !isLoading && !!session, // Only enable when token is available
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
