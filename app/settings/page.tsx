"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define a type for subscription details
interface SubscriptionDetails {
  status: string; // e.g., 'active', 'canceled', 'past_due', 'none'
  current_period_end: string | null; // ISO string date
  cancel_at_period_end: boolean;
  active_stripe_subscription_id: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<SubscriptionDetails | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [isUncancelling, setIsUncancelling] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(
    null
  );
  const router = useRouter();
  const supabase = supabaseClient;

  useEffect(() => {
    async function getUserAndProfile() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/auth");
        return;
      }

      setUser(authData.user);
      setEmail(authData.user.email || "");
      setFullName(authData.user.user_metadata?.full_name || "");

      // Fetch profile to get subscription status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "stripe_subscription_status, subscription_current_period_end, cancel_at_period_end, active_stripe_subscription_id"
        )
        .eq("id", authData.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
        // Set a default or error state for subscription details
        setSubscriptionDetails({
          status: "Error fetching status",
          current_period_end: null,
          cancel_at_period_end: false,
          active_stripe_subscription_id: null,
        });
      } else if (profileData) {
        const pData = profileData as any; // Temporary cast to any
        setSubscriptionDetails({
          status: pData.stripe_subscription_status || "none",
          current_period_end: pData.subscription_current_period_end,
          cancel_at_period_end: pData.cancel_at_period_end || false,
          active_stripe_subscription_id:
            pData.active_stripe_subscription_id || null,
        });
      } else {
        setSubscriptionDetails({
          status: "none",
          current_period_end: null,
          cancel_at_period_end: false,
          active_stripe_subscription_id: null,
        });
      }

      setLoading(false);
    }

    getUserAndProfile();
  }, [router, supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while updating your profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      setUpdating(false);
      return;
    }

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) throw new Error("Current password is incorrect");

      // Then update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while updating your password"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancellingSubscription(true);
    setSubscriptionMessage(null);
    setError(null); // Clear general errors as well

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel subscription");
      }

      setSubscriptionMessage(
        result.message || "Subscription cancellation initiated."
      );
      // Re-fetch profile to update subscription status display
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "stripe_subscription_status, subscription_current_period_end, cancel_at_period_end, active_stripe_subscription_id"
        )
        .eq("id", user.id) // user should be available here
        .single();

      if (profileError) {
        console.error(
          "Error re-fetching profile after cancellation:",
          profileError
        );
      } else if (profileData) {
        const pData = profileData as any; // Temporary cast to any
        setSubscriptionDetails({
          status: pData.stripe_subscription_status || "none",
          current_period_end: pData.subscription_current_period_end,
          cancel_at_period_end: pData.cancel_at_period_end || false,
          active_stripe_subscription_id:
            pData.active_stripe_subscription_id || null,
        });
      }
    } catch (err: any) {
      console.error("Cancellation error:", err);
      setSubscriptionMessage(null); // Clear any success message from API if client-side error happens
      setError(
        err.message || "An error occurred while cancelling your subscription."
      );
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsUncancelling(true);
    setSubscriptionMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/stripe/uncancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reactivate subscription.");
      }

      setSubscriptionMessage(
        result.message || "Subscription reactivation initiated."
      );
      // Re-fetch profile to update subscription status display
      // This relies on the webhook having updated the DB quickly.
      // For immediate UI feedback, we could also optimistically update or use the API response.
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "stripe_subscription_status, subscription_current_period_end, cancel_at_period_end, active_stripe_subscription_id"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Error re-fetching profile after reactivation:",
          profileError
        );
      } else if (profileData) {
        const pData = profileData as any;
        setSubscriptionDetails({
          status: pData.stripe_subscription_status || "none", // Or infer 'active' as discussed before
          current_period_end: pData.subscription_current_period_end,
          cancel_at_period_end: pData.cancel_at_period_end || false,
          active_stripe_subscription_id:
            pData.active_stripe_subscription_id || null,
        });
      }
    } catch (err: any) {
      console.error("Reactivation error:", err);
      setSubscriptionMessage(null);
      setError(
        err.message || "An error occurred while reactivating your subscription."
      );
    } finally {
      setIsUncancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed. Contact support if you need to
                      update your email.
                    </p>
                  </div>
                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  View and manage your subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {subscriptionMessage && (
                  <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                    <AlertDescription>{subscriptionMessage}</AlertDescription>
                  </Alert>
                )}

                {subscriptionDetails ? (
                  <div className="space-y-3">
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="capitalize">
                        {subscriptionDetails.status}
                      </span>
                    </p>
                    {subscriptionDetails.status === "active" &&
                      subscriptionDetails.current_period_end && (
                        <p>
                          <strong>Renews on:</strong>{" "}
                          {new Date(
                            subscriptionDetails.current_period_end
                          ).toLocaleDateString()}
                        </p>
                      )}
                    {subscriptionDetails.cancel_at_period_end &&
                      subscriptionDetails.current_period_end && (
                        <div className="space-y-2">
                          <p className="text-orange-600 font-semibold">
                            Your subscription is set to cancel at the end of the
                            current billing period:{" "}
                            {new Date(
                              subscriptionDetails.current_period_end
                            ).toLocaleDateString()}
                            . You will have access until this date.
                          </p>
                          {subscriptionDetails.status === "active" && (
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={isUncancelling}
                              variant="outline" // Or your preferred variant
                              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                            >
                              {isUncancelling ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Renew subscription
                            </Button>
                          )}
                        </div>
                      )}

                    {subscriptionDetails.status === "active" &&
                      !subscriptionDetails.cancel_at_period_end && (
                        <Button
                          onClick={handleCancelSubscription}
                          disabled={
                            cancellingSubscription ||
                            !subscriptionDetails.active_stripe_subscription_id
                          }
                          variant="destructive"
                        >
                          {cancellingSubscription ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Cancel Subscription
                        </Button>
                      )}
                    {subscriptionDetails.status !== "active" &&
                      subscriptionDetails.status !== "none" &&
                      subscriptionDetails.status !== "Error fetching status" &&
                      !subscriptionDetails.cancel_at_period_end && (
                        <p className="text-muted-foreground">
                          Your subscription is not currently active. Please
                          check your payment details or contact support.
                        </p>
                      )}
                    {subscriptionDetails.status === "none" && (
                      <p className="text-muted-foreground">
                        You do not have an active subscription.
                      </p>
                      // Optionally, add a button/link to your pricing page here
                      // <Button onClick={() => router.push('/pricing')}>View Plans</Button>
                    )}
                  </div>
                ) : (
                  <p>Loading subscription details...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
