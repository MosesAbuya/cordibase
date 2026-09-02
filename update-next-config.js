
const fs = require("fs");
let content = fs.readFileSync("apps/web/next.config.ts", "utf8");

if (!content.includes("/api/settings/:path*")) {
    const newRewrites = `
      {
        source: "/api/settings/:path*",
        destination: "http://localhost:3001/api/settings/:path*", // Core Service
      },
      {
        source: "/api/public/:path*",
        destination: "http://localhost:3002/api/public/:path*", // CRM Service public endpoints
      },
    `;
    content = content.replace("async rewrites() {\\n    return [", `async rewrites() {\n    return [${newRewrites}`);
    fs.writeFileSync("apps/web/next.config.ts", content);
    console.log("Updated next.config.ts");
}

