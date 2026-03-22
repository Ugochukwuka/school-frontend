"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Trophy } from "lucide-react";

/**
 * Placeholder for external_user "My External Results".
 * Can later call GET /api/cbt/external/attempts (if backend adds list-by-user) or similar to show past attempts/scores.
 */
export default function ExternalResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My External Results</h1>
        <p className="text-slate-600 mt-1">View your external exam attempts and scores.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="p-3 rounded-xl bg-slate-100 w-fit">
            <Trophy className="w-6 h-6 text-slate-600" />
          </div>
          <CardTitle className="mt-3">Results</CardTitle>
          <CardDescription>
            Your submitted external exam results will appear here. Complete an external exam to see your score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No external results to display yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
