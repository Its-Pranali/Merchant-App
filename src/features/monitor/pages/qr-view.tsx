import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/role-guard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function MonitorQRViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => mockApi.getApplication(id!),
    enabled: !!id,
  });

  const { data: qrInfo, isLoading: qrLoading } = useQuery({
    queryKey: ['qr', id],
    queryFn: () => mockApi.getQR(id!),
    enabled: !!id && application?.status === 'APPROVED',
  });

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadQR = () => {
    if (qrInfo?.qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrInfo.qrImageUrl;
      link.download = `qr_code_${application?.businessName?.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded");
    }
  };

  if (appLoading || qrLoading) {
    return (
      <RoleGuard allowedRoles={['MONITOR']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
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

  if (application.status !== 'APPROVED') {
    return (
      <RoleGuard allowedRoles={['MONITOR']}>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">QR Code Not Available</h3>
              <p className="text-muted-foreground text-center mb-6">
                QR codes are only available for approved applications.
              </p>
              <Button onClick={() => navigate(`/monitor/applications/${id}/view`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Application
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
            <Button variant="ghost" size="sm" onClick={() => navigate(`/monitor/applications/${id}/view`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold break-words">{application.businessName}</h1>
              <p className="text-muted-foreground">QR Code & Payment Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              Approved
            </div>
          </div>
        </div>

        {qrInfo ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* QR Code Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
                <CardDescription>
                  Scan this QR code to make payments to this merchant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img 
                      src={qrInfo.qrImageUrl} 
                      alt="QR Code" 
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleDownloadQR} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  UPI payment information for this merchant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>VPA Address</Label>
                  <div className="flex gap-2">
                    <Input value={qrInfo.vpa} readOnly className="font-mono" />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(qrInfo.vpa, 'VPA')}
                    >
                      {copied === 'VPA' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Payload</Label>
                  <div className="flex gap-2">
                    <Textarea 
                      value={qrInfo.qrPayload} 
                      readOnly 
                      className="font-mono text-xs resize-none"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(qrInfo.qrPayload, 'Payload')}
                    >
                      {copied === 'Payload' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    How to use this QR Code:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Customers can scan this QR code with any UPI app</li>
                    <li>• Payments will be received directly to the merchant's account</li>
                    <li>• The QR code can be printed and displayed at the merchant location</li>
                    <li>• No additional setup required - ready to accept payments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading QR code information...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}