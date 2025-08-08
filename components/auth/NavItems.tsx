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
import { useRouter } from "next/navigation";
import {
  handleStartQuiz,
  getQuizModeFromPath,
} from "@/app/utils/quiz-navigation";
import ConfirmationModal from "@/components/confirmation-modal";

type NavItemsProps = {
  readonly onNavigate?: () => void;
  readonly isMobile?: boolean;
};

function NavLink({
  link,
  onNavigate,
  isMobile,
  onShowModal,
}: {
  link: (typeof navLinks)[0];
  onNavigate?: () => void;
  isMobile?: boolean;
  onShowModal?: (modalConfig: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { label, path, Icon, subLinks } = link;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Helper function to check if a path is a quiz path that needs access control
  const isQuizPath = (path: string): boolean => {
    return (
      path === "/quiz" || path === "/quiz/timed" || path.startsWith("/quiz/")
    );
  };

  // Helper function to handle navigation with access checks for quiz paths
  const handleNavigation = async (
    targetPath: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.preventDefault();
    }

    if (isQuizPath(targetPath)) {
      const quizMode = getQuizModeFromPath(targetPath);
      await handleStartQuiz(quizMode, targetPath, {
        router,
        user,
        onShowModal,
      });
    } else {
      router.push(targetPath);
    }

    if (onNavigate) {
      onNavigate();
    }
  };

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
                <button
                  key={subLink.path}
                  onClick={() => handleNavigation(subLink.path)}
                  className="flex w-full text-left text-gray-600 hover:bg-red-100 p-2 rounded-md"
                >
                  {subLink.label}
                </button>
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
              <button
                onClick={() => handleNavigation(subLink.path)}
                className="w-full text-left"
              >
                <div className="flex flex-col">
                  <span>{subLink.label}</span>
                  <span className="text-xs text-gray-500">
                    {subLink.description}
                  </span>
                </div>
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <button
      onClick={(e) => handleNavigation(path, e)}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        !isMobile
          ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
          : "w-full text-left text-gray-700 hover:bg-red-100"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function NavItems({ onNavigate, isMobile }: NavItemsProps) {
  const user = useAuthStore((s) => s.user);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  const handleShowModal = (modalConfig: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }) => {
    setModalState({
      ...modalConfig,
      isOpen: true,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

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
            onShowModal={handleShowModal}
          />
        );
      })}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={() => {
          modalState.onConfirm();
          handleCloseModal();
        }}
        onClose={handleCloseModal}
      />
    </>
  );
}
