
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance: GoogleGenerativeAI | null = null;

const getAiClient = () => {
  if (genAIInstance) return genAIInstance;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  genAIInstance = new GoogleGenerativeAI(apiKey);
  return genAIInstance;
};

// Official model names for 1.5 versions
const PRO_MODEL = "gemini-1.5-pro";
const FLASH_MODEL = "gemini-1.5-flash";

export const generateDocumentContent = async (topic: string, type: 'report' | 'essay' | 'summary'): Promise<string> => {
  try {
    const genAI = getAiClient();
    const model = genAI.getGenerativeModel({
      model: FLASH_MODEL,
      systemInstruction: `You are a professional document writer. Write a high-quality ${type} about: ${topic}. Structure with Title, Intro, Points, and Conclusion. Plain text only.`
    });

    const result = await model.generateContent(`Write a comprehensive ${type} about the following topic: ${topic}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate AI content.");
  }
};

export const chatWithPdf = async (pdfText: string, userQuestion: string): Promise<string> => {
  try {
    const genAI = getAiClient();
    const model = genAI.getGenerativeModel({
      model: PRO_MODEL,
      systemInstruction: "You are a helpful document assistant. Answer the user's question based ONLY on the provided text from the PDF. If the answer isn't there, say you don't know."
    });

    const prompt = `Context from PDF: \n\n ${pdfText.substring(0, 30000)} \n\n Question: ${userQuestion}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return `AI Assistant Error: ${error.message || "Could not reach Gemini service."}`;
  }
};

export const convertToMarkdown = async (pdfText: string): Promise<string> => {
  try {
    const genAI = getAiClient();
    const model = genAI.getGenerativeModel({
      model: FLASH_MODEL,
      systemInstruction: "You are an expert at document structure. Convert text to clean, semantic Markdown with proper headers and lists."
    });

    const result = await model.generateContent(`Convert this extracted PDF text into structured Markdown: \n\n ${pdfText.substring(0, 20000)}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Markdown Error:", error);
    return "AI-assisted Markdown conversion failed. Please try again later.";
  }
};

export const scoreResume = async (resumeText: string): Promise<string> => {
  try {
    const genAI = getAiClient();
    const model = genAI.getGenerativeModel({
      model: PRO_MODEL,
      systemInstruction: "You are a highly critical HR Manager and ATS Optimizer. Provide an objective score and harsh but helpful feedback."
    });

    const result = await model.generateContent(`Analyze this resume: \n\n ${resumeText.substring(0, 15000)}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini CV Analysis Error:", error);
    return "Resume analysis failed. Please check your document and try again.";
  }
};

export const translatePdfText = async (text: string, targetLang: string): Promise<string> => {
  try {
    const genAI = getAiClient();
    const model = genAI.getGenerativeModel({
      model: PRO_MODEL,
      systemInstruction: `You are a professional literary translator. Translate content into ${targetLang} accurately while preserving industry-specific terminology.`
    });

    const result = await model.generateContent(`Translate the following to ${targetLang}: \n\n ${text.substring(0, 15000)}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    return `Translation to ${targetLang} failed.`;
  }
};
