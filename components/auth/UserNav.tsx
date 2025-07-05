"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import AuthBlock from "./AuthBlock";
import { useAuthStore } from "@/stores";
import { NavItems } from "./NavItems";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import clsx from "clsx";

export default function UserNav() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // close on outside click
  useOnClickOutside(mobileRef, (e) => {
    if (buttonRef.current?.contains(e.target as Node)) return;
    setMobileOpen(false);
  });

  // close on ESC
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setMobileOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setMobileOpen(false);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }, [signOut, router]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((o) => !o);
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b shadow-sm relative">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-red-600 hover:text-red-700"
      >
        <Image src="/icon.svg" alt="" width={24} height={24} />
        Canada Citizenship Guide
      </Link>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-4">
        <NavItems />
      </div>
      <div className="hidden lg:flex ml-auto">
        <AuthBlock
          isMobile={false}
          isLoading={isLoading}
          user={user}
          handleSignOut={handleSignOut}
          router={router}
          setIsMobileMenuOpen={setMobileOpen}
        />
      </div>

      {/* Mobile hamburger */}
      <div className="lg:hidden">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile panel */}
      <div
        ref={mobileRef}
        onKeyDown={handleKeyDown}
        className={clsx(
          "lg:hidden absolute top-full right-0 w-80 bg-white border rounded-lg shadow-xl p-6 space-y-1 transform transition-all duration-200",
          mobileOpen
            ? "opacity-100 translate-y-2 visible"
            : "opacity-0 -translate-y-4 invisible"
        )}
      >
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <Image src="/icon.svg" alt="" width={20} height={20} />
          <span className="font-semibold">Navigation Menu</span>
        </div>
        <NavItems onNavigate={() => setMobileOpen(false)} isMobile />
        <AuthBlock
          isMobile
          isLoading={isLoading}
          user={user}
          handleSignOut={handleSignOut}
          router={router}
          setIsMobileMenuOpen={setMobileOpen}
        />
      </div>
    </nav>
  );
}
