import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://cordibase.onrender.com/api/auth/:path*', // Core Service handles Auth
      },
      {
        source: '/api/core/:path*',
        destination: 'https://cordibase.onrender.com/api/core/:path*', // Core Service
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

