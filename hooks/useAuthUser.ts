import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase-client";

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
