'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface IdeaRecord {
  id: string
  content: string
  created_at: string
}

export default function HistoryPage() {
  const [ideas, setIdeas] = useState<IdeaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setIdeas(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-white mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-white mb-8">Idea History</h1>
        
        {ideas.length === 0 ? (
          <p className="text-gray-400">No saved ideas yet.</p>
        ) : (
          <div className="space-y-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6"
              >
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm break-words">
                  {idea.content}
                </pre>
                <div className="mt-4 text-sm text-gray-500">
                  Saved on {new Date(idea.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 