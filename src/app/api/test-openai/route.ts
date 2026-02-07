import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY not found in environment variables',
        envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI'))
      }, { status: 500 })
    }

    // Try to initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Make a simple test call
    const result = await model.generateContent('Di solo "OK"')
    const response = result.response

    return NextResponse.json({
      success: true,
      message: response.text(),
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : ''
    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
      type: error?.constructor?.name
    }, { status: 500 })
  }
}
