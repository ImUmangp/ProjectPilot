'use client'

import { useState } from 'react'
import { generateStructuredIdea, saveIdea } from '@/lib/gemini'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function IdeaForm() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedStructure, setGeneratedStructure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const structuredIdea = await generateStructuredIdea(prompt)
      setGeneratedStructure(structuredIdea)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedStructure) return

    setSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      await saveIdea(generatedStructure)
      setSaveSuccess(true)
      // Wait a bit before redirecting to history
      setTimeout(() => {
        router.push('/history')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save idea')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="sr-only">
            Enter your idea
          </label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your idea description..."
            className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-sm text-green-400">Successfully saved! Redirecting to history...</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="flex items-center justify-center w-full gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? (
            'Generating...'
          ) : (
            <>
              Generate Structure
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {generatedStructure && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-white">Generated Structure</h2>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg">
            <div className="max-h-[500px] overflow-y-auto p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm break-words">
                {generatedStructure}
              </pre>
            </div>
            <div className="border-t border-[#333333] p-4 flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedStructure)
                  alert('Copied to clipboard!')
                }}
                className="flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save to History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 