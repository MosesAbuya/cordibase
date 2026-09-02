import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://127.0.0.1:3001/api/auth/:path*', // Core Service handles Auth
      },
      {
        source: '/api/core/:path*',
        destination: 'http://127.0.0.1:3001/api/core/:path*', // Core Service
      },
      {
        source: '/api/crm/:path*',
        destination: 'http://127.0.0.1:3002/api/crm/:path*', // CRM Service
      },
      {
        source: '/api/accounting/:path*',
        destination: 'http://127.0.0.1:3003/api/accounting/:path*', // Accounting Service
      },
      {
        source: '/api/hrm/:path*',
        destination: 'http://127.0.0.1:3004/api/hrm/:path*', // HRM Service
      },
    ];
  },
};

export default nextConfig;

