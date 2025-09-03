import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import axios from "axios";
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
  Clock,
  Calendar,
  User,
  Building2,
  Phone,
  FileText,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function ReviewQueuePage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<AdvancedFiltersType>({
    search: '',
    statuses: ['SUBMITTED'], // Default to submitted applications
    dateFrom: '',
    dateTo: '',
    agent: '',
    city: ''
  });
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', { role: 'APPROVER', filters }],
    queryFn: async () => {
      const response = await axios.get("http://192.168.0.143:8086/api/approver/applications/submitted", {
        params: {
          role: "APPROVER",
          status: filters.statuses.length > 0 ? filters.statuses.join(",") : "SUBMITTED",
          // q: filters.search || undefined,
        },
      });
      // console.log(response);
      return response.data;
    },
  });



  // Filter applications based on advanced filters
  const filteredApplications = applications.filter(app => {
    // console.log("filteredApplications");
    console.log("filteredApplications" + app.applicationId + "- -  -" + app.applName + "\n");
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
      const filename = `review_queue_${new Date().toISOString().split('T')[0]}.csv`;
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
      statuses: ['SUBMITTED'],
      dateFrom: '',
      dateTo: '',
      agent: '',
      city: ''
    });
    toast.success("Filters reset");
  };

  const getUrgencyBadge = (updatedAt: string) => {
    const daysSince = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 3) {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    } else if (daysSince >= 1) {
      return <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">Due Soon</Badge>;
    }
    return null;
  };

  return (
    <RoleGuard allowedRoles={['APPROVER']}>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve merchant applications
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

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
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
                {filters.search || filters.statuses.length > 1 || filters.dateFrom || filters.dateTo || filters.agent || filters.city
                  ? "Try adjusting your filters to see more results"
                  : "No applications are currently pending review"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base sm:text-lg font-semibold break-words">{app.applName}</h3>
                              {getUrgencyBadge(app.updatedAt)}
                            </div>
                            {app.tradeName && (
                              <p className="text-sm text-muted-foreground">
                                Trading as: {app.tradeName}
                              </p>
                            )}
                          </div>
                          <StatusChip status={app.status} />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Contact:</span>
                            <span className="break-words">{app.contactPerson}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{app.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">PAN:</span>
                            <span className="font-mono">{app.pan}</span>
                          </div>
                        </div>

                        {/* Location & Agent */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Location:</span>
                            <span className="ml-2 break-words">{app.city}, {app.instLocality} - {app.instPincode} </span>
                          </div>
                          {app.applName && (
                            <div>
                              <span className="font-medium text-muted-foreground">Agent:</span>
                              <span className="ml-2">{app.applName}</span>
                            </div>
                          )}
                        </div>

                        {/* Discrepancy Items */}
                        {app.discrepancyItems && app.discrepancyItems.length > 0 && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200 font-medium mb-2">
                              <AlertCircle className="h-4 w-4" />
                              Previous Discrepancy Items:
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

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Submitted {formatDistanceToNow(new Date(app.creationDate), { addSuffix: true })}
                              {/* Submitted {(app.creationDate)} */}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {app.docPath?.length ?? 0} documents
                              {/* {app.panDob} documents */}
                            </div>
                          </div>
                          <Button asChild size="sm" className="w-full sm:w-auto h-10">
                            <Link to={`/applications/${app.applicationId}/review`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
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