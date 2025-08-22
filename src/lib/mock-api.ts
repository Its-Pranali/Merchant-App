import { MerchantApplication, QRInfo, MetricsOverview, ApplicationStatus } from './types';

// Mock data
const mockApplications: MerchantApplication[] = [
  {
    id: '1',
    status: 'DRAFT',
    businessName: 'Fresh Grocers Ltd',
    tradeName: 'Fresh Mart',
    contactName: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh@freshmart.com',
    address1: '123 Market Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    pan: 'ABCDE1234F',
    gstin: '27ABCDE1234F1Z5',
    docs: [
      { id: 'd1', type: 'PAN', name: 'pan_card.pdf', size: 256000 },
      { id: 'd2', type: 'KYC', name: 'aadhaar.pdf', size: 512000 },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    agentName: 'Priya Sharma'
  },
  {
    id: '2',
    status: 'SUBMITTED',
    businessName: 'Tech Solutions Inc',
    contactName: 'Amit Patel',
    phone: '9123456789',
    email: 'amit@techsol.com',
    address1: '456 Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    pan: 'XYZAB5678C',
    docs: [
      { id: 'd3', type: 'PAN', name: 'pan_copy.jpg', size: 128000 },
      { id: 'd4', type: 'KYC', name: 'voter_id.pdf', size: 300000 },
      { id: 'd5', type: 'SHOP_PHOTO', name: 'shop_front.jpg', size: 800000 },
    ],
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-16T11:45:00Z',
    agentName: 'Rohit Verma'
  },
  {
    id: '3',
    status: 'DISCREPANCY',
    businessName: 'Fashion Hub',
    contactName: 'Sneha Gupta',
    phone: '9876123456',
    email: 'sneha@fashionhub.com',
    address1: '789 Style Avenue',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    pan: 'PQRST9876E',
    docs: [
      { id: 'd6', type: 'PAN', name: 'pan_card.pdf', size: 200000 },
      { id: 'd7', type: 'SHOP_PHOTO', name: 'store_pic.jpg', size: 600000 },
    ],
    discrepancyItems: [
      { code: 'DOC_QUALITY', message: 'PAN card image is not clear' },
      { code: 'MISSING_DOC', message: 'KYC document required' }
    ],
    createdAt: '2024-01-13T16:20:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
    agentName: 'Neha Singh'
  },
  {
    id: '4',
    status: 'APPROVED',
    businessName: 'Coffee Corner',
    contactName: 'Ravi Mehta',
    phone: '9543216789',
    email: 'ravi@coffeecorner.com',
    address1: '321 Cafe Street',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    pan: 'LMNOP4567Q',
    docs: [
      { id: 'd8', type: 'PAN', name: 'pan_certificate.pdf', size: 180000 },
      { id: 'd9', type: 'KYC', name: 'passport.pdf', size: 420000 },
      { id: 'd10', type: 'SHOP_PHOTO', name: 'cafe_exterior.jpg', size: 950000 },
    ],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T15:10:00Z',
    agentName: 'Vikash Kumar'
  },
  {
    id: '5',
    status: 'REJECTED',
    businessName: 'Mobile Repairs',
    contactName: 'Suresh Yadav',
    phone: '9098765432',
    email: 'suresh@mobilerepairs.com',
    address1: '654 Repair Lane',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    pan: 'DEFGH7890K',
    docs: [
      { id: 'd11', type: 'PAN', name: 'pan_scan.jpg', size: 160000 },
    ],
    rejectionReason: 'Incomplete documentation and business verification failed',
    createdAt: '2024-01-11T14:30:00Z',
    updatedAt: '2024-01-19T10:20:00Z',
    agentName: 'Anjali Joshi'
  }
];

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async listApplications({ role, mine, status, q }: { 
    role?: string; 
    mine?: boolean; 
    status?: ApplicationStatus[]; 
    q?: string; 
  } = {}) {
    await delay();
    let filtered = [...mockApplications];
    
    if (status?.length) {
      filtered = filtered.filter(app => status.includes(app.status));
    }
    
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(app => 
        app.businessName.toLowerCase().includes(query) ||
        app.contactName.toLowerCase().includes(query) ||
        app.phone.includes(query) ||
        app.pan.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  },

  async getApplication(id: string) {
    await delay();
    const app = mockApplications.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    return app;
  },

  async createApplication(): Promise<MerchantApplication> {
    await delay();
    const newApp: MerchantApplication = {
      id: `app_${Date.now()}`,
      status: 'DRAFT',
      businessName: '',
      contactName: '',
      phone: '',
      email: '',
      address1: '',
      city: '',
      state: '',
      pincode: '',
      pan: '',
      docs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.push(newApp);
    return newApp;
  },

  async updateApplication(id: string, updates: Partial<MerchantApplication>) {
    await delay();
    const index = mockApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockApplications[index] = {
      ...mockApplications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockApplications[index];
  },

  async submitApplication(id: string) {
    await delay();
    return this.updateApplication(id, { status: 'SUBMITTED' });
  },

  async approveApplication(id: string): Promise<QRInfo> {
    await delay();
    await this.updateApplication(id, { status: 'APPROVED' });
    
    return {
      vpa: `merchant${id}@upi`,
      qrPayload: `upi://pay?pa=merchant${id}@upi&pn=Merchant&cu=INR`,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant${id}@upi&pn=Merchant&cu=INR`
    };
  },

  async rejectApplication(id: string, reason: string) {
    await delay();
    return this.updateApplication(id, { 
      status: 'REJECTED', 
      rejectionReason: reason 
    });
  },

  async setDiscrepancy(id: string, items: Array<{ code: string; message: string }>) {
    await delay();
    return this.updateApplication(id, { 
      status: 'DISCREPANCY', 
      discrepancyItems: items 
    });
  },

  async getQR(id: string): Promise<QRInfo> {
    await delay();
    return {
      vpa: `merchant${id}@upi`,
      qrPayload: `upi://pay?pa=merchant${id}@upi&pn=Merchant&cu=INR`,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant${id}@upi&pn=Merchant&cu=INR`
    };
  },

  async getMetricsOverview(): Promise<MetricsOverview> {
    await delay();
    const counts = mockApplications.reduce((acc, app) => {
      acc[app.status.toLowerCase()]++;
      acc.total++;
      return acc;
    }, { total: 0, draft: 0, submitted: 0, discrepancy: 0, approved: 0, rejected: 0 } as any);

    // Generate mock daily stats for last 7 days
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        submissions: Math.floor(Math.random() * 20) + 5,
        approvals: Math.floor(Math.random() * 15) + 3,
      };
    });

    const agentLeaderboard = [
      { agentName: 'Priya Sharma', submitted: 45, approved: 38, discrepancyRate: 12 },
      { agentName: 'Rohit Verma', submitted: 42, approved: 35, discrepancyRate: 15 },
      { agentName: 'Neha Singh', submitted: 38, approved: 30, discrepancyRate: 18 },
      { agentName: 'Vikash Kumar', submitted: 35, approved: 32, discrepancyRate: 8 },
      { agentName: 'Anjali Joshi', submitted: 28, approved: 22, discrepancyRate: 20 },
    ];

    return {
      ...counts,
      dailyStats,
      agentLeaderboard,
    };
  }
};