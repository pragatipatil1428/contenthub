"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { useAuthStore } from "@/store";
import { getInitials } from "@/lib/utils";

const paymentMethods = [
  { value: "QR_CODE", label: "QR Code (UPI)" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "STRIPE", label: "Stripe" },
  { value: "CASHFREE", label: "Cashfree" },
  { value: "PHONEPE", label: "PhonePe" },
  { value: "UPI", label: "UPI" },
];

export default function AdminSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [siteName, setSiteName] = useState("ContentHub");
  const [paymentMethod, setPaymentMethod] = useState("QR_CODE");
  const [upiId, setUpiId] = useState("admin@contenthub");
  const [qReceiver, setQReceiver] = useState("ContentHub Admin");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
        toast.success("Profile updated successfully");
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-zinc-500 mt-1">
            Configure your marketplace settings
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-500" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="text-base">
                {user ? getInitials(user.name) : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Full Name</Label>
                <Input id="admin-name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone (optional)</Label>
              <Input id="admin-phone" placeholder="+91 98765 43210" {...register("phone")} />
            </div>

            <Button type="submit" className="gap-2" disabled={profileLoading}>
              {profileLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Website Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500 mt-1">
              This will be the default payment method. Users can still see other options.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>QR Payment Settings</Label>
            <p className="text-xs text-zinc-500 mb-2">
              Configure QR code payment details shown to buyers
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="admin@upi"
                />
              </div>
              <div>
                <Label htmlFor="qReceiver">Receiver Name</Label>
                <Input
                  id="qReceiver"
                  value={qReceiver}
                  onChange={(e) => setQReceiver(e.target.value)}
                  placeholder="Receiver name"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Online Payment Gateways</Label>
            <p className="text-xs text-zinc-500">
              Online payment gateways (Razorpay, Stripe, Cashfree, PhonePe) are currently disabled.
              Configure API keys in environment variables to enable them.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
