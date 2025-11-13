
import { GoogleGenAI } from "@google/genai";
import { type GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChatResponse = async (prompt: string, productContext: string): Promise<{ text: string, sources: GroundingChunk[] | undefined }> => {
  try {
    const fullPrompt = `Based on the following product context, answer the user's question. If the question is not about the product, use your general knowledge and the web.
---
PRODUCT CONTEXT:
${productContext}
---
USER QUESTION:
${prompt}
---
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text, sources };

  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
