export type ApplicationStatus = "DRAFT" | "SUBMITTED" | "DISCREPANCY" | "APPROVED" | "REJECTED";

export type DocumentType = "PAN" | "KYC" | "SHOP_PHOTO" | "GST_CERT" | "SIGNATURE" | "OTHER";

export type UserRole = "AGENT" | "APPROVER" | "MONITOR";

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  size: number;
  url?: string;
}

export interface DiscrepancyItem {
  code: string;
  message: string;
  resolved?: boolean;
}

export interface MerchantApplication {
  id: string;
  status: ApplicationStatus;
  businessName: string;
  tradeName?: string;
  contactName: string;
  phone: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  gstin?: string;
  doiOrDob?: string;
  docs: Document[];
  rejectionReason?: string;
  discrepancyItems?: DiscrepancyItem[];
  createdAt: string;
  updatedAt: string;
  agentName?: string;
}

export interface QRInfo {
  vpa: string;
  qrPayload: string;
  qrImageUrl: string;
}

export interface MetricsOverview {
  total: number;
  draft: number;
  submitted: number;
  discrepancy: number;
  approved: number;
  rejected: number;
  dailyStats: Array<{
    date: string;
    submissions: number;
    approvals: number;
  }>;
  agentLeaderboard: Array<{
    agentName: string;
    submitted: number;
    approved: number;
    discrepancyRate: number;
  }>;
}