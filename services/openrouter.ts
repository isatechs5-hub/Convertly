
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = window.location.origin;
const SITE_NAME = "OmniPDF AI";
const MODEL = "meta-llama/llama-3.1-405b-instruct:free";

const getHeaders = () => ({
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": SITE_URL,
  "X-Title": SITE_NAME,
  "Content-Type": "application/json"
});

export const generateDocumentContent = async (enhancedPrompt: string, type: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }

  const systemPrompt = `You are a world-class professional document writer and editor. Your task is to write a high-quality, professionally formatted ${type}. 
  Follow all specific constraints (Tone, Language, Citation Style, Length) strictly. 
  Output valid Markdown formatting for headers, lists, and tables. 
  Do not include conversational filler like "Here is your report" - just output the document content directly.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No content generated.";
  } catch (error: any) {
    console.error("OpenRouter Generation Error:", error);
    throw new Error(error.message || "Failed to generate AI content.");
  }
};

export const chatWithPdf = async (contextText: string, userQuestion: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }

  const systemPrompt = "You are an intelligent PDF assistant. You have access to the content of one or more documents. specific instructions about persona, language, or output format (like creating quizzes or tables).";

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
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    console.error("OpenRouter Chat Error:", error);
    return `AI Assistant Error: ${error.message || "Could not reach AI service."}`;
  }
};
