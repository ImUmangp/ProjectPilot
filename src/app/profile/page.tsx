'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username || '')
        setDisplayName(profile.display_name || '')
      } else if (user.user_metadata?.username) {
        setUsername(user.user_metadata.username)
        setDisplayName(user.user_metadata.display_name || user.user_metadata.username)
      } else {
        const defaultName = user.email?.split('@')[0] || ''
        setUsername(defaultName)
        setDisplayName(defaultName)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ text: 'Failed to load profile', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // First, ensure the profiles table exists and has the correct structure
      const { error: tableError } = await supabase.rpc('ensure_profile_table')
      if (tableError) {
        console.error('Error ensuring table:', tableError)
        // Continue anyway as the table might already exist
      }

      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Use the user's ID as the profile ID
          user_id: user.id,
          username: username,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(profileError.message)
      }

      // Also update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          username,
          display_name: displayName
        }
      })

      if (updateError) {
        console.error('Metadata update error:', updateError)
        throw new Error(updateError.message)
      }

      setMessage({ text: 'Profile updated successfully', type: 'success' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ 
        text: error.message || 'Failed to update profile', 
        type: 'error' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-[#1A1A1A]/50 backdrop-blur-sm p-8 rounded-lg border border-[#333333] shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-8">Profile Settings</h2>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-900/50 text-green-400 border border-green-800'
                : 'bg-red-900/50 text-red-400 border border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || username)}`}
                  alt="Profile"
                  className="h-20 w-20 rounded-full bg-gray-800"
                />
                <div className="text-sm text-gray-400">
                  Your profile picture is automatically generated based on your display name
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your display name"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
              <p className="mt-1 text-sm text-gray-400">This is your unique identifier for the system</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors ${
                saving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 