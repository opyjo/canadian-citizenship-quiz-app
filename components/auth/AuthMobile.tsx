import { User, LogOut } from "lucide-react";
import { Button } from "../ui/button";

/** mobile view when authenticated */
export function AuthMobile({
  user,
  handleSignOut,
  setIsMobileMenuOpen,
}: Readonly<{
  user: any;
  handleSignOut: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}>) {
  return (
    <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center rounded-full bg-red-100 text-red-600 h-10 w-10">
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {user.user_metadata?.full_name ?? "My Account"}
          </span>
          {user.email && (
            <span className="text-xs text-gray-600 truncate">{user.email}</span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        onClick={() => {
          handleSignOut();
          setIsMobileMenuOpen(false);
        }}
      >
        <LogOut className="mr-3 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
