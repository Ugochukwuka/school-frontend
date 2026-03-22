"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";

const CBT_BASE = "/cbt";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    shuffleQuestions: true,
    shuffleOptions: true,
    autosaveIntervalSeconds: 60,
    maxAttempts: 1,
    allowLateEntry: false,
    showResultsImmediately: false,
    enableFullscreen: true,
    preventTabSwitch: true,
    showCorrectAnswers: false,
    allowReview: true,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
    setTimeout(() => {
      router.push(`${CBT_BASE}/admin`);
    }, 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-600 mt-1">Configure CBT system behavior (use cbtAdmin.getSettings / saveSettings)</p>
        </div>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="exam" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exam">Exam Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        <TabsContent value="exam" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Settings</CardTitle>
              <CardDescription>Configure how questions are presented</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
                  <p className="text-sm text-slate-500">Randomize question order for each student</p>
                </div>
                <Switch
                  id="shuffle-questions"
                  checked={settings.shuffleQuestions}
                  onCheckedChange={(checked) => setSettings({ ...settings, shuffleQuestions: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shuffle-options">Shuffle Options</Label>
                  <p className="text-sm text-slate-500">Randomize MCQ option order</p>
                </div>
                <Switch
                  id="shuffle-options"
                  checked={settings.shuffleOptions}
                  onCheckedChange={(checked) => setSettings({ ...settings, shuffleOptions: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autosave">Autosave Interval (seconds)</Label>
                  <p className="text-sm text-slate-500">How often to save answers automatically</p>
                </div>
                <Input
                  id="autosave"
                  type="number"
                  value={settings.autosaveIntervalSeconds}
                  onChange={(e) => setSettings({ ...settings, autosaveIntervalSeconds: parseInt(e.target.value, 10) || 60 })}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="max-attempts">Max Attempts</Label>
                  <p className="text-sm text-slate-500">Maximum attempts per student per exam</p>
                </div>
                <Input
                  id="max-attempts"
                  type="number"
                  min={1}
                  value={settings.maxAttempts}
                  onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value, 10) || 1 })}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-late">Allow Late Entry</Label>
                  <p className="text-sm text-slate-500">Allow students to start after exam has begun</p>
                </div>
                <Switch
                  id="allow-late"
                  checked={settings.allowLateEntry}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowLateEntry: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-results">Show Results Immediately</Label>
                  <p className="text-sm text-slate-500">Show score and correct answers after submit</p>
                </div>
                <Switch
                  id="show-results"
                  checked={settings.showResultsImmediately}
                  onCheckedChange={(checked) => setSettings({ ...settings, showResultsImmediately: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Exam security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prevent Tab Switch</Label>
                  <p className="text-sm text-slate-500">Warn or lock when student switches tabs</p>
                </div>
                <Switch
                  checked={settings.preventTabSwitch}
                  onCheckedChange={(checked) => setSettings({ ...settings, preventTabSwitch: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>Result and review options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Correct Answers</Label>
                  <p className="text-sm text-slate-500">Show correct answers in result review</p>
                </div>
                <Switch
                  checked={settings.showCorrectAnswers}
                  onCheckedChange={(checked) => setSettings({ ...settings, showCorrectAnswers: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Review</Label>
                  <p className="text-sm text-slate-500">Allow students to review their answers after submit</p>
                </div>
                <Switch
                  checked={settings.allowReview}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowReview: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
