import { cancel, confirm, intro, isCancel, outro } from '@clack/prompts'
import { logger } from 'better-auth'
import { createAuthClient } from 'better-auth/client'
import { deviceAuthorizationClient } from 'better-auth/client/plugins'
import chalk from 'chalk'
import { Command } from 'commander'
import fs from 'fs/promises'
import open from 'open'
import os from 'os'
import path from 'path'
import yoctoSpinner from 'yocto-spinner'
import * as z from 'zod/v4'
import dotenv from 'dotenv'
import prisma from '../../../lib/db.js'

dotenv.config()

const DEMO_URL = 'http://localhost:3005'
const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CONFIG_DIR = path.join(os.homedir(), '.better-auth')
const TOKEN_FILE = path.join(CONFIG_DIR, 'token.json')

const getStoredToken = async () => {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf-8')
    const token = JSON.parse(data)
    return token
  } catch (err) {
    // Only log error if it's not just a missing file
    if (err.code !== 'ENOENT') {
      console.error('Error reading token file:', err.message)
    }
    return null
  }
}

const storeToken = async (token) => {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })

    const tokenData = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_type: token.token_type || 'Bearer',
      scope: token.scope,
      expires_at: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
      created_at: new Date().toISOString(),
    }

    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error(chalk.red('Failed to store token:'), err.message)
    return false
  }
}

const clearStoredToken = async () => {
  try {
    await fs.unlink(TOKEN_FILE)
    return true
  } catch (err) {
    console.error('Failed to clear the token file', err.message)
    return false
  }
}

const isTokenExpired = async () => {
  try {
    const token = await getStoredToken()
    if (!token || !token.expires_at) {
      return true
    }

    const expiresAt = new Date(token.expires_at)
    const now = new Date()

    // Consider expired if less than 5 minutes remaining
    return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000
  } catch (err) {
    console.error('Failed to check token expiration', err.message)
    return true
  }
}

const requireAuth = async () => {
  const token = await getStoredToken()

  if (!token) {
    console.log(chalk.red("❌ Not authenticated. Please run 'your-cli login' first."))
    process.exit(1)
  }

  if (await isTokenExpired()) {
    console.log(chalk.yellow('⚠️  Your session has expired. Please login again.'))
    console.log(chalk.gray('   Run: your-cli login\n'))
    process.exit(1)
  }

  return token
}

// ============================================
// LOGIN COMMAND
// ============================================

const loginAction = async (opts) => {
  const options = z
    .object({
      serverUrl: z.string().optional(),
      clientId: z.string().optional(),
    })
    .parse(opts)

  const serverUrl = options.serverUrl || DEMO_URL
  const clientId = options.clientId || CLIENT_ID

  intro(chalk.bold('🔐 Better Auth CLI Login'))

  if (!clientId) {
    logger.error('CLIENT_ID is not set in .env file')
    console.log(chalk.red('\n❌ Please set GITHUB_CLIENT_ID in your .env file'))
    process.exit(1)
  }

  // Check if already logged in
  const existingToken = await getStoredToken()
  const expired = await isTokenExpired()

  if (existingToken && !expired) {
    const shouldReauth = await confirm({
      message: "You're already logged in. Do you want to log in again?",
      initialValue: false,
    })

    if (isCancel(shouldReauth) || !shouldReauth) {
      cancel('Login cancelled')
      process.exit(0)
    }
  }

  // Create the auth client
  const authClient = createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  })

  const spinner = yoctoSpinner({ text: 'Requesting device authorization...' })
  spinner.start()

  try {
    // Request device code
    const { data, error } = await authClient.device.code({
      client_id: clientId,
      scope: 'openid profile email',
    })

    spinner.stop()

    if (error || !data) {
      logger.error(
        `Failed to request device authorization: ${
          error?.error_description || error?.message || 'Unknown error'
        }`
      )

      if (error?.status === 404) {
        console.log(chalk.red('\n❌ Device authorization endpoint not found.'))
        console.log(chalk.yellow('   Make sure your auth server is running.'))
      } else if (error?.status === 400) {
        console.log(chalk.red('\n❌ Bad request - check your CLIENT_ID configuration.'))
      }

      process.exit(1)
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
      expires_in,
    } = data

    // Display authorization instructions
    console.log('')
    console.log(chalk.cyan('📱 Device Authorization Required'))
    console.log('')
    console.log(
      `Please visit: ${chalk.underline.blue(verification_uri_complete || verification_uri)}`
    )
    console.log(`Enter code: ${chalk.bold.green(user_code)}`)
    console.log('')

    // Ask if user wants to open browser
    const shouldOpen = await confirm({
      message: 'Open browser automatically?',
      initialValue: true,
    })

    if (!isCancel(shouldOpen) && shouldOpen) {
      const urlToOpen = verification_uri_complete || verification_uri
      await open(urlToOpen)
    }

    // Start polling
    console.log(
      chalk.gray(`Waiting for authorization (expires in ${Math.floor(expires_in / 60)} minutes)...`)
    )

    const token = await pollForToken(authClient, device_code, clientId, interval)

    if (token) {
      // Store the token
      const saved = await storeToken(token)

      if (!saved) {
        console.log(chalk.yellow('\n⚠️  Warning: Could not save authentication token.'))
        console.log(chalk.yellow('   You may need to login again on next use.'))
      }

      // Get user info
      const { data: session } = await authClient.getSession({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      })

      outro(
        chalk.green(
          `✅ Login successful! Welcome ${session?.user?.name || session?.user?.email || 'User'}`
        )
      )

      console.log(chalk.gray(`\n📁 Token saved to: ${TOKEN_FILE}`))
      console.log(chalk.gray('   You can now use AI commands without logging in again.\n'))
    }
  } catch (err) {
    spinner.stop()
    console.error(chalk.red('\nLogin failed:'), err.message)
    process.exit(1)
  }
}

const pollForToken = async (authClient, deviceCode, clientId, initialInterval) => {
  let pollingInterval = initialInterval
  const spinner = yoctoSpinner({ text: '', color: 'cyan' })
  let dots = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      dots = (dots + 1) % 4
      spinner.text = chalk.gray(
        `Polling for authorization${'.'.repeat(dots)}${' '.repeat(3 - dots)}`
      )
      if (!spinner.isSpinning) spinner.start()

      try {
        const { data, error } = await authClient.device.token({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode,
          client_id: clientId,
          fetchOptions: {
            headers: {
              'user-agent': `Better Auth CLI`,
            },
          },
        })

        if (data?.access_token) {
          console.log(chalk.bold.yellow(`Your access token: ${data.access_token}`))
          spinner.stop()
          resolve(data)
          return
        } else if (error) {
          switch (error.error) {
            case 'authorization_pending':
              // Continue polling
              break
            case 'slow_down':
              pollingInterval += 5
              break
            case 'access_denied':
              spinner.stop()
              logger.error('Access was denied by the user')
              process.exit(1)
              break
            case 'expired_token':
              spinner.stop()
              logger.error('The device code has expired. Please try again.')
              process.exit(1)
              break
            default:
              spinner.stop()
              logger.error(`Error: ${error.error_description}`)
              process.exit(1)
          }
        }
      } catch (err) {
        spinner.stop()
        logger.error(`Network error: ${err.message}`)
        process.exit(1)
      }
      setTimeout(poll, pollingInterval * 1000)
    }
    setTimeout(poll, pollingInterval * 1000)
  })
}

// ============================================
// LOGOUT COMMAND
// ============================================

const logoutAction = async () => {
  const spinner = yoctoSpinner({ text: 'Logging out...' }).start()
  const success = await clearStoredToken()
  spinner.stop()

  if (success) {
    outro(chalk.green('✅ Logged out successfully'))
  } else {
    console.log(chalk.red('❌ Failed to clear credentials'))
  }
}
// ============================================
// WHOAMI COMMAND
// ============================================

const whoamiAction = async () => {
  const token = await getStoredToken()
  if (!token?.access_token) {
    console.log('No access token found. Please login.')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: {
            token: token.access_token,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    if (!user) {
      console.log(chalk.yellow('Session invalid or user not found.'))
      return
    }

    // Output user session info
    console.log(
      chalk.bold.greenBright(`\n👤 User: ${user.name}
📧 Email: ${user.email}
👤 ID: ${user.id}`)
    )
  } catch (error) {
    console.error(chalk.red('Failed to fetch user info:'), error.message)
    process.exit(1)
  }
}

// ============================================
// COMMANDER SETUP
// ============================================

export const login = new Command('login')
  .description('Login to Better Auth')
  .option('--server-url <url>', 'The Better Auth server URL', DEMO_URL)
  .option('--client-id <id>', 'The OAuth client ID', CLIENT_ID)
  .action(loginAction)

export const logout = new Command('logout')
  .description('Logout and clear stored credentials')
  .action(logoutAction)

export const whoami = new Command('whoami')
  .description('Show current authenticated user')
  .option('--server-url <url>', 'The Better Auth server URL', DEMO_URL)
  .action(whoamiAction)

export {
  getStoredToken,
  storeToken,
  clearStoredToken,
  isTokenExpired,
  requireAuth,
  whoamiAction,
  loginAction,
  logoutAction,
  pollForToken,
}
