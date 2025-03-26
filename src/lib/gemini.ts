import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from './supabase'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export async function generateStructuredIdea(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Create a structured project plan for the following idea:
          ${prompt}
          
          Format the response as a Markdown document with the following sections:
          - Project Title
          - Problem Statement
          - Solution Overview
          - Features
          - Target Audience
          - Technical Stack
          - Implementation Steps
          - Resources & Tools`
        }]
      }]
    })

    const response = await result.response
    return response.text()
  } catch (error: any) {
    console.error('Error generating content:', error)
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing API key. Please check your configuration.')
    } else if (error.message.includes('not found')) {
      throw new Error('Unable to access AI model. Please try again later.')
    } else {
      throw new Error('Failed to generate content. Please try again.')
    }
  }
}

export async function saveIdea(content: string) {
  if (!content) {
    throw new Error('No content provided to save')
  }

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw new Error('Authentication error: ' + authError.message)
    if (!user) throw new Error('Not authenticated')

    // Attempt to save
    const { data, error: insertError } = await supabase
      .from('ideas')
      .insert([
        {
          user_id: user.id,
          content: content,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      if (insertError.code === '42P01') {
        throw new Error('Ideas table does not exist. Please ensure the database is properly set up.')
      } else if (insertError.code === '23505') {
        throw new Error('This idea has already been saved.')
      } else {
        throw new Error(`Failed to save idea: ${insertError.message}`)
      }
    }

    return data
  } catch (error: any) {
    console.error('Error details:', error)
    if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('An unexpected error occurred while saving the idea')
    }
  }
} 