import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  MapPin,
  CreditCard,
  Banknote,
  FileText,
  Upload,
  X,
  Image,
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



// Form validation schema
const applicationSchema = z.object({
  // Stage 1: Business Information
  appl_name: z.string().min(1, "Application name is required"),
  firm: z.string().min(1, "Firm name is required"),
  dba: z.string().optional(),

  // Stage 2: Contact Information
  contact_person: z.string().min(1, "Contact person is required"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),

  // Stage 3: Installation Address
  inst_addr1: z.string().min(1, "Address line 1 is required"),
  inst_addr2: z.string().optional(),
  inst_addr3: z.string().optional(),
  inst_locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  inst_pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),

  // Stage 4: Business Details
  mcc: z.string().min(4, "MCC code is required"),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Invalid PAN format"),
  pan_dob: z.string().min(1, "PAN DOB is required"),

  // Stage 5: Bank Details
  me_ac_type: z.string().min(1, "Account type is required"),
  me_name: z.string().min(1, "Account holder name is required"),
  me_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  me_ac_no: z.string().min(8, "Account number must be at least 8 digits"),

  // Stage 6: Documents
  pan_document: z.any().optional(),
  aadhar_document: z.any().optional(),
  bank_statement: z.any().optional(),
  shop_photo: z.any().optional(),

  // Stage 7: Service Type
  qr_boombox: z.string().min(1, "Service type is required"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const stages = [
  {
    id: 1,
    title: "Business Info",
    icon: Building2,
    fields: ["appl_name", "firm", "dba"],
    description: "Basic business details"
  },
  {
    id: 2,
    title: "Contact",
    icon: User,
    fields: ["contact_person", "mobile"],
    description: "Contact information"
  },
  {
    id: 3,
    title: "Address",
    icon: MapPin,
    fields: ["inst_addr1", "inst_addr2", "inst_addr3", "inst_locality", "city", "inst_pincode"],
    description: "Installation address"
  },
  {
    id: 4,
    title: "Business Details",
    icon: CreditCard,
    fields: ["mcc", "pan", "pan_dob"],
    description: "PAN and MCC details"
  },
  {
    id: 5,
    title: "Bank Details",
    icon: Banknote,
    fields: ["me_ac_type", "me_name", "me_ifsc", "me_ac_no"],
    description: "Banking information"
  },
  {
    id: 6,
    title: "Documents",
    icon: FileText,
    fields: ["pan_document", "aadhar_document", "bank_statement", "shop_photo"],
    description: "Upload required documents"
  },
  {
    id: 7,
    title: "Service Type",
    icon: Check,
    fields: ["qr_boombox"],
    description: "Choose service type"
  }
];

const mccCodes = [
  { value: "5411", label: "5411 - Grocery Stores" },
  { value: "5812", label: "5812 - Eating Places/Restaurants" },
  { value: "5999", label: "5999 - Miscellaneous Retail" },
  { value: "7011", label: "7011 - Hotels/Motels" },
  { value: "5912", label: "5912 - Drug Stores/Pharmacies" },
  { value: "5541", label: "5541 - Service Stations" },
];

const accountTypes = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
];

const serviceTypes = [
  { value: "QR", label: "QR Code Only" },
  { value: "BOOMBOX", label: "Sound Box Device" },
  { value: "BOTH", label: "QR Code + Sound Box" },
];

interface ApplicationFormProps {
  initialData?: Partial<ApplicationFormData>;
  isEdit?: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export function ApplicationForm({ initialData, isEdit = false }: ApplicationFormProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();



  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      appl_name: "",
      firm: "",
      dba: "",
      contact_person: "",
      mobile: "",
      inst_addr1: "",
      inst_addr2: "",
      inst_addr3: "",
      inst_locality: "",
      city: "",
      inst_pincode: "",
      mcc: "",
      pan: "",
      pan_dob: "",
      me_ac_type: "",
      me_name: "",
      me_ifsc: "",
      me_ac_no: "",
      qr_boombox: "",
      pan_document: null,
      aadhar_document: null,
      bank_statement: null,
      shop_photo: null,
      ...initialData,
    },
  });

  const { mutate: saveApplication, isPending: isSaving } = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const applicationData = {
        businessName: data.firm,
        tradeName: data.dba,
        contactName: data.contact_person,
        phone: data.mobile,
        email: `${data.contact_person.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        address1: data.inst_addr1,
        address2: data.inst_addr2 || data.inst_addr3,
        city: data.city,
        state: "Maharashtra", // Default for now
        pincode: data.inst_pincode,
        pan: data.pan,
        gstin: "", // Optional
        doiOrDob: data.pan_dob,
        docs: [], // Will be handled separately
      };

      if (isEdit && id) {
        return mockApi.updateApplication(id, applicationData);
      } else {
        return mockApi.createApplication().then(app =>
          mockApi.updateApplication(app.id, applicationData)
        );
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success(isEdit ? "Application updated successfully!" : "Application created successfully!");
      navigate('/applications');
    },
    onError: (error) => {
      toast.error("Failed to save application. Please try again.");
      console.error(error);
    },
  });

  const { mutate: submitApplication, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      // First save the application
      const savedApp = await saveApplication(data);
      // Then submit it
      if (savedApp?.id) {
        return mockApi.submitApplication(savedApp.id);
      }
      throw new Error("Failed to save application");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success("Application submitted successfully!");
      navigate('/applications');
    },
    onError: (error) => {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    },
  });

  const currentStageData = stages.find(s => s.id === currentStage)!;
  const progress = (currentStage / stages.length) * 100;

  const validateCurrentStage = async () => {
    const fieldsToValidate = currentStageData.fields;
    const isValid = await form.trigger(fieldsToValidate as any);
    return isValid;
  };

  const nextStage = async () => {
    const isValid = await validateCurrentStage();
    if (isValid && currentStage < stages.length) {
      setCurrentStage(currentStage + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    saveApplication(data);
  };

  // const onSubmitForReview = (data: ApplicationFormData) => {
  //   submitApplication(data);
  // };

  const getFieldError = (fieldName: string) => {
    return form.formState.errors[fieldName as keyof ApplicationFormData]?.message;
  };

  const handleFileUpload = (fieldName: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    // Create a preview URL for the file
    const url = URL.createObjectURL(file);

    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: url
    };

    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: uploadedFile
    }));

    form.setValue(fieldName as keyof ApplicationFormData, file as any);
    toast.success("File uploaded successfully");
  };

  const removeFile = (fieldName: string) => {
    const file = uploadedFiles[fieldName];
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }

    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });

    form.setValue(fieldName as keyof ApplicationFormData, null as any);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isStageComplete = (stageId: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return false;

    // For document stage, at least one document should be uploaded
    if (stageId === 6) {
      return Object.keys(uploadedFiles).length > 0;
    }

    return stage.fields.every(field => {
      const value = form.getValues(field as keyof ApplicationFormData);
      return value && value.toString().trim() !== "";
    });
  };


  // Inside your component

  const [applicationId, setApplicationId] = useState<string | null>(null);

  const saveStepData = async (step: number, data: any) => {
    try {
      const response = await fetch("http://localhost:8080/api/save-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          step,
          data,
        }),
      });

      const result = await response.json();

      if (!applicationId && result.application_id) {
        setApplicationId(result.application_id); // store draft id
      }
    } catch (err) {
      console.error("Error saving step:", err);
    }
  };






  const onSubmitForReview = async (data: ApplicationFormData) => {
    try {
      const formData = new FormData();

      // Append all normal fields
      Object.entries(data).forEach(([key, value]) => {
        if (
          key !== "pan_document" &&
          key !== "aadhar_document" &&
          key !== "bank_statement" &&
          key !== "shop_photo"
        ) {
          formData.append(key, value as string);
        }
      });

      // Append files (if uploaded)
      if (uploadedFiles.pan_document) {
        formData.append("pan_document", uploadedFiles.pan_document);
      }
      if (uploadedFiles.aadhar_document) {
        formData.append("aadhar_document", uploadedFiles.aadhar_document);
      }
      if (uploadedFiles.bank_statement) {
        formData.append("bank_statement", uploadedFiles.bank_statement);
      }
      if (uploadedFiles.shop_photo) {
        formData.append("shop_photo", uploadedFiles.shop_photo);
      }

      // Submit to API
      const response = await axios.post(
        `http://192.168.0.144:8086/api/agents/applications/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(" Submitted successfully:", response.data);
      alert("Application submitted successfully!");

    } catch (error: any) {
      console.error(" Submission failed:", error);
      alert(error.response?.data?.message || "Submission failed");
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">

      <div className="w-full md:w-[51%] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Application" : "New Application"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {currentStage} of {stages.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-center scroll-bar">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isActive = stage.id === currentStage;
              const isCompleted = stage.id < currentStage || isStageComplete(stage.id);

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex flex-col items-center space-y-1 min-w-0 flex-shrink-0 p-1 level-icon",
                    isActive && "scale-110"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted && stage.id < currentStage ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium text-center",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {stage.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <currentStageData.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStageData.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentStageData.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Stage 1: Business Information */}
                  {currentStage === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="appl_name">Application Name *</Label>
                        <Input
                          id="appl_name"
                          {...form.register("appl_name")}
                          placeholder="Enter application name"
                          className="h-12"
                        />
                        {getFieldError("appl_name") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("appl_name")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="firm">Firm Name *</Label>
                        <Input
                          id="firm"
                          {...form.register("firm")}
                          placeholder="Enter firm name"
                          className="h-12"
                        />
                        {getFieldError("firm") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("firm")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dba">DBA (Doing Business As)</Label>
                        <Input
                          id="dba"
                          {...form.register("dba")}
                          placeholder="Enter DBA name (optional)"
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  {/* Stage 2: Contact Information */}
                  {currentStage === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person *</Label>
                        <Input
                          id="contact_person"
                          {...form.register("contact_person")}
                          placeholder="Enter contact person name"
                          className="h-12"
                        />
                        {getFieldError("contact_person") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("contact_person")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          {...form.register("mobile")}
                          placeholder="Enter 10-digit mobile number"
                          type="tel"
                          maxLength={10}
                          className="h-12"
                        />
                        {getFieldError("mobile") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("mobile")}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Stage 3: Installation Address */}
                  {currentStage === 3 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="inst_addr1">Address Line 1 *</Label>
                        <Input
                          id="inst_addr1"
                          {...form.register("inst_addr1")}
                          placeholder="Enter address line 1"
                          className="h-12"
                        />
                        {getFieldError("inst_addr1") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("inst_addr1")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inst_addr2">Address Line 2</Label>
                        <Input
                          id="inst_addr2"
                          {...form.register("inst_addr2")}
                          placeholder="Enter address line 2 (optional)"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inst_addr3">Address Line 3</Label>
                        <Input
                          id="inst_addr3"
                          {...form.register("inst_addr3")}
                          placeholder="Enter address line 3 (optional)"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inst_locality">Locality *</Label>
                        <Input
                          id="inst_locality"
                          {...form.register("inst_locality")}
                          placeholder="Enter locality"
                          className="h-12"
                        />
                        {getFieldError("inst_locality") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("inst_locality")}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            {...form.register("city")}
                            placeholder="Enter city"
                            className="h-12"
                          />
                          {getFieldError("city") && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {getFieldError("city")}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="inst_pincode">Pincode *</Label>
                          <Input
                            id="inst_pincode"
                            {...form.register("inst_pincode")}
                            placeholder="6-digit pincode"
                            maxLength={6}
                            className="h-12"
                          />
                          {getFieldError("inst_pincode") && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {getFieldError("inst_pincode")}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Stage 4: Business Details */}
                  {currentStage === 4 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="mcc">MCC Code *</Label>
                        <Select
                          value={form.watch("mcc")}
                          onValueChange={(value) => form.setValue("mcc", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select MCC code" />
                          </SelectTrigger>
                          <SelectContent>
                            {mccCodes.map((mcc) => (
                              <SelectItem key={mcc.value} value={mcc.value}>
                                {mcc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getFieldError("mcc") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("mcc")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number *</Label>
                        <Input
                          id="pan"
                          {...form.register("pan")}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className="h-12 uppercase"
                          onChange={(e) => {
                            e.target.value = e.target.value.toUpperCase();
                            form.setValue("pan", e.target.value);
                          }}
                        />
                        {getFieldError("pan") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("pan")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pan_dob">PAN DOB *</Label>
                        <Input
                          id="pan_dob"
                          {...form.register("pan_dob")}
                          type="date"
                          className="h-12"
                        />
                        {getFieldError("pan_dob") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("pan_dob")}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Stage 5: Bank Details */}
                  {currentStage === 5 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="me_ac_type">Account Type *</Label>
                        <Select
                          value={form.watch("me_ac_type")}
                          onValueChange={(value) => form.setValue("me_ac_type", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getFieldError("me_ac_type") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("me_ac_type")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="me_name">Account Holder Name *</Label>
                        <Input
                          id="me_name"
                          {...form.register("me_name")}
                          placeholder="Enter account holder name"
                          className="h-12"
                        />
                        {getFieldError("me_name") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("me_name")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="me_ifsc">IFSC Code *</Label>
                        <Input
                          id="me_ifsc"
                          {...form.register("me_ifsc")}
                          placeholder="ABCD0123456"
                          maxLength={11}
                          className="h-12 uppercase"
                          onChange={(e) => {
                            e.target.value = e.target.value.toUpperCase();
                            form.setValue("me_ifsc", e.target.value);
                          }}
                        />
                        {getFieldError("me_ifsc") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("me_ifsc")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="me_ac_no">Account Number *</Label>
                        <Input
                          id="me_ac_no"
                          {...form.register("me_ac_no")}
                          placeholder="Enter account number"
                          className="h-12"
                        />
                        {getFieldError("me_ac_no") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("me_ac_no")}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Stage 6: Service Type */}
                  {currentStage === 6 && (
                    <>
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Upload Required Documents</h3>
                          <p className="text-sm text-muted-foreground">
                            Upload clear photos or scanned copies (JPG, PNG, PDF - Max 5MB each)
                          </p>
                        </div>

                        {/* PAN Document */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">PAN Card *</Label>
                          {!uploadedFiles.pan_document ? (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                              <input
                                type="file"
                                id="pan_document"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload('pan_document', file);
                                }}
                                className="hidden"
                              />
                              <label htmlFor="pan_document" className="cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Upload PAN Card</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG or PDF</p>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {uploadedFiles.pan_document.name}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {formatFileSize(uploadedFiles.pan_document.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('pan_document')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Aadhaar Document */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Aadhaar Card *</Label>
                          {!uploadedFiles.aadhar_document ? (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                              <input
                                type="file"
                                id="aadhar_document"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload('aadhar_document', file);
                                }}
                                className="hidden"
                              />
                              <label htmlFor="aadhar_document" className="cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Upload Aadhaar Card</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG or PDF</p>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {uploadedFiles.aadhar_document.name}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {formatFileSize(uploadedFiles.aadhar_document.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('aadhar_document')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Bank Statement */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Bank Statement</Label>
                          <p className="text-xs text-muted-foreground">Recent bank statement (optional)</p>
                          {!uploadedFiles.bank_statement ? (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                              <input
                                type="file"
                                id="bank_statement"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload('bank_statement', file);
                                }}
                                className="hidden"
                              />
                              <label htmlFor="bank_statement" className="cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Upload Bank Statement</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG or PDF</p>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {uploadedFiles.bank_statement.name}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {formatFileSize(uploadedFiles.bank_statement.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('bank_statement')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Shop Photo */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Shop/Establishment Photo *</Label>
                          <p className="text-xs text-muted-foreground">Clear photo of your shop or business establishment</p>
                          {!uploadedFiles.shop_photo ? (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                              <input
                                type="file"
                                id="shop_photo"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload('shop_photo', file);
                                }}
                                className="hidden"
                              />
                              <label htmlFor="shop_photo" className="cursor-pointer">
                                <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Upload Shop Photo</p>
                                <p className="text-xs text-muted-foreground">JPG or PNG only</p>
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Image className="h-5 w-5 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                      {uploadedFiles.shop_photo.name}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      {formatFileSize(uploadedFiles.shop_photo.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile('shop_photo')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {uploadedFiles.shop_photo.url && uploadedFiles.shop_photo.type.startsWith('image/') && (
                                <div className="rounded-lg overflow-hidden border">
                                  <img
                                    src={uploadedFiles.shop_photo.url}
                                    alt="Shop preview"
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Stage 7: Service Type */}
                  {currentStage === 7 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="qr_boombox">Service Type *</Label>
                        <Select
                          value={form.watch("qr_boombox")}
                          onValueChange={(value) => form.setValue("qr_boombox", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getFieldError("qr_boombox") && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError("qr_boombox")}
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold mb-3">Application Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Firm:</span>
                            <span className="font-medium">{form.watch("firm")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="font-medium">{form.watch("contact_person")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mobile:</span>
                            <span className="font-medium">{form.watch("mobile")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">City:</span>
                            <span className="font-medium">{form.watch("city")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">
                              {serviceTypes.find(t => t.value === form.watch("qr_boombox"))?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStage > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStage}
                    className="flex-1 h-12"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}

                {currentStage < stages.length ? (
                  <Button
                    type="button"
                    onClick={nextStage}
                    className="flex-1 h-12"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isSaving}
                      className="flex-1 h-12"
                    >
                      {isSaving ? "Saving..." : "Save Draft"}
                    </Button>


                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmitForReview)}
                      disabled={isSubmitting}
                      className="flex-1 h-12"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>



                    {/* <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmitForReview)}
                      disabled={isSubmitting}
                      className="flex-1 h-12"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button> */}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}