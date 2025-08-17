import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { generateContent } from "@/lib/gemini/config"

export async function POST(request: NextRequest) {
  console.log("Received request to /api/test-gemini")
  
  try {
    // Parse request body
    const body = await request.json().catch(error => {
      console.error("Error parsing request body:", error)
      throw new Error("Invalid request body")
    })

    const { prompt } = body

    if (!prompt) {
      console.error("Missing prompt in request")
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    console.log("Processing request with prompt:", prompt)

    // Validate environment
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Missing GOOGLE_GEMINI_API_KEY in environment")
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      )
    }

    // Genera la respuesta usando Gemini
    const text = await generateContent(prompt)

    console.log("Successfully generated response")

    return NextResponse.json({ 
      success: true,
      response: text 
    })

  } catch (error) {
    console.error("Error in /api/test-gemini:", error)
    
    // Determine appropriate error message and status
    let message = "An unexpected error occurred"
    let status = 500

    if (error instanceof Error) {
      message = error.message
      
      if (message.includes("API key not configured")) {
        status = 500
        message = "API configuration error"
      } else if (message.includes("Invalid request body")) {
        status = 400
      } else if (message.includes("Failed to parse") || message.includes("Invalid response format")) {
        status = 502 // Bad Gateway
      }
    }

    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
