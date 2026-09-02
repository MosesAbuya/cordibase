import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient: any = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth` 
        : process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/api/auth`
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/auth`
        : "http://localhost:3000/api/auth",
    plugins: [
        organizationClient()
    ]
});

export const { signIn, signUp, signOut, useSession, useActiveOrganization: useOrganization } = authClient;
