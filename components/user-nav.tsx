"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  HomeIcon,
  LayoutDashboard,
  SettingsIcon,
  MenuIcon,
  XIcon,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
        return;
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
        <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-4"></div>
      );
    if (loading && !isMobile)
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-100 rounded animate-pulse"></div>
        </div>
      );

    if (user) {
      if (isMobile) {
        return (
          <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center rounded-full bg-red-100 text-red-600 h-10 w-10 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {user.user_metadata?.full_name || "My Account"}
                </span>
                {user.email && (
                  <span className="text-xs text-gray-600 truncate">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        );
      } else {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center justify-center rounded-full bg-red-100 text-red-600 h-10 w-10">
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {user.user_metadata?.full_name || "My Account"}
                  </p>
                  {user.email && (
                    <p className="text-xs leading-none text-gray-600">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    } else {
      return (
        <div
          className={`flex ${
            isMobile
              ? "flex-col space-y-3 mt-6 pt-6 border-t border-gray-200"
              : "items-center gap-2"
          }`}
        >
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size="sm"
            className={`flex items-center gap-2 transition-colors hover:bg-gray-50 ${
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
            className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors ${
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
    <nav className="flex items-center justify-between gap-4 p-4 bg-white border-b border-gray-200 shadow-sm relative">
      {/* Logo/Brand */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl text-red-600 hover:text-red-700 transition-colors"
      >
        <Image
          src="/icon.svg"
          alt="Canada Citizenship Guide Logo"
          width={24}
          height={24}
        />
        <span className="inline">Canada Citizenship Guide</span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <HomeIcon className="h-4 w-4" />
          Home
        </Link>

        <button
          onClick={() => handleProtectedLinkClick("/dashboard")}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>

        <Link
          href="/study-guide"
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <BookOpen className="h-4 w-4" />
          Study Guide
        </Link>

        <Link
          href="/faq"
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <HelpCircle className="h-4 w-4" />
          FAQ
        </Link>

        <button
          onClick={() => handleProtectedLinkClick("/settings")}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Desktop Auth Block */}
      <div className="hidden lg:flex items-center gap-3 ml-auto">
        {renderAuthBlock(false)}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden ml-auto">
        <Button
          ref={hamburgerButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          className="h-10 w-10 hover:bg-red-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className={`
          lg:hidden absolute top-full right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6 flex flex-col space-y-1
          transform transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-2"
              : "opacity-0 -translate-y-4 invisible"
          }
        `}
      >
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <Image
            src="/icon.svg"
            alt="Canada Citizenship Guide Logo"
            width={20}
            height={20}
          />
          <span className="font-semibold text-gray-900">Navigation Menu</span>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 transition-colors"
          onClick={() => handleMobileLinkClick("/")}
        >
          <HomeIcon className="mr-3 h-4 w-4" /> Home
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 transition-colors"
          onClick={() => handleProtectedLinkClick("/dashboard")}
        >
          <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
          {!user && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Login Required
            </Badge>
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 transition-colors"
          onClick={() => handleMobileLinkClick("/study-guide")}
        >
          <BookOpen className="mr-3 h-4 w-4" /> Study Guide
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 transition-colors"
          onClick={() => handleMobileLinkClick("/faq")}
        >
          <HelpCircle className="mr-3 h-4 w-4" /> FAQ
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 transition-colors"
          onClick={() => handleProtectedLinkClick("/settings")}
        >
          <SettingsIcon className="mr-3 h-4 w-4" /> Settings
          {!user && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Login Required
            </Badge>
          )}
        </Button>

        {/* Mobile Auth Section */}
        {renderAuthBlock(true)}
      </div>
    </nav>
  );
}
