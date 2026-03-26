'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)

  const onLogin = async () => {
    setIsLoading(true)
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: process.env.NEXT_PUBLIC_CLIENT_URL,
    })
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 justify-center items-center min-h-screen w-full px-4 sm:px-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <Image
            loading="eager"
            src={'/login.svg'}
            alt="Login"
            width={180}
            className="relative z-10 transform transition hover:scale-[1.03] duration-500 drop-shadow-2xl"
          />
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-zinc-800 via-indigo-600 to-zinc-400 dark:from-indigo-400 dark:via-purple-400 dark:to-zinc-400 drop-shadow-sm select-none">
          Welcome to AI ALI Agent Web App
        </h1>
        <p className="text-base md:text-lg font-medium text-zinc-500 dark:text-zinc-400/80 max-w-lg leading-relaxed">
          Authenticate your account to securely sync your device flow and unify your workspace
          seamlessly.
        </p>
      </div>

      <div className="w-full max-w-md relative group mt-4">
        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
        <Card className="relative border border-zinc-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
          <CardContent className="p-6 pt-8">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant={'outline'}
                  disabled={isLoading}
                  className="group/btn relative w-full h-14 overflow-hidden rounded-2xl border-zinc-300 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]"
                  type="button"
                  onClick={onLogin}
                >
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10 w-full h-full text-base font-semibold text-zinc-900 dark:text-zinc-200">
                    <Image
                      src={'/github.svg'}
                      alt="Github"
                      height={20}
                      width={20}
                      className="size-5 dark:invert transition-transform duration-300 group-hover/btn:rotate-15 group-hover/btn:scale-110"
                    />
                    {isLoading ? 'Connecting...' : 'Continue With GitHub'}
                  </div>
                </Button>
              </div>
              <div className="flex items-center gap-3 w-full py-4">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-300 dark:via-zinc-700/50 to-transparent"></div>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                  or
                </span>
                <div className="h-px flex-1 bg-linear-to-l from-transparent via-zinc-300 dark:via-zinc-700/50 to-transparent"></div>
              </div>
            </div>
          </CardContent>
          <div className="px-8 pb-8 pt-0 text-center relative z-10">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 max-w-70 mx-auto leading-relaxed">
              By continuing, you agree to AI CLI Agent&apos;s terms of service and strict privacy
              bounds.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
