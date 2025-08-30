// app/dashboard/layout.tsx
import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/app/(frontend)/components/ui/sidebar'
import { Sidebar } from '@/app/(frontend)/components/layout/Sidebar'
import MobileNav from '@/app/(frontend)/components/layout/MobileNav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Main Content */}
        <SidebarInset className="flex-1 overflow-auto">
          <div className="pt-16 md:pt-0">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
