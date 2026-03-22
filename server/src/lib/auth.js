import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './db.js'
import { deviceAuthorization } from 'better-auth/plugins'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "postgresql", ...etc
  }),
  basePath: '/api/auth',
  trustedOrigins: ['http://localhost:3000'],
  baseURL: 'http://localhost:3005',
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    deviceAuthorization({
      verificationUri: '/device',
      expiresIn: '30m', // Device code expiration time
      interval: '5s', // Minimum polling interval
    }),
  ],
  logger: {
    level: 'debug',
  },
})
