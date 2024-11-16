import { QueryClient } from '@tanstack/react-query';

class QueryClientSingleton {
  private static instance: QueryClient | null = null;

  public static getQueryClient(): QueryClient {
    if (!QueryClientSingleton.instance) {
      QueryClientSingleton.instance = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      });
    }

    return QueryClientSingleton.instance;
  }

  public static clearInstance(): void {
    QueryClientSingleton.instance = null;
  }
}

export const queryClient = QueryClientSingleton.getQueryClient();

// Export common query keys as constants
export const queryKeys = {
  expenses: ['expenses'] as const,
  groups: ['groups'] as const,
  settlements: ['settlements'] as const,
  users: ['users'] as const,
  // Add more query keys as needed
} as const;
