'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle, XCircle, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

const DeviceApprovalContent = () => {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userCode = searchParams.get('user_code')
  const [isProcessing, setIsProcessing] = useState({
    approve: false,
    deny: false,
  })

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!data?.session && !data?.user) {
    router.push('/sign-in')
    return null
  }

  const handleApprove = async () => {
    setIsProcessing({ approve: true, deny: false })
    try {
      toast.loading('Approving device...', { id: 'loading' })
      await authClient.device.approve({ userCode: userCode! })
      toast.dismiss('loading')
      toast.success('Device approved successfully!')
      router.push('/')
    } catch (err) {
      toast.error(
        'Failed to approve device :: ' + (err instanceof Error ? err.message : String(err))
      )
    }
    setIsProcessing({ approve: false, deny: false })
  }

  const handleDeny = async () => {
    setIsProcessing({ approve: false, deny: true })
    try {
      toast.loading('Denying device...', { id: 'deny' })
      await authClient.device.deny({ userCode: userCode! })
      toast.dismiss('deny')
      toast.success('Oops! Device denied to approve!')
      router.push('/')
    } catch (err) {
      toast.error('Failed to deny device :: ' + (err instanceof Error ? err.message : String(err)))
    }
    setIsProcessing({ approve: false, deny: false })
  }

  return (
    <div className="flex flex-col gap-6 justify-center items-center min-h-screen w-full px-4 sm:px-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl flex items-center justify-center transform transition hover:scale-[1.03] duration-500 shadow-2xl">
            <Smartphone className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-zinc-800 via-indigo-600 to-zinc-400 dark:from-indigo-400 dark:via-purple-400 dark:to-zinc-400 drop-shadow-sm select-none">
          Authorize Access
        </h1>
        <p className="text-base md:text-lg font-medium text-zinc-500 dark:text-zinc-400/80 max-w-lg leading-relaxed">
          A new device is requesting access to your account:
          <br />
          <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
            {data?.user?.email}
          </span>
        </p>
      </div>

      <div className="w-full max-w-md relative group mt-4">
        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
        <Card className="relative border border-zinc-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
          <CardContent className="p-6 pt-8">
            <div className="grid gap-6">
              <div className="flex flex-col items-center justify-center space-y-2 p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Authorization Code
                </p>
                <p className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                  {userCode || '---'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing.approve || isProcessing.deny}
                  className="group/btn relative w-full h-14 overflow-hidden rounded-2xl border-none bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-emerald-500/25"
                >
                  <div className="flex items-center justify-center gap-2 relative z-10 w-full h-full text-base font-semibold">
                    {isProcessing.approve ? (
                      <>
                        <Spinner className="w-5 h-5 text-white" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" />
                        Approve Access
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  onClick={handleDeny}
                  disabled={isProcessing.approve || isProcessing.deny}
                  variant="outline"
                  className="group/btn relative w-full h-14 overflow-hidden rounded-2xl border-zinc-300 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center gap-2 relative z-10 w-full h-full text-base font-semibold">
                    {isProcessing.deny ? (
                      <>
                        <Spinner className="w-5 h-5" />
                        Denying...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" />
                        Deny Request
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="px-8 pb-8 pt-0 text-center relative z-10">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 leading-relaxed">
              For your security, only approve if you initiated this request. Never share this code.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DeviceApprovalContent
