"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount);
      }
    } catch {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      }
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      const json = await res.json();
      if (json.success) fetchNotifications();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      NEW_PURCHASE: { label: "Purchase", variant: "success" },
      NEW_USER: { label: "User", variant: "secondary" },
      PAYMENT_PENDING: { label: "Pending", variant: "warning" },
      PAYMENT_SUCCESS: { label: "Payment", variant: "success" },
      PAYMENT_FAILED: { label: "Failed", variant: "destructive" },
      PURCHASE_APPROVED: { label: "Approved", variant: "success" },
      PURCHASE_REJECTED: { label: "Rejected", variant: "destructive" },
    };
    const config = variants[type] || { label: type, variant: "secondary" };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-zinc-500 mt-1">
            View system notifications and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
              <p className="text-zinc-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-zinc-50 ${
                    !notif.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    !notif.isRead
                      ? "bg-blue-100 text-blue-600"
                      : "bg-zinc-100 text-zinc-400"
                  }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm ${!notif.isRead ? "font-semibold" : ""}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      {getTypeBadge(notif.type)}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
