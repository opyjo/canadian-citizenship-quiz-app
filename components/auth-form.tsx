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
import { Loader2 } from "lucide-react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = supabaseClient;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      alert("Password reset link sent to your email");
    } catch (error: any) {
      setError(
        error.message || "An error occurred sending the password reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (error: any) {
      setError(error.message || "An error occurred during Google sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          className="w-full mb-4 flex items-center justify-center gap-2"
          variant="outline"
          onClick={handleGoogleSignIn}
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
          Sign in with Google
        </Button>

        <form onSubmit={handleSignIn} className="space-y-4">
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Forgot Password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
