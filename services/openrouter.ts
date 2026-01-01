import { OpenRouter } from "@openrouter/sdk";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = window.location.origin;
const SITE_NAME = "OmniPDF AI";
const MODEL = "kwaipilot/kat-coder-pro:free";

// Initialize OpenRouter SDK
const openrouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

/**
 * Helper function to handle chat requests using OpenRouter SDK
 * Accumulates streaming response into a single string for compatibility
 */
const performChatRequest = async (messages: any[]): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }

  try {
    const stream = await openrouter.chat.send({
      model: MODEL,
      messages: messages,
      stream: true, // Using streaming as requested by user pattern
      // @ts-ignore - SDK types might not fully cover extra headers yet, but OpenRouter supports them
      extraHeaders: {
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
      }
    });

    let fullContent = "";
    
    // Iterate over the stream to collect the full response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
      }
    }

    if (!fullContent) {
      throw new Error("No content generated from AI service.");
    }

    return fullContent;

  } catch (error: any) {
    console.error("OpenRouter Service Error:", error);
    
    // Enhanced error handling for user feedback
    let userMessage = "The AI service is currently unavailable.";
    
    // Check for common error patterns in the error object or message
    if (error.status === 401 || error.message?.includes("401") || error.message?.includes("key")) {
      userMessage = "Authentication failed. Please verify your API Key.";
    } else if (error.status === 402 || error.message?.includes("402") || error.message?.includes("credit")) {
      userMessage = "Insufficient credits in your AI account.";
    } else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("rate limit")) {
      userMessage = "Rate limit exceeded. Please try again later.";
    }
    
    throw new Error(userMessage);
  }
};

// Force non-streaming response as components expect full text
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

  // Increased context limit to 100,000 characters to support multiple PDFs
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
