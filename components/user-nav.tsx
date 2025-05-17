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
  LogIn,
  UserPlus,
  Home,
  LayoutDashboard,
  Settings as SettingsIcon,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function UserNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = supabaseClient;

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // Optimistic update
    router.push("/");
    router.refresh();
  };

  const handleProtectedLinkClick = (path: string) => {
    if (!user) {
      router.push("/auth");
    } else {
      router.push(path);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-x-3 sm:gap-x-4">
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      <button
        onClick={() => handleProtectedLinkClick("/dashboard")}
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </button>
      <button
        onClick={() => handleProtectedLinkClick("/settings")}
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
      >
        <SettingsIcon className="h-4 w-4" />
        Settings
      </button>

      <div className="flex items-center gap-x-2 ml-auto sm:ml-4">
        {" "}
        {/* Use ml-auto to push auth items to the right, or adjust gap */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-red-100 text-red-600">
                  {/* You can enhance this to show initials or an avatar if available in user.user_metadata */}
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.user_metadata?.full_name || "My Account"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Removed Home, Dashboard, Settings from here */}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 hover:!text-red-700 focus:!text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
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
          </>
        )}
      </div>
    </nav>
  );
}
