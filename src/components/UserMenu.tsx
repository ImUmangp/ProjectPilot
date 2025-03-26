'use client'

import { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function UserMenu() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // First try to get the profile from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('user_id', user.id)
          .single()

        if (profile?.display_name) {
          setDisplayName(profile.display_name)
          setLoading(false)
          return
        }

        if (profile?.username) {
          setDisplayName(profile.username)
          setLoading(false)
          return
        }

        // If no profile found, try to get display name from user metadata
        if (user.user_metadata?.display_name) {
          setDisplayName(user.user_metadata.display_name)
          setLoading(false)
          return
        }

        // Try username from metadata as fallback
        if (user.user_metadata?.username) {
          setDisplayName(user.user_metadata.username)
          setLoading(false)
          return
        }

        // As a last resort, use email
        setDisplayName(user.email?.split('@')[0] || '')
      } catch (error) {
        console.error('Error fetching user profile:', error)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user?.email) {
            setDisplayName(session.user.email.split('@')[0])
          }
        } catch (sessionError) {
          console.error('Error getting session:', sessionError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
  }

  return (
    <div className="relative">
      {message && (
        <div className={classNames(
          'absolute -top-12 right-0 p-2 rounded-lg text-sm w-64 text-center',
          message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'
        )}>
          {message.text}
        </div>
      )}
      
      <Menu as="div" className="relative inline-block text-left">
        <div className="flex items-center space-x-2">
          <Menu.Button className="flex items-center">
            <img
              className="h-8 w-8 rounded-full bg-gray-800"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
              alt={displayName}
            />
            <span className="ml-2 text-sm text-white">{displayName}</span>
            <EllipsisHorizontalIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-[#1A1A1A] border border-[#333333] shadow-lg focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push('/profile')}
                    className={classNames(
                      active ? 'bg-[#2A2A2A] text-white' : 'text-gray-300',
                      'block w-full px-4 py-2 text-left text-sm border-b border-[#333333]'
                    )}
                  >
                    Profile Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={classNames(
                      active ? 'bg-[#2A2A2A] text-white' : 'text-gray-300',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
} 