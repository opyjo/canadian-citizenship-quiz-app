"use client";

import React from "react";
import { AuthMobile } from "./AuthMobile";
import { AuthDesktop } from "./AuthDesktop";
import { GuestBlock } from "./GuestBlock";

interface AuthBlockProps {
  isMobile: boolean;
  isLoading: boolean;
  user: any;
  handleSignOut: () => void;
  router: any;
  setIsMobileMenuOpen: (open: boolean) => void;
}

/** skeleton while loading */
function LoadingPlaceholder({ isMobile }: Readonly<{ isMobile: boolean }>) {
  if (isMobile) {
    return (
      <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-4" />
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
      <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

export default function AuthBlock({
  isMobile,
  isLoading,
  user,
  handleSignOut,
  router,
  setIsMobileMenuOpen,
}: Readonly<AuthBlockProps>) {
  if (isLoading) {
    return <LoadingPlaceholder isMobile={isMobile} />;
  }

  if (user) {
    return isMobile ? (
      <AuthMobile
        user={user}
        handleSignOut={handleSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    ) : (
      <AuthDesktop user={user} handleSignOut={handleSignOut} />
    );
  }

  return (
    <GuestBlock
      isMobile={isMobile}
      router={router}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />
  );
}
