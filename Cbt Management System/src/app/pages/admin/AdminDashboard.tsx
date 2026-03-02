import { Link } from "react-router";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Database,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function AdminDashboard() {
  // Mock data - GET /api/cbt/analytics
  const stats = [
    { label: "Total Exams", value: "248", icon: FileText, color: "text-blue-600", change: "+12%" },
    { label: "Active Students", value: "1,234", icon: Users, color: "text-green-600", change: "+8%" },
    { label: "Question Bank", value: "3,456", icon: Database, color: "text-purple-600", change: "+156" },
    { label: "Avg. Performance", value: "78%", icon: TrendingUp, color: "text-orange-600", change: "+5%" },
  ];

  const monthlyData = [
    { month: "Sep", exams: 45, students: 980 },
    { month: "Oct", exams: 52, students: 1050 },
    { month: "Nov", exams: 48, students: 1120 },
    { month: "Dec", exams: 55, students: 1180 },
    { month: "Jan", exams: 42, students: 1210 },
    { month: "Feb", exams: 48, students: 1234 },
  ];

  const performanceData = [
    { name: "90-100%", value: 234, color: "#10b981" },
    { name: "80-89%", value: 456, color: "#3b82f6" },
    { name: "70-79%", value: 345, color: "#f59e0b" },
    { name: "Below 70%", value: 199, color: "#ef4444" },
  ];

  const recentActivity = [
    { type: "exam", message: "Mathematics Mid-Term published", time: "10 mins ago", icon: FileText },
    { type: "student", message: "45 students completed Physics Quiz", time: "1 hour ago", icon: CheckCircle },
    { type: "alert", message: "8 theory answers pending marking", time: "2 hours ago", icon: AlertCircle },
    { type: "question", message: "12 new questions added to bank", time: "3 hours ago", icon: Database },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">System overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-slate-100 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Exams and student engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} name="Exams" />
                  <Line yAxisId="right" type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Students" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>Student score ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </div>
                <Link to="/admin/reports">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </Link>
              <Link to="/admin/question-bank">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Question Bank
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Reports
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
