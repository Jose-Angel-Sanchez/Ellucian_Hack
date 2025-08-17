'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function GeminiTest() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const testGemini = async () => {
    if (!prompt) return

    setLoading(true)
    setResponse("")
    
    try {
      console.log("Sending request to Gemini API...")
      
      const res = await fetch("/api/test-gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      console.log("API Response status:", res.status)
      
      if (!res.ok) {
        console.error("API Error response:", data)
        throw new Error(data.error || `Error ${res.status}: Failed to generate response`)
      }

      if (!data.success || typeof data.response !== "string") {
        console.error("Invalid API response format:", data)
        throw new Error("Invalid response format from API")
      }

      console.log("Successfully received response")
      setResponse(data.response)
    } catch (error) {
      console.error("Error in testGemini:", error)
      alert(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Test Gemini API
          </CardTitle>
          <CardDescription>
            Try out the Gemini AI model by entering a prompt below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={testGemini} 
            disabled={!prompt || loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Response"}
          </Button>
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Response:</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
