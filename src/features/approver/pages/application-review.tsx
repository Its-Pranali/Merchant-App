import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { RoleGuard } from "@/components/role-guard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const discrepancyCodes = [
  { code: 'DOC_QUALITY', message: 'Document image quality is poor or unclear' },
  { code: 'DOC_MISMATCH', message: 'Document details do not match application data' },
  { code: 'MISSING_DOC', message: 'Required document is missing' },
  { code: 'INVALID_PAN', message: 'PAN format or details are invalid' },
  { code: 'ADDRESS_UNCLEAR', message: 'Business address is unclear or incomplete' },
  { code: 'CONTACT_INVALID', message: 'Contact information could not be verified' },
  { code: 'BUSINESS_VERIFICATION', message: 'Business details require additional verification' },
];

export function ApplicationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<string[]>([]);
  const [customDiscrepancy, setCustomDiscrepancy] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrInfo, setQRInfo] = useState<any>(null);

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => mockApi.getApplication(id!),
    enabled: !!id,
  });

  const { mutate: approveApplication, isPending: isApproving } = useMutation({
    mutationFn: () => mockApi.approveApplication(id!),
    onSuccess: (qrData) => {
      setQRInfo(qrData);
      setShowQRDialog(true);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast.success("Application approved successfully!");
    },
    onError: () => {
      toast.error("Failed to approve application");
    },
  });

  const { mutate: rejectApplication, isPending: isRejecting } = useMutation({
    mutationFn: (reason: string) => mockApi.rejectApplication(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast.success("Application rejected");
      setShowRejectDialog(false);
      navigate('/review');
    },
    onError: () => {
      toast.error("Failed to reject application");
    },
  });

  const { mutate: setDiscrepancy, isPending: isSettingDiscrepancy } = useMutation({
    mutationFn: (items: Array<{ code: string; message: string }>) => 
      mockApi.setDiscrepancy(id!, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast.success("Discrepancy items set successfully");
      setShowDiscrepancyDialog(false);
      navigate('/review');
    },
    onError: () => {
      toast.error("Failed to set discrepancy");
    },
  });

  const handleApprove = () => {
    approveApplication();
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectApplication(rejectionReason);
  };

  const handleDiscrepancy = () => {
    const items = [
      ...selectedDiscrepancies.map(code => ({
        code,
        message: discrepancyCodes.find(d => d.code === code)?.message || code
      })),
      ...(customDiscrepancy.trim() ? [{ code: 'CUSTOM', message: customDiscrepancy.trim() }] : [])
    ];

    if (items.length === 0) {
      toast.error("Please select at least one discrepancy item");
      return;
    }

    setDiscrepancy(items);
  };

  const toggleDiscrepancy = (code: string) => {
    setSelectedDiscrepancies(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['APPROVER']}>
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
      <RoleGuard allowedRoles={['APPROVER']}>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-red-500 mb-4">Application not found</p>
              <Button onClick={() => navigate('/review')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Queue
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['APPROVER']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/review')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold break-words">{application.businessName}</h1>
              <p className="text-muted-foreground">Application Review</p>
            </div>
          </div>
          <StatusChip status={application.status} />
        </div>

        {/* Action Buttons */}
        {application.status === 'SUBMITTED' && (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-12">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Application</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve this merchant application? 
                        This will generate QR codes and activate the merchant account.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApprove} disabled={isApproving}>
                        {isApproving ? "Approving..." : "Approve"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 h-12">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Application</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                        <Textarea
                          id="rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why this application is being rejected..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleReject} 
                        disabled={isRejecting || !rejectionReason.trim()}
                      >
                        {isRejecting ? "Rejecting..." : "Reject Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 h-12">
                      <AlertTriangle className="h-4 w-4" />
                      Set Discrepancy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Set Discrepancy Items</DialogTitle>
                      <DialogDescription>
                        Select issues that need to be addressed by the agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <Label>Common Issues</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {discrepancyCodes.map((item) => (
                            <div key={item.code} className="flex items-start space-x-2">
                              <input
                                type="checkbox"
                                id={item.code}
                                checked={selectedDiscrepancies.includes(item.code)}
                                onChange={() => toggleDiscrepancy(item.code)}
                                className="mt-1"
                              />
                              <label htmlFor={item.code} className="text-sm cursor-pointer">
                                <span className="font-medium">{item.code}:</span> {item.message}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-discrepancy">Custom Issue</Label>
                        <Textarea
                          id="custom-discrepancy"
                          value={customDiscrepancy}
                          onChange={(e) => setCustomDiscrepancy(e.target.value)}
                          placeholder="Describe any additional issues..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleDiscrepancy} 
                        disabled={isSettingDiscrepancy}
                      >
                        {isSettingDiscrepancy ? "Setting..." : "Set Discrepancy"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code Success Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Application Approved!
              </DialogTitle>
              <DialogDescription>
                QR codes have been generated for the merchant.
              </DialogDescription>
            </DialogHeader>
            {qrInfo && (
              <div className="space-y-4">
                <div className="text-center">
                  <img 
                    src={qrInfo.qrImageUrl} 
                    alt="QR Code" 
                    className="mx-auto w-48 h-48 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <Label>VPA Address</Label>
                    <Input value={qrInfo.vpa} readOnly />
                  </div>
                  <div>
                    <Label>QR Payload</Label>
                    <Textarea value={qrInfo.qrPayload} readOnly className="font-mono text-xs" />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowQRDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>
                  Review all documents submitted with this application
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
                  Timeline of all actions performed on this application
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