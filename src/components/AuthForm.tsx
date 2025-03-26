'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) throw error

      setSuccess('Password reset email sent! Please check your inbox.')
      setEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (isSignUp) {
      try {
        console.log('Starting signup process...')
        // First, sign up the user
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username // Store username in user metadata
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        console.log('Signup response:', { error: signUpError, data })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        // Set success message immediately after successful signup
        setSuccess('Please check your email for the confirmation link!')
        
        // Try to create profile if we have user data
        if (data.user?.id) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: data.user.id,
                  username: username,
                  email: email
                }
              ])
            console.log('Profile creation response:', { error: profileError })
          } catch (profileErr) {
            console.error('Profile creation error:', profileErr)
            // Continue even if profile creation fails
          }
        }

        // Clear form after a delay to keep message visible
        setTimeout(() => {
          setEmail('')
          setPassword('')
          setUsername('')
        }, 2000)
        
        return
      } catch (err: any) {
        console.error('Error during signup:', err)
        setError(err?.message || 'An unexpected error occurred')
        return
      }
    }

    try {
      // Handle sign in
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in. Check your inbox for the confirmation link.')
        } else {
          setError(error.message)
        }
        return
      }

      // Successful login - redirect to home
      router.push('/home')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-white">
          {isForgotPassword 
            ? 'Reset your password'
            : isSignUp 
              ? 'Create your account' 
              : 'Sign in to your account'}
        </h2>

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <div>
                <label htmlFor="username" className="block text-sm text-gray-400 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={isSignUp}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required={!isForgotPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {loading 
              ? 'Processing...' 
              : isForgotPassword
                ? 'Send Reset Link'
                : isSignUp 
                  ? 'Create account' 
                  : 'Sign in'}
          </button>
        </form>

        <div className="text-center space-y-2">
          {!isForgotPassword && (
            <p className="text-sm text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
          )}
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setIsForgotPassword(false)
                setError(null)
                setSuccess(null)
                setUsername('')
                setEmail('')
                setPassword('')
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {isForgotPassword 
                ? 'Back to sign in'
                : isSignUp 
                  ? 'Sign in instead' 
                  : 'Create an account'}
            </button>

            {!isSignUp && !isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(true)
                  setError(null)
                  setSuccess(null)
                  setPassword('')
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Forgot your password?
              </button>
            )}

            {isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(false)
                  setError(null)
                  setSuccess(null)
                  setEmail('')
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Remember your password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 