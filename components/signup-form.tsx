"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabaseClient from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

export default function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = supabaseClient;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Show success message
      setSuccessMessage(
        "Success! Please check your email for the confirmation link. You'll be redirected to your dashboard after verification."
      );

      // If auto-confirmation is enabled (development mode)
      if (
        data?.user &&
        !data?.user?.identities?.[0]?.identity_data?.email_verified
      ) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 5000);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (error: any) {
      setError(error.message || "An error occurred during Google sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account to track your progress and quiz history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          className="w-full mb-4 flex items-center justify-center gap-2"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            className="inline-block"
          >
            <g>
              <path
                fill="#4285F4"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35 24 35c-6.1 0-11.3-4.9-11.3-11S17.9 13 24 13c2.6 0 5 .8 6.9 2.3l6.5-6.5C34.2 5.5 29.4 3.5 24 3.5c-7.2 0-13.4 4.1-16.7 10.2z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.6 0 5 .8 6.9 2.3l6.5-6.5C34.2 5.5 29.4 3.5 24 3.5c-7.2 0-13.4 4.1-16.7 10.2z"
              />
              <path
                fill="#FBBC05"
                d="M24 44.5c5.2 0 10-1.7 13.7-4.7l-6.3-5.2c-2 1.4-4.5 2.2-7.4 2.2-5.2 0-9.7-3.5-11.3-8.2l-6.6 5.1C7.1 40.1 14.9 44.5 24 44.5z"
              />
              <path
                fill="#EA4335"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 2.9-3.5 5.2-6.6 6.6l6.3 5.2C40.9 37.2 44.5 31.5 44.5 24c0-1.3-.1-2.2-.4-3z"
              />
            </g>
          </svg>
          Sign up with Google
        </Button>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Password must be at least 6 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center w-full">
          Already have an account?{" "}
          <Link
            href="/auth"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Sign In
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
