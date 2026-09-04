import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const coreUrl = process.env.CORE_SERVICE_URL || 'http://127.0.0.1:3001';
    const crmUrl = process.env.CRM_SERVICE_URL || 'http://127.0.0.1:3001';
    const accountingUrl = process.env.ACCOUNTING_SERVICE_URL || 'http://127.0.0.1:3001';
    const hrmUrl = process.env.HRM_SERVICE_URL || 'http://127.0.0.1:3001';

    return [
      {
        source: '/api/auth/:path*',
        destination: `${coreUrl}/api/auth/:path*`, // Core Service handles Auth
      },
      {
        source: '/api/core/:path*',
        destination: `${coreUrl}/api/core/:path*`, // Core Service
      },
      {
        source: '/api/crm/:path*',
        destination: `${crmUrl}/api/crm/:path*`, // CRM Service
      },
      {
        source: '/api/accounting/:path*',
        destination: `${accountingUrl}/api/accounting/:path*`, // Accounting Service
      },
      {
        source: '/api/hrm/:path*',
        destination: `${hrmUrl}/api/hrm/:path*`, // HRM Service
      },
    ];
  },
};


export default nextConfig;
