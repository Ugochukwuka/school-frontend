import { useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
  // GET /api/cbt/settings
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
    // POST /api/cbt/settings
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
            <p className="text-slate-600 mt-1">Configure CBT system behavior</p>
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
                    <p className="text-sm text-slate-500">
                      Randomize question order for each student
                    </p>
                  </div>
                  <Switch
                    id="shuffle-questions"
                    checked={settings.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, shuffleQuestions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shuffle-options">Shuffle Options</Label>
                    <p className="text-sm text-slate-500">
                      Randomize MCQ option order
                    </p>
                  </div>
                  <Switch
                    id="shuffle-options"
                    checked={settings.shuffleOptions}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, shuffleOptions: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exam Configuration</CardTitle>
                <CardDescription>General exam behavior settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="autosave">Autosave Interval (seconds)</Label>
                  <Input
                    id="autosave"
                    type="number"
                    value={settings.autosaveIntervalSeconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autosaveIntervalSeconds: parseInt(e.target.value),
                      })
                    }
                    className="w-48"
                  />
                  <p className="text-xs text-slate-500">
                    How often to automatically save student answers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={settings.maxAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxAttempts: parseInt(e.target.value),
                      })
                    }
                    className="w-48"
                  />
                  <p className="text-xs text-slate-500">
                    Number of times a student can attempt an exam
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="late-entry">Allow Late Entry</Label>
                    <p className="text-sm text-slate-500">
                      Let students start after the scheduled time
                    </p>
                  </div>
                  <Switch
                    id="late-entry"
                    checked={settings.allowLateEntry}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allowLateEntry: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
                <CardDescription>Prevent cheating and maintain exam integrity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fullscreen">Enable Fullscreen Mode</Label>
                    <p className="text-sm text-slate-500">
                      Force fullscreen during exam
                    </p>
                  </div>
                  <Switch
                    id="fullscreen"
                    checked={settings.enableFullscreen}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableFullscreen: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tab-switch">Prevent Tab Switching</Label>
                    <p className="text-sm text-slate-500">
                      Log when students switch browser tabs
                    </p>
                  </div>
                  <Switch
                    id="tab-switch"
                    checked={settings.preventTabSwitch}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, preventTabSwitch: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Results Display</CardTitle>
                <CardDescription>Configure what students see after submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-results">Show Results Immediately</Label>
                    <p className="text-sm text-slate-500">
                      Display scores right after submission
                    </p>
                  </div>
                  <Switch
                    id="show-results"
                    checked={settings.showResultsImmediately}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showResultsImmediately: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-answers">Show Correct Answers</Label>
                    <p className="text-sm text-slate-500">
                      Let students see the correct answers after submission
                    </p>
                  </div>
                  <Switch
                    id="show-answers"
                    checked={settings.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showCorrectAnswers: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-review">Allow Answer Review</Label>
                    <p className="text-sm text-slate-500">
                      Students can review their submitted answers
                    </p>
                  </div>
                  <Switch
                    id="allow-review"
                    checked={settings.allowReview}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allowReview: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
