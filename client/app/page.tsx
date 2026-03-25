'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
// import { useState } from 'react'

const Home = () => {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!data?.user && !data?.session) {
    router.push('/sign-in')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        {/* Profile Header Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative border border-zinc-200 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl shadow-2xl rounded-[2rem] p-8 sm:p-10 ring-1 ring-white/20 transition-all duration-300">
            {/* Avatar */}
            <div className="flex justify-center mb-8 relative">
              <div className="relative group/avatar">
                <div className="absolute -inset-1.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-40 group-hover/avatar:opacity-70 transition duration-500"></div>
                <Image
                  src={data?.user?.image || '/vercel.svg'}
                  alt={data?.user?.name || 'User'}
                  width={120}
                  height={120}
                  unoptimized
                  className="relative rounded-full border-[3px] border-white/80 dark:border-zinc-800/80 object-cover shadow-xl transition-transform duration-500 group-hover/avatar:scale-[1.05]"
                />
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white dark:border-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-zinc-800 via-indigo-600 to-zinc-400 dark:from-white dark:via-indigo-300 dark:to-zinc-500 truncate drop-shadow-sm pb-1">
                Welcome, {data?.user?.name || 'User'}
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm font-semibold tracking-wide">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                Authenticated Workspace
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {/* User Details Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-zinc-500/10 to-zinc-400/10 rounded-2xl blur opacity-50 transition duration-500"></div>
            <div className="relative border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md shadow-lg transition-colors hover:bg-white/80 dark:hover:bg-zinc-900/60 flex items-center justify-between">
              <div className="space-y-1.5 overflow-hidden">
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                  Email Address
                </p>
                <p className="text-base sm:text-lg text-zinc-900 dark:text-zinc-200 font-medium truncate">
                  {data?.user?.email}
                </p>
              </div>
              <div className="shrink-0 ml-4 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onError: (ctx) => console.log(ctx),
                  onSuccess: () => router.push('/sign-in'),
                },
              })
            }
            variant="destructive"
            className="group relative w-full h-14 overflow-hidden rounded-2xl border-red-500/20 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          >
            <span className="flex items-center justify-center gap-2.5 relative z-10 text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Secure Sign Out
            </span>
          </Button>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 pt-4 opacity-70">
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-300 dark:via-zinc-700/80 to-transparent"></div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-[0.25em] uppercase">
            Session Active
          </span>
          <div className="flex-1 h-px bg-linear-to-l from-transparent via-zinc-300 dark:via-zinc-700/80 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}

export default Home
