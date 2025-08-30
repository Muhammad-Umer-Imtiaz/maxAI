'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthProvider'
import Image from 'next/image'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import {
  Menu,
  X,
  Home,
  Sparkles,
  ClipboardList,
  ListChecks,
  History as HistoryIcon,
  RefreshCw,
  Settings,
  LogOut,
  User,
} from 'lucide-react'

type Plan = 'free' | 'starter' | 'proFit' | 'maxFlex'
type TabEntry = {
  label: string
  href: string
  plans: Plan[]
  icon: React.ReactNode
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
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
        icon: <Settings className="w-5 h-5" />,
      },
    ],
    [],
  )

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
    setIsOpen(false)
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-maxfit-darker-grey/90 backdrop-blur-sm border border-maxfit-medium-grey/20 rounded-lg text-maxfit-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-maxfit-black/95 backdrop-blur-md border-r border-maxfit-darker-grey/30 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-maxfit-darker-grey/30">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <Image
                    src={MaxFitLogo}
                    alt="MaxFit Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-maxfit-white font-semibold text-sm">MAXFIT AI</div>
                  {plan && (
                    <div
                      className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPlanBadgeColor(
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
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-maxfit-medium-grey hover:text-maxfit-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {filteredTabs.map((tab) => {
                const isActive = pathname === tab.href

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg'
                        : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center ${
                        isActive ? 'text-maxfit-black' : 'text-maxfit-neon-green/80'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="font-medium">{tab.label}</span>

                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-maxfit-black rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Info Section */}
            <div className="p-4 border-t border-maxfit-darker-grey/30">
              <div className="glass-card p-4 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-card-gradient rounded-full flex items-center justify-center">
                    <span className="text-maxfit-neon-green font-bold text-sm">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-maxfit-white truncate">
                      {user?.firstName || 'User'} {user?.lastName || ''}
                    </p>
                    <p className="text-xs text-maxfit-medium-grey truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
