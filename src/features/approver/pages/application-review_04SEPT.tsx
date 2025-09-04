import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/status-chip";
import { RoleGuard } from "@/components/role-guard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  MapPin,
  Clock,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { format } from "date-fns";


const discrepancyCodes = [
  { code: "DOC_QUALITY", message: "Document image quality is poor or unclear" },
  { code: "DOC_MISMATCH", message: "Document details do not match application data" },
  { code: "MISSING_DOC", message: "Required document is missing" },
  { code: "INVALID_PAN", message: "PAN format or details are invalid" },
  { code: "ADDRESS_UNCLEAR", message: "Business address is unclear or incomplete" },
  { code: "CONTACT_INVALID", message: "Contact information could not be verified" },
  { code: "BUSINESS_VERIFICATION", message: "Business details require additional verification" },
];

const DocumentNameList: Record<string, string> = {
  bankstatement: "Bank",
  shopphoto: "Shop",
  aadhaar: "Aadhaar",
  pan: "PAN"
};
export function ApplicationReviewPage() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<string[]>([]);
  const [customDiscrepancy, setCustomDiscrepancy] = useState("");

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);

  // 🔥 NEW STATES
  const [activeTab, setActiveTab] = useState("details"); // track active tab
  const [documents, setDocuments] = useState<any[]>([]); // store docs separately
  const [docLoading, setDocLoading] = useState(false); // loading for docs

  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://192.168.0.143:8086/api/approver/applications/reviewApplication/${id}`
        );
        setApplication(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // 🔥 Fetch documents only when "Documents" tab is clicked
  useEffect(() => {
    if (activeTab === "documents" && id) {
      const fetchDocs = async () => {
        try {
          setDocLoading(true);
          const res = await axios.get(
            `http://192.168.0.143:8086/api/v1/files/applications/${id}/documentsList/urls`
          );
          setDocuments(res.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setDocLoading(false);
        }
      };

      fetchDocs();
    }
  }, [activeTab, id]);


  const sortedDocuments = Object.keys(documents)
    .sort() // Alphabetically sort keys
    .reduce((obj: Record<string, string>, key: string) => {
      obj[key] = documents[key];
      return obj;
    }, {});

  //  const handleApprove = (status:any,appId:any) => {

  //   console.log(`/api/approver/applications/${appId}/action?status=${status}`); 

  //   setShowApproveDialog(false);
  // }

  const handleApprove = async (status: any, appId: any) => {
    try {
      const url = `http://192.168.0.143:8086/api/approver/applications/${appId}/approve`;
      // Call API (POST, but change to PUT/GET if needed)
      const response = await axios.post(url);

      console.log("Response:", response.data);
      toast.success(`Application ${status} successfully!`);
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Something went wrong!");
    } finally {
      setShowApproveDialog(false);
    }
  };
  // const handleReject = () => {
  //   if (!rejectionReason.trim()) {
  //     toast.error("Please provide a rejection reason");
  //     return;
  //   }
  //   toast.error("Application rejected");
  //   setShowRejectDialog(false);
  // };

  // Add this near other states
  const [reason, setReason] = useState(""); // Optional: keep if you want separate field
  const [comment, setComment] = useState(""); // This will be the textarea input
  const [loadingReject, setLoadingReject] = useState(false);

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("Please provide a rejection comment");
      return;
    }

    setLoadingReject(true);
    try {
      const payload = {
        reason: reason || "Rejected by approver", // Default if reason is blank
        comment: comment,
        status: "rejected",
      };

      const response = await axios.post(
        `http://192.168.0.143:8086/api/approver/applications/${id}/reject`,
        payload
      );

      console.log(response.data);
      toast.error("Application rejected successfully!");
      setShowRejectDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject application.");
    } finally {
      setLoadingReject(false);
    }
  };

  const handleDiscrepancy = () => {
    if (!selectedDiscrepancies.length && !customDiscrepancy.trim()) {
      toast.error("Please select at least one discrepancy");
      return;
    }
    toast.success("Discrepancy set successfully!");
    setShowDiscrepancyDialog(false);
  };

  const toggleDiscrepancy = (code: string) => {
    setSelectedDiscrepancies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!application) {
    return (
      <RoleGuard allowedRoles={["APPROVER"]}>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-red-500 mb-4">Application not found</p>
              <Button onClick={() => navigate("/review")}>
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
    <RoleGuard allowedRoles={["APPROVER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/review")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold break-words">
                {application.businessName}
              </h1>
              <p className="text-muted-foreground">Application Review</p>
            </div>
          </div>
          <StatusChip status={application.status} />
        </div>

        {/* Actions */}
        {application.status === "SUBMITTED" && (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Approve */}
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
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancel
                      </Button>
                      {/* <Button onClick={handleApprove('Approve')}>Approve</Button> */}
                      <Button onClick={() => handleApprove("approved", id)}>Approve</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Reject */}
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
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label>Rejection Reason *</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this application is being rejected..."
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        Reject
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Discrepancy */}
                <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 h-12">
                      <AlertTriangle className="h-4 w-4" />
                      Set Discrepancy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Set Discrepancy</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {discrepancyCodes.map((item) => (
                        <div key={item.code} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDiscrepancies.includes(item.code)}
                            onChange={() => toggleDiscrepancy(item.code)}
                          />
                          <label className="text-sm cursor-pointer">
                            <span className="font-medium">{item.code}:</span> {item.message}
                          </label>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label>Custom Issue</Label>
                        <Textarea
                          value={customDiscrepancy}
                          onChange={(e) => setCustomDiscrepancy(e.target.value)}
                          placeholder="Describe any additional issues..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleDiscrepancy}>Set Discrepancy</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs
          defaultValue="details"
          value={activeTab} // 🔥 NEW
          onValueChange={setActiveTab} // 🔥 NEW
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Details */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p><strong>Business Name:</strong> {application.firm}</p>
                <p><strong>PAN:</strong> {application.pan}</p>
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
                    <p className="font-medium break-words">{application.applName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{application.mobile}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium break-all">
                      domain@example.com
                    </p>
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
                  <p className="font-medium break-words">{application.instAddr1}</p>
                  {application.instAddr2 && <p>{application.instAddr2}</p>}
                  {application.instAddr3 && <p>{application.instAddr3}</p>}
                  <p className="break-words">
                    {application?.city && application.city.trim() !== ""
                      ? application.city + ","
                      : " "}
                    {application?.state && application.state.trim() !== ""
                      ? application.state + ","
                      : " "}
                    {application?.instPincode && application.instPincode.trim() !== ""
                      ? application.instPincode
                      : "Pincode not found"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <FileText className="h-5 w-5" /> Uploaded Documents
                </CardTitle>
                <CardDescription>Review all uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>

                {docLoading ? (

                  <p>Loading documents...</p>
                ) : Object.values(sortedDocuments).length ? (
                  Object.keys(sortedDocuments).map((key: string, index: number) => (
                    <div
                      key={index}
                      className="border p-3 rounded-lg flex justify-between"
                    >
                      {/* <span>{key}</span> */}
                      <span>{DocumentNameList[key] || key}</span>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          <a
                            href={sortedDocuments[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        </Button>

                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          <a
                            href={sortedDocuments[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No documents found</p>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Clock className="h-5 w-5" /> Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Created: {application.createdAt ? format(new Date(application.createdAt), "PPp") : "N/A"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
