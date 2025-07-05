import { LogIn, UserPlus } from "lucide-react";
import { Button } from "../ui/button";

/** Sign In / Sign Up for guests */
export function GuestBlock({
  isMobile,
  router,
  setIsMobileMenuOpen,
}: Readonly<{
  isMobile: boolean;
  router: any;
  setIsMobileMenuOpen: (open: boolean) => void;
}>) {
  const containerClass = isMobile
    ? "flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200"
    : "flex items-center gap-2";

  return (
    <div className={containerClass}>
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
        Sign In
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
        Sign Up
      </Button>
    </div>
  );
}
