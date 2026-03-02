import { useParams } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function TeacherExamDetails() {
  const { examId } = useParams();

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Exam Details - {examId}</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">Exam details page - To be implemented</p>
            <Badge className="mt-4">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
