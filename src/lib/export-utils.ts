import { MerchantApplication, MetricsOverview } from './types';
import { format } from 'date-fns';

export const exportApplicationsToCSV = (applications: MerchantApplication[], filename?: string) => {
  const headers = [
    'Application ID',
    'Status',
    'Business Name',
    'Trade Name',
    'Contact Person',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'Pincode',
    'PAN',
    'GSTIN',
    'Agent Name',
    'Created Date',
    'Updated Date',
    'Rejection Reason',
    'Discrepancy Items'
  ];

  const csvData = applications.map(app => [
    app.id,
    app.status,
    app.businessName,
    app.tradeName || '',
    app.contactName,
    app.phone,
    app.email,
    app.address1 + (app.address2 ? ` ${app.address2}` : ''),
    app.city,
    app.state,
    app.pincode,
    app.pan,
    app.gstin || '',
    app.agentName || '',
    format(new Date(app.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    format(new Date(app.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
    app.rejectionReason || '',
    app.discrepancyItems?.map(item => `${item.code}: ${item.message}`).join('; ') || ''
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `applications_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMetricsToCSV = (metrics: MetricsOverview, filename?: string) => {
  // Summary data
  const summaryHeaders = ['Metric', 'Count'];
  const summaryData = [
    ['Total Applications', metrics.total],
    ['Draft', metrics.draft],
    ['Submitted', metrics.submitted],
    ['Discrepancy', metrics.discrepancy],
    ['Approved', metrics.approved],
    ['Rejected', metrics.rejected]
  ];

  // Daily stats
  const dailyHeaders = ['Date', 'Submissions', 'Approvals'];
  const dailyData = metrics.dailyStats.map(stat => [
    stat.date,
    stat.submissions,
    stat.approvals
  ]);

  // Agent leaderboard
  const agentHeaders = ['Agent Name', 'Submitted', 'Approved', 'Discrepancy Rate (%)'];
  const agentData = metrics.agentLeaderboard.map(agent => [
    agent.agentName,
    agent.submitted,
    agent.approved,
    agent.discrepancyRate
  ]);

  const csvContent = [
    '# Application Summary',
    ...([summaryHeaders, ...summaryData].map(row => row.join(','))),
    '',
    '# Daily Statistics',
    ...([dailyHeaders, ...dailyData].map(row => row.join(','))),
    '',
    '# Agent Performance',
    ...([agentHeaders, ...agentData].map(row => row.join(',')))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `metrics_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};