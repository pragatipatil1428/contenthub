"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contents?limit=50");
      const json = await res.json();
      if (json.success) setContents(json.data);
    } catch {
      toast.error("Failed to fetch contents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      const res = await fetch(`/api/contents/${slug}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Content deleted");
        fetchContents();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = contents.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.contentType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-zinc-500 mt-1">
            Manage all your digital content
          </p>
        </div>
        <Link href="/admin/contents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Content
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {filtered.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                    No content found. Start by adding your first content.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/contents/${content.slug}/edit?id=${content.id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {content.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{content.contentType}</Badge>
                    </TableCell>
                    <TableCell>
                      {content.priceType === "FREE" ? (
                        <Badge variant="free">Free</Badge>
                      ) : (
                        <span>₹{content.discountPrice || content.originalPrice}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          content.status === "PUBLISHED"
                            ? "success"
                            : content.status === "DRAFT"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{content.views}</TableCell>
                    <TableCell className="text-zinc-500">
                      {formatDate(content.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/content/${content.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/contents/${content.slug}/edit`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(content.slug)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
