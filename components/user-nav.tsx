"use client";

import { useState, useEffect, useRef } from "react";
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
  Home as HomeIcon,
  LayoutDashboard,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function UserNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = supabaseClient;
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hamburgerButtonRef.current &&
        hamburgerButtonRef.current.contains(event.target as Node)
      ) {
        return; // Click was on the toggle button itself
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleProtectedLinkClick = (path: string) => {
    if (!user) {
      router.push("/auth");
    } else {
      router.push(path);
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileLinkClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const renderAuthBlock = (isMobile: boolean) => {
    if (loading && isMobile)
      return (
        <div className="h-8 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
      );
    if (loading && !isMobile)
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );

    if (user) {
      if (isMobile) {
        // Mobile Logged In View: User Info + Direct Sign Out Button
        return (
          <div className="flex flex-col space-y-1 mt-4 border-t pt-4">
            {/* User Info Display */}
            <div className="flex items-center gap-2 w-full justify-start px-2 py-1 text-left">
              <div className="flex items-center justify-center rounded-full bg-gray-200 text-gray-700 h-8 w-8">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user.user_metadata?.full_name || user.email || "My Account"}
                </span>
                {user.email && (
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            {/* Sign Out Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:!text-red-700 focus:!text-red-700 focus-visible:ring-0 hover:!bg-red-50 focus:!bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        );
      } else {
        // Desktop Logged In View: DropdownMenu
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-full bg-red-100 text-red-600 h-9 w-9">
                    <User className="h-5 w-5" />
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.user_metadata?.full_name ||
                      user.email ||
                      "My Account"}
                  </p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 hover:!text-red-700 focus:!text-red-700 focus-visible:ring-0 focus:bg-red-50 w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    } else {
      // Unauthenticated view (Sign In / Sign Up buttons)
      return (
        <div
          className={`flex ${
            isMobile
              ? "flex-col space-y-2 mt-4 border-t pt-4"
              : "items-center gap-x-1"
          }`}
        >
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size="sm"
            className={`flex items-center gap-1 ${
              isMobile ? "w-full justify-start" : ""
            }`}
            onClick={() => {
              router.push("/auth");
              setIsMobileMenuOpen(false);
            }}
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
          <Button
            size="sm"
            className={`flex items-center gap-1 ${
              isMobile ? "w-full justify-start" : ""
            }`}
            onClick={() => {
              router.push("/signup");
              setIsMobileMenuOpen(false);
            }}
          >
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </Button>
        </div>
      );
    }
  };

  return (
    <nav className="flex items-center justify-between gap-x-3 sm:gap-x-4 p-4 relative">
      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-x-3 sm:gap-x-4">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
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
      </div>

      {/* Desktop Auth Block - Pushed to the right */}
      <div className="hidden md:flex items-center gap-x-2 ml-auto">
        {renderAuthBlock(false)}
      </div>

      {/* Spacer for Mobile - Pushes Hamburger to the right */}
      <div className="md:hidden flex-grow"></div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        <Button
          ref={hamburgerButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className={`
          md:hidden absolute top-full right-0 w-64 bg-background border rounded-md shadow-lg z-50 p-4 flex flex-col space-y-1
          transform transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 invisible"
          }
        `}
      >
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleMobileLinkClick("/")}
        >
          <HomeIcon className="mr-2 h-4 w-4" /> Home
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleProtectedLinkClick("/dashboard")}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleProtectedLinkClick("/settings")}
        >
          <SettingsIcon className="mr-2 h-4 w-4" /> Settings
        </Button>
        {renderAuthBlock(true)}
      </div>
    </nav>
  );
}
