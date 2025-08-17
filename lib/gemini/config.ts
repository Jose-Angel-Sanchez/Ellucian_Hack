const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export async function generateContent(prompt: string) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error("Missing GOOGLE_GEMINI_API_KEY environment variable")
    throw new Error("API key not configured")
  }

  try {
    console.log("Preparing Gemini API request...")
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }

    console.log("Making request to Gemini API...")
    const response = await fetch(
      GEMINI_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GOOGLE_GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
      }
    )

    console.log(`Gemini API response status: ${response.status}`)
    
    let data
    try {
      data = await response.json()
      console.log("Response data received:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Error parsing response:", parseError)
      throw new Error("Failed to parse Gemini API response")
    }
    
    if (!response.ok) {
      console.error("Gemini API error response:", data)
      throw new Error(
        data.error?.message || 
        data.error || 
        `API returned status ${response.status}`
      )
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid response format from Gemini API")
    }

    const generatedText = data.candidates[0].content.parts[0].text
    console.log("Successfully generated text:", generatedText.substring(0, 100) + "...")
    return generatedText

  } catch (error) {
    console.error("Error in generateContent:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to generate content")
  }
}
