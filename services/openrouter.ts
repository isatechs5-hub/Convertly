
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = window.location.origin;
const SITE_NAME = "OmniPDF AI";
const MODEL = "google/gemini-2.0-flash-exp:free";

const getHeaders = () => ({
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_NAME,
  "Content-Type": "application/json"
});

// Force non-streaming response as components expect full text
export const generateDocumentContent = async (enhancedPrompt: string, type: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }

  const systemPrompt = `You are a world-class professional document writer and editor. Your task is to write a high-quality, professionally formatted ${type}. 
  Follow all specific constraints (Tone, Language, Citation Style, Length) strictly. 
  Output valid Markdown formatting for headers, lists, and tables. 
  Do not include conversational filler like "Here is your report" - just output the document content directly.`;

  try {
    // 🆕 Use exact structure requested by user
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedPrompt }
        ],
        stream: false // Explicitly disable streaming to ensure compatibility with current UI
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error Details:", errorData);
      
      let userMessage = "The AI service is currently unavailable.";
      if (response.status === 401) userMessage = "Authentication failed. Please verify your API Key.";
      if (response.status === 402) userMessage = "Insufficient credits in your AI account.";
      if (response.status === 429) userMessage = "Rate limit exceeded. Please try again later.";
      
      throw new Error(userMessage);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message || "AI Provider returned an error.");
    }
    
    return data.choices?.[0]?.message?.content || "No content generated.";
  } catch (error: any) {
    console.error("OpenRouter Generation Error:", error);
    throw new Error(error.message || "Failed to generate AI content.");
  }
};

export const chatWithPdf = async (contextText: string, userQuestion: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    return "Configuration Error: API Key is missing. Please check your settings.";
  }

  const systemPrompt = "You are an intelligent PDF assistant. You have access to the content of one or more documents.";

  // Increased context limit to 100,000 characters to support multiple PDFs
  const context = contextText.substring(0, 100000);
  const userPrompt = `Documents Content:\n${context}\n\nUser Request: ${userQuestion}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false // Explicitly disable streaming
      })
    });

    if (!response.ok) {
      if (response.status === 401) return "Access Denied: Invalid API Key. Please check your configuration.";
      if (response.status === 402) return "Service Error: Insufficient AI credits.";
      return "I'm having trouble connecting to the AI service right now. Please try again.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("OpenRouter Chat Error:", error);
    return "Connection Error: Unable to reach the AI service.";
  }
};
