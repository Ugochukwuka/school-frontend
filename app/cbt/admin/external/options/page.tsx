"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Switch } from "../../../components/ui/switch";
import { toast } from "sonner";
import { CBT_BASE } from "../../../cbt-urls";
import { Loader2, MoreVertical, Pencil, PlusCircle, Trash2 } from "lucide-react";

type ExternalOption = {
  id: number;
  option_label?: string;
  option_text?: string;
  is_correct?: boolean;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function extractArray(json: any): any[] {
  const candidates = [json?.data?.data, json?.data, json];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

export default function AdminExternalOptionsListPage() {
  const [questionId, setQuestionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExternalOption[]>([]);

  const [editing, setEditing] = useState<{
    id: number;
    option_label: string;
    option_text: string;
    is_correct: boolean;
    saving?: boolean;
  } | null>(null);

  const canLoad = questionId.trim().length > 0;

  const load = async () => {
    if (!canLoad) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cbt/external/questions/${questionId.trim()}/options`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to load options.");
      setOptions(extractArray(json) as ExternalOption[]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load options.");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (optionId: number) => {
    try {
      const res = await fetch(`/api/cbt/external/options/${optionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to delete option.");
      toast.success("Option deleted.");
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete option.");
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.option_text.trim()) {
      toast.error("Option text is required.");
      return;
    }
    setEditing({ ...editing, saving: true });
    try {
      const res = await fetch(`/api/cbt/external/options/${editing.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          option_label: editing.option_label || undefined,
          option_text: editing.option_text,
          is_correct: editing.is_correct,
        }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to update option.");
      toast.success("Option updated.");
      setOptions((prev) =>
        prev.map((o) => (o.id === editing.id ? { ...o, option_label: editing.option_label, option_text: editing.option_text, is_correct: editing.is_correct } : o))
      );
      setEditing(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update option.");
      setEditing((p) => (p ? { ...p, saving: false } : p));
    }
  };

  const sorted = useMemo(() => [...options].sort((a, b) => a.id - b.id), [options]);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
          External CBT
        </Link>
        <span>/</span>
        <span className="text-slate-900">Question Options</span>
        <span>/</span>
        <span className="text-slate-900">List options</span>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="tracking-tight">List options for question</CardTitle>
          <CardDescription>GET /cbt/external/questions/:question_id/options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-2">
              <Label>Question ID</Label>
              <Input value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="e.g. 123" className="h-11 rounded-xl" />
            </div>
            <Button onClick={load} disabled={loading || !canLoad} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {loading ? "Loading..." : "Load options"}
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-slate-200" asChild>
              <Link href={`${CBT_BASE}/admin/external/options/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add option
              </Link>
            </Button>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No options loaded yet.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[90px_1fr_120px_64px] gap-0 border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-600">
                <div>Label</div>
                <div>Option</div>
                <div>Correct</div>
                <div className="text-right">Actions</div>
              </div>
              {sorted.map((o) => (
                <div key={o.id} className="grid grid-cols-[90px_1fr_120px_64px] items-center gap-0 px-4 py-3 border-b border-slate-100 last:border-b-0">
                  <div className="text-sm font-semibold text-slate-700">{o.option_label ?? "—"}</div>
                  <div className="text-sm text-slate-900 break-words">{o.option_text ?? ""}</div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${o.is_correct ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {o.is_correct ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[200px] rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-200/50">
                        <DropdownMenuItem
                          className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-slate-100"
                          onClick={() =>
                            setEditing({
                              id: o.id,
                              option_label: o.option_label ?? "",
                              option_text: o.option_text ?? "",
                              is_correct: !!o.is_correct,
                            })
                          }
                        >
                          <Pencil className="h-4 w-4 mr-3 text-slate-500" />
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg py-2.5 px-3 cursor-pointer focus:bg-red-50 focus:text-red-700"
                          onClick={() => remove(o.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="tracking-tight">Update option #{editing.id}</CardTitle>
            <CardDescription>PUT /cbt/external/options/:option_id</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Option label</Label>
                <Input value={editing.option_label} onChange={(e) => setEditing({ ...editing, option_label: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 h-11 shadow-sm">
                <span className="text-slate-700 font-medium">Correct</span>
                <Switch
                  checked={editing.is_correct}
                  onCheckedChange={(v) => setEditing({ ...editing, is_correct: !!v })}
                  className="h-6 w-11 border border-slate-200 data-[state=unchecked]:bg-slate-100 data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Option text</Label>
              <Input value={editing.option_text} onChange={(e) => setEditing({ ...editing, option_text: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <Button onClick={save} disabled={!!editing.saving} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
                {editing.saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pencil className="h-4 w-4 mr-2" />}
                {editing.saving ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-slate-200" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

