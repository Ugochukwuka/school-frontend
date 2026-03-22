"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { CBT_BASE } from "../../../../cbt-urls";
import { Loader2, PlusCircle } from "lucide-react";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminExternalAddCorrectOptionPage() {
  const [questionId, setQuestionId] = useState("");
  const [optionLabel, setOptionLabel] = useState("B");
  const [optionText, setOptionText] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = questionId.trim().length > 0 && optionText.trim().length > 0;

  const add = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cbt/external/questions/${questionId.trim()}/options`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          option_label: optionLabel || undefined,
          option_text: optionText,
          is_correct: true,
        }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.status === false) throw new Error(json?.message ?? "Failed to add correct option.");
      toast.success("Correct option added.");
      setOptionText("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add correct option.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Link href={`${CBT_BASE}/admin/external`} className="hover:text-slate-900 font-medium">
          External CBT
        </Link>
        <span>/</span>
        <span className="text-slate-900">Question Options</span>
        <span>/</span>
        <span className="text-slate-900">Add correct option</span>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="tracking-tight">Add correct option</CardTitle>
          <CardDescription>POST /cbt/external/questions/:question_id/options (is_correct=true)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Question ID</Label>
              <Input value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="e.g. 123" className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Option label</Label>
              <Input value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} placeholder="B" className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Option text</Label>
            <Input value={optionText} onChange={(e) => setOptionText(e.target.value)} placeholder="Type correct option..." className="h-11 rounded-xl" />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <Button onClick={add} disabled={saving || !canSubmit} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              {saving ? "Saving..." : "Add correct option"}
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-slate-200" asChild>
              <Link href={`${CBT_BASE}/admin/external/options`}>Go to list</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

