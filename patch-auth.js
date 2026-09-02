const fs = require('fs');
let content = fs.readFileSync('apps/service-core/src/auth.ts', 'utf8');

const searchStr = \    plugins: [
        organization({\;

const replaceStr = \    plugins: [
        organization({
            schema: {
                member: {
                    additionalFields: {
                        modules: { type: "string" }
                    }
                },
                invitation: {
                    additionalFields: {
                        modules: { type: "string" }
                    }
                }
            },\;

fs.writeFileSync('apps/service-core/src/auth.ts', content.replace(searchStr, replaceStr));
