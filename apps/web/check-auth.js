const { createAuthClient } = require("better-auth/react");
const { organizationClient } = require("better-auth/client/plugins");
const authClient = createAuthClient({
    plugins: [organizationClient()]
});
console.log(Object.keys(authClient));
