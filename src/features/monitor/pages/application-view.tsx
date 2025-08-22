import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { RoleGuard } from "@/components/role-guard";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  QrCode
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";

export function MonitorApplicationViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => mockApi.getApplication(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['MONITOR']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!application) {
    return (
      <RoleGuard allowedRoles={['MONITOR']}>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-red-500 mb-4">Application not found</p>
              <Button onClick={() => navigate('/monitor/applications')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['MONITOR']}>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/monitor/applications')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold break-words">{application.businessName}</h1>
              <p className="text-muted-foreground">Application Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={application.status} />
            {application.status === 'APPROVED' && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/monitor/applications/${application.id}/qr`}>
                  <QrCode className="h-4 w-4 mr-2" />
                  View QR
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audit" className="hidden sm:block">Audit Trail</TabsTrigger>
            <TabsTrigger value="audit" className="sm:hidden">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Business Name</Label>
                    <p className="font-medium break-words">{application.businessName}</p>
                  </div>
                  {application.tradeName && (
                    <div>
                      <Label className="text-muted-foreground">Trade Name</Label>
                      <p className="font-medium break-words">{application.tradeName}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">PAN</Label>
                    <p className="font-mono font-medium">{application.pan}</p>
                  </div>
                  {application.gstin && (
                    <div>
                      <Label className="text-muted-foreground">GSTIN</Label>
                      <p className="font-mono font-medium">{application.gstin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Contact Person</Label>
                    <p className="font-medium break-words">{application.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{application.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium break-all">{application.email}</p>
                  </div>
                  {application.agentName && (
                    <div>
                      <Label className="text-muted-foreground">Submitted by Agent</Label>
                      <p className="font-medium">{application.agentName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium break-words">{application.address1}</p>
                  {application.address2 && <p>{application.address2}</p>}
                  <p className="break-words">{application.city}, {application.state} - {application.pincode}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            {(application.rejectionReason || (application.discrepancyItems && application.discrepancyItems.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.rejectionReason && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <Label className="text-red-800 dark:text-red-200 font-medium">Rejection Reason</Label>
                      <p className="text-red-700 dark:text-red-300 mt-1">{application.rejectionReason}</p>
                    </div>
                  )}
                  
                  {application.discrepancyItems && application.discrepancyItems.length > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Label className="text-orange-800 dark:text-orange-200 font-medium">Discrepancy Items</Label>
                      <ul className="text-orange-700 dark:text-orange-300 mt-2 space-y-1">
                        {application.discrepancyItems.map((item, index) => (
                          <li key={index}>• <strong>{item.code}:</strong> {item.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>
                  All documents submitted with this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.docs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No documents uploaded
                  </p>
                ) : (
                  <div className="space-y-3">
                    {application.docs.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium break-words">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete timeline of all actions performed on this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Application Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(application.createdAt), 'PPp')}
                        {application.agentName && ` by ${application.agentName}`}
                      </p>
                    </div>
                  </div>
                  
                  {application.status !== 'DRAFT' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(application.updatedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.discrepancyItems && application.discrepancyItems.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Discrepancy Set</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Issues identified for resolution
                        </p>
                        <div className="space-y-1">
                          {application.discrepancyItems.map((item, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {item.code}: {item.message}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {application.status === 'APPROVED' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-muted-foreground">
                          QR codes generated and merchant activated
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === 'REJECTED' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Application Rejected</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {application.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}