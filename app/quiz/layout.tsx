"use client";

// import { useEffect } from "react"; // Commented out for test
// import { useRouter } from "next/navigation"; // Commented out for test
// import supabaseClient from "@/lib/supabase-client"; // Commented out for test
// import { Loader2 } from "lucide-react"; // Commented out for test

// Future imports for this layout can go here if needed.

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const router = useRouter(); // Commented out for test
  // const supabase = supabaseClient; // Commented out for test

  /* Commented out useEffect for testing
  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/auth");
      }
    }
    checkAuth();
  }, [router, supabase]);
  */

  console.log(
    "[QuizLayout] Rendering (auth check useEffect is commented out)."
  );

  return <>{children}</>;
}
