"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const paymentMethods = [
  { value: "QR_CODE", label: "QR Code (UPI)" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "STRIPE", label: "Stripe" },
  { value: "CASHFREE", label: "Cashfree" },
  { value: "PHONEPE", label: "PhonePe" },
  { value: "UPI", label: "UPI" },
];

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("ContentHub");
  const [paymentMethod, setPaymentMethod] = useState("QR_CODE");
  const [upiId, setUpiId] = useState("admin@contenthub");
  const [qReceiver, setQReceiver] = useState("ContentHub Admin");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 mt-1">
          Configure your marketplace settings
        </p>
      </div>

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
