const fs = require('fs');
let content = fs.readFileSync('apps/web/next.config.ts', 'utf8');

// I need to add `{ source: '/api/public/:path*', destination: 'http://localhost:3002/api/public/:path*' }` to the rewrites array
if (!content.includes('/api/public/:path*')) {
    content = content.replace(
        /\{[\s]*source: '\/api\/crm\/:path\*',[\s]*destination: 'http:\/\/localhost:3002\/api\/crm\/:path\*'[\s]*\}/,
        `{ source: '/api/crm/:path*', destination: 'http://localhost:3002/api/crm/:path*' },\n      { source: '/api/public/:path*', destination: 'http://localhost:3002/api/public/:path*' }`
    );
    fs.writeFileSync('apps/web/next.config.ts', content);
    console.log('Next config updated');
} else {
    console.log('Already updated');
}
