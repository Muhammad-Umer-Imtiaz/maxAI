'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import Image from 'next/image'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import {
  Home,
  Sparkles,
  ClipboardList,
  ListChecks,
  History as HistoryIcon,
  RefreshCw,
  Settings as SettingsIcon,
  LogOut, // added
} from 'lucide-react'
import { useMemo } from 'react'

type Plan = 'free' | 'starter' | 'proFit' | 'maxFlex'
type TabEntry = {
  label: string
  href: string
  plans: Plan[]
  icon: React.ReactNode
}

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const plan = user?.plan as Plan | undefined

  const tabs: TabEntry[] = useMemo(
    () => [
      {
        label: 'Overview',
        href: '/dashboard',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Home className="w-5 h-5" />,
      },
      {
        label: 'AI Assistant',
        href: '/dashboard/ai-assistant',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Sparkles className="w-5 h-5" />,
      },
      {
        label: 'Plan Summaries',
        href: '/dashboard/plan-summary',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <ClipboardList className="w-5 h-5" />,
      },
      {
        label: 'Custom Plans',
        href: '/dashboard/custom-plans',
        plans: ['proFit', 'maxFlex'],
        icon: <ListChecks className="w-5 h-5" />,
      },
      {
        label: 'AI Call History',
        href: '/dashboard/call-history',
        plans: ['proFit', 'maxFlex'],
        icon: <HistoryIcon className="w-5 h-5" />,
      },
      {
        label: 'Regular Updates',
        href: '/dashboard/regular-updates',
        plans: ['maxFlex'],
        icon: <RefreshCw className="w-5 h-5" />,
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <SettingsIcon className="w-5 h-5" />,
      },
    ],
    [],
  )

  // While user not fetched, show a compact full-height loader inside the sidebar
  if (!user) {
    return (
      <aside className="w-72 h-screen bg-maxfit-black border-r border-maxfit-darker-grey/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-xs text-maxfit-medium-grey">Loading…</div>
        </div>
      </aside>
    )
  }

  const filteredTabs = tabs.filter((tab) => plan && tab.plans.includes(plan))

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-700 text-gray-100'
      case 'starter':
        return 'bg-blue-600/90 text-blue-50'
      case 'proFit':
        return 'bg-purple-600/90 text-purple-50'
      case 'maxFlex':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      default:
        return 'bg-gray-700 text-gray-100'
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <aside className="w-72 h-screen bg-maxfit-black border-r border-maxfit-darker-grey/30 flex flex-col">
      {/* Header */}
      <div className="px-5 py-5 border-b border-maxfit-darker-grey/30">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <Image
              src={MaxFitLogo}
              alt="MaxFit Logo"
              width={56} // was 44
              height={56} // was 44
              className="rounded-xl" // was rounded-lg
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-maxfit-white font-semibold leading-tight">MAXFIT AI</div>
            {plan && (
              <div
                className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getPlanBadgeColor(
                  plan,
                )}`}
                title={`${plan} plan`}
              >
                <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 opacity-70"></span>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="space-y-1.5">
          {filteredTabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover-lift ${
                  isActive
                    ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg text-black'
                    : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-md ${
                    isActive ? 'text-maxfit-black' : 'text-maxfit-neon-green/80'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="font-medium tracking-wide truncate">{tab.label}</span>

                {isActive ? (
                  <div className="ml-auto w-1.5 h-1.5 bg-maxfit-black rounded-full"></div>
                ) : (
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-4 bg-maxfit-neon-green rounded-full"></div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* User Info */}
        <div className="mt-6 pt-6 border-t border-maxfit-darker-grey/30">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-card-gradient rounded-full flex items-center justify-center">
                <span className="text-maxfit-neon-green font-bold text-sm">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-maxfit-white truncate">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-maxfit-medium-grey truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-5 border-t border-maxfit-darker-grey/30">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-xl bg-maxfit-darker-grey text-maxfit-white hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}
