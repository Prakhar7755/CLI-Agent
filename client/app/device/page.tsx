'use client'
import { authClient } from '@/lib/auth-client'
import type React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const DeviceAuthorizationContent = () => {
  const [userCode, setUserCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('user_code')
    if (code) {
      let value = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4, 8)
      }
      setUserCode(value)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formattedCode = userCode.trim().replace(/-/g, '').toUpperCase()

      const response = await authClient.device({
        query: { user_code: formattedCode },
      })

      if (response.data) {
        router.push(`/approve?user_code=${formattedCode}`)
      }
    } catch (err) {
      setError('Invalid or expired code :: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8)
    }
    setUserCode(value)
  }

  return (
    <div className="flex flex-col gap-6 justify-center items-center min-h-screen w-full px-4 sm:px-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl flex items-center justify-center transform transition hover:scale-[1.03] duration-500 shadow-2xl">
            <ShieldAlert className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-zinc-800 via-indigo-600 to-zinc-400 dark:from-indigo-400 dark:via-purple-400 dark:to-zinc-400 drop-shadow-sm select-none">
          Device Authorization
        </h1>
        <p className="text-base md:text-lg font-medium text-zinc-500 dark:text-zinc-400/80 max-w-lg leading-relaxed">
          Enter your device code to sync and securely access your unified workspace.
        </p>
      </div>

      <div className="w-full max-w-md relative group mt-4">
        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
        <Card className="relative border border-zinc-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
          <CardContent className="p-6 pt-8">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="code"
                    className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Device Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={userCode}
                    onChange={handleCodeChange}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    className="w-full px-4 py-4 bg-white/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-center text-xl tracking-widest uppercase shadow-inner"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <Button
                  variant="outline"
                  disabled={isLoading || userCode.length < 9}
                  className="group/btn relative w-full h-14 overflow-hidden rounded-2xl border-zinc-300 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]"
                  type="submit"
                >
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center gap-2 relative z-10 w-full h-full text-base font-semibold text-zinc-900 dark:text-zinc-200">
                    {isLoading ? 'Verifying...' : 'Continue to Approval'}
                  </div>
                </Button>
              </div>
            </form>
          </CardContent>
          <div className="px-8 pb-8 pt-0 text-center relative z-10">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 max-w-70 mx-auto leading-relaxed">
              Find this code on the device you want to authorize. Keep it confidential.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function DeviceAuthorizationPage() {
  return (
    <Suspense>
      <DeviceAuthorizationContent />
    </Suspense>
  )
}
