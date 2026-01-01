// import { OpenRouter } from "@openrouter/sdk"; 
// SDK removed to ensure browser compatibility via raw fetch

// Fallback to hardcoded key if env var is missing or stale
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "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";
const SITE_URL = window.location.origin;
const SITE_NAME = "OmniPDF AI";
const MODEL = "deepseek/deepseek-r1-0528:free";

/**
 * Helper function to handle chat requests using raw fetch
 * Ensures compatibility with browser environments where Node SDKs might fail
 */
const performChatRequest = async (messages: any[]): Promise<string> => {
  // Debug log to verify key presence (safety: only log length)
  console.log(`[OpenRouter] Initializing request. Key length: ${OPENROUTER_API_KEY?.length || 0}`);

  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key missing. Please check your configuration.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY.trim()}`, // Ensure no whitespace
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      
      let userMessage = "The AI service is currently unavailable.";
      if (response.status === 401) userMessage = "Authentication failed. Please verify your API Key.";
      if (response.status === 402) userMessage = "Insufficient credits in your AI account.";
      if (response.status === 429) userMessage = "Rate limit exceeded. Please try again later.";
      
      throw new Error(userMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from AI service.");
    }

    return content;

  } catch (error: any) {
    console.error("OpenRouter Service Error:", error);
    throw new Error(error.message || "Failed to connect to AI service.");
  }
};

export const generateDocumentContent = async (enhancedPrompt: string, type: string): Promise<string> => {
  const systemPrompt = `You are a world-class professional document writer and editor. Your task is to write a high-quality, professionally formatted ${type}. 
  Follow all specific constraints (Tone, Language, Citation Style, Length) strictly. 
  Output valid Markdown formatting for headers, lists, and tables. 
  Do not include conversational filler like "Here is your report" - just output the document content directly.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: enhancedPrompt }
  ];

  return performChatRequest(messages);
};

export const chatWithPdf = async (contextText: string, userQuestion: string): Promise<string> => {
  const systemPrompt = "You are an intelligent PDF assistant. You have access to the content of one or more documents.";

  // Context limit
  const context = contextText.substring(0, 100000);
  const userPrompt = `Documents Content:\n${context}\n\nUser Request: ${userQuestion}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    return await performChatRequest(messages);
  } catch (error: any) {
    console.error("Chat with PDF Error:", error);
    return error.message || "I'm having trouble connecting to the AI service right now. Please try again.";
  }
};

export const convertToMarkdown = async (pdfText: string): Promise<string> => {
  const systemPrompt = "You are an expert at document structure. Convert text to clean, semantic Markdown with proper headers and lists.";
  const userPrompt = `Convert this extracted PDF text into structured Markdown: \n\n ${pdfText.substring(0, 20000)}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    return await performChatRequest(messages);
  } catch (error: any) {
    console.error("Markdown Conversion Error:", error);
    return "AI-assisted Markdown conversion failed. Please try again later.";
  }
};

export const scoreResume = async (resumeText: string): Promise<string> => {
  const systemPrompt = "You are a highly critical HR Manager and ATS Optimizer. Provide an objective score and harsh but helpful feedback.";
  const userPrompt = `Analyze this resume: \n\n ${resumeText.substring(0, 15000)}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    return await performChatRequest(messages);
  } catch (error: any) {
    console.error("CV Analysis Error:", error);
    return "Resume analysis failed. Please check your document and try again.";
  }
};

export const translatePdfText = async (text: string, targetLang: string): Promise<string> => {
  const systemPrompt = `You are a professional literary translator. Translate content into ${targetLang} accurately while preserving industry-specific terminology.`;
  const userPrompt = `Translate the following to ${targetLang}: \n\n ${text.substring(0, 15000)}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    return await performChatRequest(messages);
  } catch (error: any) {
    console.error("Translation Error:", error);
    return `Translation to ${targetLang} failed.`;
  }
};
