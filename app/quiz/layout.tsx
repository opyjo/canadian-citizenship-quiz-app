"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = supabaseClient;

  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/auth");
      }
    }
    checkAuth();
  }, [router, supabase]);

  return <>{children}</>;
}
