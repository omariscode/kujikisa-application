import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const STALE_TIME = 1000 * 60 * 2; // 2 minutes
const GC_TIME = 1000 * 60 * 30; // 30 minutes
const RETRY_COUNT = 2;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: RETRY_COUNT,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let queryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
