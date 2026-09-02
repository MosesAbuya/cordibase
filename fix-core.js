const fs = require('fs');

// 1. Fix auth.ts
let authContent = fs.readFileSync('apps/service-core/src/auth.ts', 'utf8');
authContent = authContent.replace('data.organizationId', 'data.organization.id');
fs.writeFileSync('apps/service-core/src/auth.ts', authContent);

// 2. Fix index.ts
let indexContent = fs.readFileSync('apps/service-core/src/index.ts', 'utf8');
// Replace import to include schema
indexContent = indexContent.replace("import { db, authSchema } from '@cordibase/shared-db';", "import { db, authSchema, schema } from '@cordibase/shared-db';");
// Also fix authSchema.user -> no wait, authSchema is imported.

fs.writeFileSync('apps/service-core/src/index.ts', indexContent);
console.log('Fixed auth.ts and index.ts');
