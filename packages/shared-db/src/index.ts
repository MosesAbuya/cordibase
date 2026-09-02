import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as authSchema from './schema/auth';
import * as crmSchema from './schema/crm';
import * as accountingSchema from './schema/accounting';
import * as hrmSchema from './schema/hrm';
import * as reportsSchema from './schema/reports';
import * as settingsSchema from './schema/settings';
import * as emailingSchema from './schema/emailing';
import * as platformSchema from './schema/platform';

export const createDbClient = (connectionString: string) => {
  const sql = neon(connectionString);
  return drizzle(sql, { schema: { ...authSchema, ...crmSchema, ...accountingSchema, ...hrmSchema, ...reportsSchema, ...settingsSchema, ...emailingSchema, ...platformSchema } });
};

export const schema = {
  ...authSchema,
  ...crmSchema,
  ...accountingSchema,
  ...hrmSchema,
  ...reportsSchema,
  ...settingsSchema,
  ...emailingSchema,
  ...platformSchema,
};

export { authSchema, crmSchema, accountingSchema, hrmSchema, reportsSchema, settingsSchema, emailingSchema, platformSchema };

export * from 'drizzle-orm';
