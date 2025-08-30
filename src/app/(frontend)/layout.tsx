// app/layout.tsx
import './styles.css'
import { Toaster } from '@/app/(frontend)/components/ui/toaster'
import { Toaster as Sonner } from '@/app/(frontend)/components/ui/sonner'
import { TooltipProvider } from '@/app/(frontend)/components/ui/tooltip'
import { ReactQueryProvider } from './providers'
import { AuthProvider } from './context/AuthProvider'

export const metadata = {
  title: 'MAXFITAI',
  description: 'Your AI-powered fitness companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-maxfit-black">
        <ReactQueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
