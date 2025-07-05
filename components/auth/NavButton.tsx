"use client";

import { Button } from "@/components/ui/button";
import React from "react";

interface NavButtonProps {
  isMobile: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export default function NavButton({
  isMobile,
  onClick,
  Icon,
  label,
}: Readonly<NavButtonProps>) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start hover:bg-red-50 transition-colors ${
        isMobile ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <Icon className="mr-3 h-4 w-4" />
      {label}
    </Button>
  );
}
