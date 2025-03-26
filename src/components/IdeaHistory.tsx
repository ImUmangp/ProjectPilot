'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'

interface Idea {
  id: string
  content: string
  created_at: string
}

export default function IdeaHistory() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', id)
      if (error) throw error
      setIdeas(ideas.filter(idea => idea.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No ideas found. Start by submitting a new idea!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ideas.map((idea) => (
        <div key={idea.id} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Idea from {new Date(idea.created_at).toLocaleDateString()}
                </h3>
              </div>
              <button
                onClick={() => handleDelete(idea.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <div className="mt-4 prose prose-indigo max-w-none">
              <ReactMarkdown>{idea.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 