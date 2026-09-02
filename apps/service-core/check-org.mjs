import { organization } from 'better-auth/plugins';
// Check what getFullOrganization returns
const plug = organization({});
console.log(JSON.stringify(Object.keys(plug), null, 2));
