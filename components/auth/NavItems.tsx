"use client";
import Link from "next/link";
import { navLinks } from "@/app/config/navLinks";
import clsx from "clsx";
import { useAuthStore } from "@/stores";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type NavItemsProps = {
  readonly onNavigate?: () => void;
  readonly isMobile?: boolean;
};

function NavLink({
  link,
  onNavigate,
  isMobile,
}: {
  link: (typeof navLinks)[0];
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { label, path, Icon, subLinks } = link;

  if (subLinks) {
    if (isMobile) {
      return (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-red-100"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="pl-8 space-y-1 py-1">
              {subLinks.map((subLink) => (
                <Link
                  key={subLink.path}
                  href={subLink.path}
                  onClick={onNavigate}
                  className="flex w-full text-left text-gray-600 hover:bg-red-100 p-2 rounded-md"
                >
                  {subLink.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            role="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Icon className="h-4 w-4" />
            {label}
            <ChevronDown className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-50">
          {subLinks.map((subLink) => (
            <DropdownMenuItem key={subLink.path} asChild>
              <Link href={subLink.path} className="w-full">
                <div className="flex flex-col">
                  <span>{subLink.label}</span>
                  <span className="text-xs text-gray-500">
                    {subLink.description}
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      href={path}
      onClick={onNavigate}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        !isMobile
          ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
          : "w-full text-left text-gray-700 hover:bg-red-100"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function NavItems({ onNavigate, isMobile }: NavItemsProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {navLinks.map((link) => {
        if (link.requiresAuth && !user) return null;
        return (
          <NavLink
            key={link.label}
            link={link}
            onNavigate={onNavigate}
            isMobile={isMobile}
          />
        );
      })}
    </>
  );
}
