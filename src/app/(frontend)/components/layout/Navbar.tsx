'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/app/(frontend)/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/app/(frontend)/assets/maxfit.svg'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { user, logout, loading } = useAuth()
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  // Prevent page scroll while loading
  useEffect(() => {
    const prev = document.body.style.overflow
    if (loading) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [loading])

  // Full-page loader until auth finishes
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[10000] bg-hero-gradient flex flex-col items-center justify-center"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="relative">
          <Image
            src={Logo}
            alt="MAXFIT AI"
            width={88}
            height={88}
            className="object-contain drop-shadow-lg"
            priority
          />
          <div className="absolute inset-0 rounded-full border-2 border-maxfit-neon-green/30 border-t-maxfit-neon-green animate-spin" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-maxfit-black/90 border-b border-maxfit-neon-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="relative w-44 h-12">
            <Link href="/">
              <Image src={Logo} alt="MAXFITAI Logo" fill className="object-contain" priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['home', 'features', 'how-it-works', 'testimonials', 'pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="text-white hover:text-maxfit-neon-green transition-colors duration-300 capitalize"
                >
                  {item.replace('-', ' ')}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-maxfit-neon-green hover:bg-maxfit-neon-green/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-neon">Register</Button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-maxfit-neon-green/20"
                >
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown size={18} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-black border border-maxfit-neon-green/30 rounded-md shadow-lg z-50">
                    <div className="p-4 text-sm text-white border-b border-maxfit-neon-green/10">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs capitalize text-maxfit-neon-green">{user.plan}</div>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-maxfit-neon-green/10"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-white hover:text-maxfit-neon-green"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-nav">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-maxfit-dark-grey/95 backdrop-blur-md rounded-b-lg border border-maxfit-neon-green/20">
              {['home', 'features', 'how-it-works', 'testimonials', 'pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="block px-3 py-2 text-white hover:text-maxfit-neon-green transition-colors"
                >
                  {item.replace('-', ' ')}
                </a>
              ))}

              <div className="pt-4 pb-2 space-y-2">
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:text-maxfit-neon-green hover:bg-maxfit-neon-green/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full btn-neon">Register</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-white text-sm px-3 py-1 border-b border-maxfit-neon-green/20">
                      <div>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-maxfit-neon-green">{user.email}</div>
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full btn-neon">Dashboard</Button>
                    </Link>
                    <Button className="w-full" variant="ghost" onClick={logout}>
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
