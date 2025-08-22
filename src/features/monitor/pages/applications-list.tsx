import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { ApplicationStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { RoleGuard } from "@/components/role-guard";
import { AdvancedFilters, AdvancedFilters as AdvancedFiltersType } from "@/components/advanced-filters";
import { exportApplicationsToCSV } from "@/lib/export-utils";
import { 
  Eye, 
  Calendar,
  User,
  Building2,
  Phone,
  FileText,
  AlertCircle,
  QrCode
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function MonitorApplicationsListPage() {
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

  const { data: applications = [], isLoading } = useQuery({
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = `monitor_applications_${new Date().toISOString().split('T')[0]}.csv`;
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

  const getActionButton = (app: any) => {
    switch (app.status) {
      case 'APPROVED':
        return (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
              <Link to={`/monitor/applications/${app.id}/view`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
              <Link to={`/monitor/applications/${app.id}/qr`}>
                <QrCode className="h-4 w-4 mr-2" />
                QR
              </Link>
            </Button>
          </div>
        );
      default:
        return (
          <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
            <Link to={`/monitor/applications/${app.id}/view`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        );
    }
  };

  return (
    <RoleGuard allowedRoles={['MONITOR']}>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">All Applications</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and view all merchant applications across the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {filteredApplications.length} applications
            </Badge>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          onReset={handleResetFilters}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          resultCount={filteredApplications.length}
          isExporting={isExporting}
        />

        {/* Applications Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground text-center">
                {filters.search || filters.statuses.length > 0 || filters.dateFrom || filters.dateTo || filters.agent || filters.city
                  ? "Try adjusting your search or filters"
                  : "No applications are available in the system"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {app.businessName}
                        </CardTitle>
                        {app.tradeName && (
                          <CardDescription className="line-clamp-1">
                            Trading as: {app.tradeName}
                          </CardDescription>
                        )}
                      </div>
                      <StatusChip status={app.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">Contact:</span>
                        <span className="break-words">{app.contactName}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">Phone:</span>
                        <span>{app.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">PAN:</span>
                        <span className="font-mono">{app.pan}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">City:</span>
                        <span>{app.city}, {app.state}</span>
                      </div>
                      {app.agentName && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium w-20">Agent:</span>
                          <span>{app.agentName}</span>
                        </div>
                      )}
                    </div>

                    {app.discrepancyItems && app.discrepancyItems.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">
                          Discrepancy Items:
                        </div>
                        <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                          {app.discrepancyItems.slice(0, 2).map((item, i) => (
                            <li key={i}>• {item.message}</li>
                          ))}
                          {app.discrepancyItems.length > 2 && (
                            <li>• +{app.discrepancyItems.length - 2} more items</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {app.rejectionReason && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                          Rejection Reason:
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                      </div>
                      {getActionButton(app)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}