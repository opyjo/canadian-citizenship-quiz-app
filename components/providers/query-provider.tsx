"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache questions for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Keep in cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests 3 times
            retry: (failureCount, error: any) => {
              // Don't retry on 404s or 403s
              if (error?.status === 404 || error?.status === 403) {
                return false;
              }
              return failureCount < 3;
            },
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
