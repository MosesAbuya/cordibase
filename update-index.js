const fs = require('fs');
let content = fs.readFileSync('packages/shared-db/src/index.ts', 'utf8');

if (!content.includes('settingsSchema')) {
    content = content.replace('...reportsSchema } });', '...reportsSchema, ...settingsSchema } });');
    content = content.replace("import * as reportsSchema from './schema/reports';", "import * as reportsSchema from './schema/reports';\nimport * as settingsSchema from './schema/settings';");
    content = content.replace('...reportsSchema,\n};', '...reportsSchema,\n  ...settingsSchema,\n};');
    content = content.replace('export { authSchema, crmSchema, accountingSchema, hrmSchema, reportsSchema };', 'export { authSchema, crmSchema, accountingSchema, hrmSchema, reportsSchema, settingsSchema };');
    fs.writeFileSync('packages/shared-db/src/index.ts', content);
    console.log('Updated index.ts');
}
