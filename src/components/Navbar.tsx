'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import UserMenu from './UserMenu'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className="bg-[#0A0A0A]/50 backdrop-blur-sm border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section with logo */}
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <Link href={isAuthenticated ? '/home' : '/'} className="text-white text-xl font-bold">
              Idea Tool
            </Link>
          </div>

          {/* Center section with navigation */}
          {isAuthenticated && (
            <div className="flex items-center space-x-8">
              <button
                onClick={() => router.push('/home')}
                className={`${
                  pathname === '/home'
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                } px-1 py-5 text-sm font-medium transition-colors`}
              >
                Home
              </button>
              <button
                onClick={() => router.push('/history')}
                className={`${
                  pathname === '/history'
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                } px-1 py-5 text-sm font-medium transition-colors`}
              >
                Idea History
              </button>
            </div>
          )}

          {/* Right section with notification and profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <BellIcon className="w-6 h-6" />
                </button>
                <UserMenu />
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 