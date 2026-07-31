"use client";

import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users?limit=50");
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchUsers();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const blockedCount = users.filter((u) => u.isBlocked).length;
  const adminCount = users.filter((u) => u.isOwnerAdmin).length;

  const filtered = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" ||
        (statusFilter === "blocked" ? u.isBlocked : !u.isBlocked)) &&
      (roleFilter === "all" ||
        (roleFilter === "admin" ? u.isOwnerAdmin : !u.isOwnerAdmin))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-zinc-500 mt-1">
          Manage all registered users
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {filtered.length} users
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide mr-1">Status:</span>
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="text-xs"
              >
                All ({users.length})
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
                className="text-xs"
              >
                Active ({users.length - blockedCount})
              </Button>
              <Button
                variant={statusFilter === "blocked" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("blocked")}
                className="text-xs"
              >
                Blocked ({blockedCount})
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide mr-1">Role:</span>
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("all")}
                className="text-xs"
              >
                All ({users.length})
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("admin")}
                className="text-xs"
              >
                Admin ({adminCount})
              </Button>
              <Button
                variant={roleFilter === "buyer" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("buyer")}
                className="text-xs"
              >
                Buyer ({users.length - adminCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[700px] md:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Purchases</TableHead>
                  <TableHead className="hidden sm:table-cell">Downloads</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>                      <Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                      {users.length === 0
                        ? "No users found"
                        : "No users match this filter"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u, idx) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs text-zinc-400 text-center">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isOwnerAdmin ? "default" : "secondary"} className="whitespace-nowrap">
                          {u.isOwnerAdmin ? "Admin" : "Buyer"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {u.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-zinc-300 shrink-0" />
                          )}
                          <Badge variant={u.isBlocked ? "destructive" : "success"} className="whitespace-nowrap">
                            {u.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{u._count?.purchases || 0}</TableCell>
                      <TableCell className="hidden sm:table-cell">{u._count?.downloads || 0}</TableCell>
                      <TableCell className="text-zinc-500 text-sm hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(u.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!u.isOwnerAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleAction(u.id, "block")}
                              title={u.isBlocked ? "Unblock" : "Block"}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          {u.isOwnerAdmin && (
                            <span className="text-xs text-zinc-400 italic px-2">Protected</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
