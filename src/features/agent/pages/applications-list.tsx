import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { ApplicationStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { RoleGuard } from "@/components/role-guard";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Edit,
  Send,
  Clock,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const statusOptions: { value: ApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'DISCREPANCY', label: 'Discrepancy' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function ApplicationsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', { status: statusFilter, q: searchQuery }],
    queryFn: async () => {
      const response = await axios.get(
        "http://192.168.0.123:8081/api/agents/getAllApplications",
        {
          params: {
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            q: searchQuery || undefined,
          },
        }
      );
      return response.data; // backend should return an array
    },
    keepPreviousData: true, // optional, keeps old data while fetching new
  });


  const getActionButton = (app: any) => {
    switch (app.status) {
      case 'DRAFT':
        return (
          <Button asChild size="sm" variant="outline">
            <Link to={`/applications/${app.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Continue
            </Link>
          </Button>
        );
      case 'DISCREPANCY':
        return (
          <Button asChild size="sm" variant="outline">
            <Link to={`/applications/${app.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Fix Issues
            </Link>
          </Button>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Button asChild size="sm" variant="outline">
            <Link to={`/applications/${app.id}/qr`}>
              <FileText className="h-4 w-4 mr-2" />
              View QR
            </Link>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <RoleGuard allowedRoles={['AGENT']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground mt-1">
              Manage your merchant applications and track their status
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/applications/new">
              <Plus className="h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by business name, contact, phone, or PAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: ApplicationStatus | 'ALL') => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery || statusFilter !== 'ALL'
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first merchant application"
                }
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button asChild>
                  <Link to="/applications/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Application
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((app, index) => (
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
                          {app.applName}
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
                        <span>{app.contactPerson}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">Phone:</span>
                        <span>{app.mobile}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium w-20">PAN:</span>
                        <span className="font-mono">{app.pan}</span>
                      </div>
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

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(app.creationDate), { addSuffix: true })}
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