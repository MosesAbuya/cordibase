import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isVercel = process.env.VERCEL === "1";
    
    const coreUrl = isVercel ? "https://cordibase-1.onrender.com" : (process.env.CORE_SERVICE_URL || "http://127.0.0.1:3001");
    const crmUrl = isVercel ? "https://cordibase-1.onrender.com" : (process.env.CRM_SERVICE_URL || "http://127.0.0.1:3002");
    const accountingUrl = isVercel ? "https://cordibase-1.onrender.com" : (process.env.ACCOUNTING_SERVICE_URL || "http://127.0.0.1:3003");
    const hrmUrl = isVercel ? "https://cordibase-1.onrender.com" : (process.env.HRM_SERVICE_URL || "http://127.0.0.1:3004");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${coreUrl}/api/auth/:path*`,
      },
      {
        source: "/api/core/:path*",
        destination: `${coreUrl}/api/core/:path*`,
      },
      {
        source: "/api/crm/:path*",
        destination: `${crmUrl}/api/crm/:path*`,
      },
      {
        source: "/api/accounting/:path*",
        destination: `${accountingUrl}/api/accounting/:path*`,
      },
      {
        source: "/api/hrm/:path*",
        destination: `${hrmUrl}/api/hrm/:path*`,
      },
    ];
  },
};

export default nextConfig;

