import { createAuthClient } from 'better-auth/react' // make sure to import from better-auth/react
import { deviceAuthorizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL, // replace with your backend URL
  plugins: [deviceAuthorizationClient()],
})
