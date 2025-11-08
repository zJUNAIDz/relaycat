import axiosClient from "@/shared/lib/axios-client";
import { useAuth } from "@/shared/providers/auth-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import qs from "query-string";

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
  paramValue
}: ChatQueryProps) => {
  const { isLoading, session } = useAuth();

  const fetchMessages = async ({ pageParam = undefined }) => {
    // Add runtime validation (safety net)


    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramKey]: paramValue
      }
    }, { skipNull: true });

    const { data } = await axiosClient.get(url);

    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: [queryKey], // Include paramValue in query key
    queryFn: fetchMessages,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: false,
    enabled: !isLoading && !!session// Only enable when token is available
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  };
};