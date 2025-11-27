import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing API_KEY in environment variables.");
}

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private modelId: string = "gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY || '' });
  }

  public initializeChat(systemInstruction?: string) {
    try {
      this.chatSession = this.ai.chats.create({
        model: this.modelId,
        config: {
          systemInstruction: systemInstruction || "You are a helpful, intelligent, and articulate NLP assistant. You are capable of complex reasoning, coding tasks, and maintaining long, multi-turn conversations with context awareness.",
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      return false;
    }
  }

  public async sendMessageStream(
    message: string, 
    onChunk: (text: string) => void
  ): Promise<string> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    let fullText = "";

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        const text = responseChunk.text;
        if (text) {
          fullText += text;
          onChunk(fullText);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }

    return fullText;
  }
}

export const geminiService = new GeminiService();