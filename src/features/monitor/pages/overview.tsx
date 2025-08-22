import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/role-guard";
import { AdvancedFilters, AdvancedFilters as AdvancedFiltersType } from "@/components/advanced-filters";
import { exportMetricsToCSV, exportApplicationsToCSV } from "@/lib/export-utils";
import {
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
export function MonitorOverviewPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<AdvancedFiltersType>({
    search: '',
    statuses: [],
    dateFrom: '',
    dateTo: '',
    agent: '',
    city: ''
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics-overview'],
    queryFn: () => mockApi.getMetricsOverview(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', { role: 'MONITOR', filters }],
    queryFn: () => mockApi.listApplications({
      role: 'MONITOR',
      status: filters.statuses.length > 0 ? filters.statuses : undefined,
      q: filters.search || undefined,
    }),
  });

  // Filter applications based on advanced filters
  const filteredApplications = applications.filter(app => {
    // Date filtering
    if (filters.dateFrom) {
      const appDate = new Date(app.updatedAt);
      const fromDate = new Date(filters.dateFrom);
      if (appDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const appDate = new Date(app.updatedAt);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (appDate > toDate) return false;
    }

    // Agent filtering
    if (filters.agent && app.agentName !== filters.agent) {
      return false;
    }

    // City filtering
    if (filters.city && app.city !== filters.city) {
      return false;
    }

    return true;
  });

  const handleExportMetrics = async () => {
    if (!metrics) return;

    setIsExporting(true);
    try {
      const filename = `metrics_overview_${new Date().toISOString().split('T')[0]}.csv`;
      exportMetricsToCSV(metrics, filename);
      toast.success("Metrics exported to CSV successfully");
    } catch (error) {
      toast.error("Failed to export metrics");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportApplications = async () => {
    setIsExporting(true);
    try {
      const filename = `applications_data_${new Date().toISOString().split('T')[0]}.csv`;
      exportApplicationsToCSV(filteredApplications, filename);
      toast.success(`Exported ${filteredApplications.length} applications to CSV`);
    } catch (error) {
      toast.error("Failed to export applications");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      statuses: [],
      dateFrom: '',
      dateTo: '',
      agent: '',
      city: ''
    });
    toast.success("Filters reset");
  };

  if (metricsLoading) {
    return (
      <RoleGuard allowedRoles={['MONITOR']}>
        <div className="p-3 sm:p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!metrics) return null;

  const kpiCards = [
    {
      title: "Total Applications",
      value: metrics.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Review",
      value: metrics.submitted,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Approved",
      value: metrics.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Discrepancies",
      value: metrics.discrepancy,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <RoleGuard allowedRoles={['MONITOR']}>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Overview Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor application metrics and performance analytics
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportMetrics}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Metrics'}
            </motion.button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Advanced Filters for Applications Data */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Application Data Analysis</h2>
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExportApplications}
            onReset={handleResetFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
            resultCount={filteredApplications.length}
            isExporting={isExporting}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      7-Day Activity Trend
                    </CardTitle>
                    <CardDescription>
                      Daily submissions and approvals over the last week
                    </CardDescription>
                  </div>
                  <div className="">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Select Date</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>0-10 Days</DropdownMenuItem>
                        <DropdownMenuItem>11-20 Days</DropdownMenuItem>
                        <DropdownMenuItem>21-30 Days</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>



              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        className="text-muted-foreground"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="submissions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Submissions"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="approvals"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="Approvals"
                        dot={{ fill: 'hsl(var(--chart-2))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Agent Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agent Performance
                </CardTitle>
                <CardDescription>
                  Top performing agents by approval rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.agentLeaderboard.map((agent, index) => (
                    <div key={agent.agentName} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.agentName}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{agent.submitted} submitted</span>
                          <span>{agent.approved} approved</span>
                          <span className={`${agent.discrepancyRate <= 10 ? 'text-green-600' :
                            agent.discrepancyRate <= 20 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                            {agent.discrepancyRate}% discrepancy
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.round((agent.approved / agent.submitted) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Application Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: "Draft", value: metrics.draft, color: "bg-gray-200" },
                  { label: "Submitted", value: metrics.submitted, color: "bg-blue-200" },
                  { label: "Discrepancy", value: metrics.discrepancy, color: "bg-orange-200" },
                  { label: "Approved", value: metrics.approved, color: "bg-green-200" },
                  { label: "Rejected", value: metrics.rejected, color: "bg-red-200" },
                  { label: "Total", value: metrics.total, color: "bg-primary/20" },
                ].map((item) => (
                  <div key={item.label} className="text-center space-y-2">
                    <div className={`w-full h-16 ${item.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-2xl font-bold">{item.value}</span>
                    </div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtered Applications Summary */}
        {(filters.search || filters.statuses.length > 0 || filters.dateFrom || filters.dateTo || filters.agent || filters.city) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Filtered Applications Summary</CardTitle>
                <CardDescription>
                  Based on your current filter settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredApplications.length}</div>
                    <p className="text-sm text-muted-foreground">Total Filtered</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredApplications.filter(app => app.status === 'APPROVED').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredApplications.filter(app => app.status === 'SUBMITTED').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredApplications.filter(app => app.status === 'REJECTED').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </RoleGuard>
  );
}