import AuthForm from "@/components/auth-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In to Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and quiz history by signing in to your account
          </p>
        </div>
        <AuthForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Don't have an account yet?
          </p>
          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Create an Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
