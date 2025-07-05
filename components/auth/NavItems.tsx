"use client";
import Link from "next/link";
import { navLinks } from "@/app/config/navLinks";
import clsx from "clsx";
import { useAuthStore } from "@/stores";

type NavItemsProps = {
  readonly onNavigate?: () => void;
  readonly isMobile?: boolean;
};

export function NavItems({ onNavigate, isMobile }: NavItemsProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {navLinks.map(({ label, path, Icon, requiresAuth }) => {
        if (requiresAuth && !user) return null;

        return (
          <Link
            key={path}
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
      })}
    </>
  );
}
