import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
    plugins: [
        organizationClient()
    ]
});

console.log("Keys in authClient:");
console.log(Object.keys(authClient).filter(k => k.startsWith('use')));
