import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { RoleGuard } from "@/components/role-guard";
import { ApplicationForm } from "../components/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";


export function ApplicationEditPage() {
  // const { id } = useParams<{ id: string }>();

  // const { data: application } = useQuery({
  //   queryKey: ["application", id],
  //   queryFn: () => api.getApplication(id!), // id is now real backend ID
  //   enabled: !!id,
  // });


  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ You already have the id (from save draft or props)
  const applicationId = id;

  useEffect(() => {
    if (!applicationId) return; // don't call API if no ID yet

    const fetchApplication = async () => {
      try {
        setLoading(true);
        // /api/agents/applications/{applicationId}
        const res = await axios.get(
          `http://192.168.0.123:8086/api/agents/draft/${applicationId}`
        );
        setApplication(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);



  if (loading) {
    return (
      <RoleGuard allowedRoles={['AGENT']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading application...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error || !application) {
    return (
      <RoleGuard allowedRoles={['AGENT']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-red-500 mb-4">Application not found</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Convert application data to form format
  const initialData = {
    appl_name: application.businessName,
    firm: application.businessName,
    dba: application.tradeName || "",
    contact_person: application.contactName,
    mobile: application.phone,
    inst_addr1: application.address1,
    inst_addr2: application.address2 || "",
    inst_addr3: "",
    inst_locality: "",
    city: application.city,
    inst_pincode: application.pincode,
    mcc: "5999", // Default
    pan: application.pan,
    pan_dob: application.doiOrDob || "",
    me_ac_type: "savings", // Default
    me_name: application.contactName,
    me_ifsc: "",
    me_ac_no: "",
    qr_boombox: "QR", // Default
  };

  return (
    <RoleGuard allowedRoles={['AGENT']}>
      <ApplicationForm initialData={initialData} isEdit={true} />
    </RoleGuard>
  );
}