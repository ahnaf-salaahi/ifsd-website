import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}

export async function askGemini(question: string, context: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a helpful assistant for "Institute for Skills Development", an organization that supports students and youth through scholarships, events, programmes, and skills training.

Answer the user's question using ONLY the information provided below. If the answer isn't in the information provided, say you don't have that information and suggest they contact the organization directly.

INFORMATION:
${context}

QUESTION:
${question}

ANSWER (be concise and direct):`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}