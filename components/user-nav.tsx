"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Home,
  BarChart,
  Settings,
  LogIn,
  UserPlus,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function UserNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = supabaseClient;

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        // router.refresh(); // Refreshing on every auth change might be too much, consider if needed
      }
    );

    // Initial check for user still useful in case onAuthStateChange doesn't fire immediately
    // or if there's a brief moment before subscription is active.
    // However, the primary update mechanism will be onAuthStateChange.
    // supabase.auth.getUser().then(({ data: { user } }) => {
    //   if (!user && !authListener.subscription) { // If no user and listener hasn't updated yet
    //     setLoading(false);
    //   }
    //   // setUser(user); // Let onAuthStateChange handle this to avoid race conditions
    // });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]); // Added router to dependencies if its refresh is used

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-red-100 text-red-600">
            <User className="h-5 w-5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex w-full cursor-pointer items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex w-full cursor-pointer items-center"
          >
            <BarChart className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex w-full cursor-pointer items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
