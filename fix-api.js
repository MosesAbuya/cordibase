const fs = require('fs');

const files = [
  'apps/web/src/app/api/emailing/send/route.ts',
  'apps/web/src/app/api/emailing/accounts/route.ts',
  'apps/web/src/app/api/emailing/logs/route.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace('import { db } from "@cordibase/shared-db";', 'import { db } from "@/lib/db";');
    content = content.replace('import { emailAccount, emailLog } from "@cordibase/shared-db/schema/emailing";', 'import { emailingSchema } from "@cordibase/shared-db";\nconst { emailAccount, emailLog } = emailingSchema;');
    content = content.replace('import { emailAccount } from "@cordibase/shared-db/schema/emailing";', 'import { emailingSchema } from "@cordibase/shared-db";\nconst { emailAccount } = emailingSchema;');
    content = content.replace('import { emailLog } from "@cordibase/shared-db/schema/emailing";', 'import { emailingSchema } from "@cordibase/shared-db";\nconst { emailLog } = emailingSchema;');
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed API imports');
