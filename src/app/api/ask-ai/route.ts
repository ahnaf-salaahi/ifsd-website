import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText, askGemini } from "@/lib/gemini";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "A question is required" }, { status: 400 });
    }

    // 1. Turn the question into an embedding
    const questionEmbedding = await embedText(question);

    // 2. Search for the most relevant content chunks
    const { data: matches, error } = await supabase.rpc("match_content", {
      query_embedding: questionEmbedding,
      match_count: 5,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        answer: "I don't have information about that yet. Please contact us directly for details.",
      });
    }

    // 3. Combine the matched content into context
    const context = matches.map((m: any) => m.content).join("\n\n---\n\n");

    // 4. Ask Gemini to answer using only that context
    const answer = await askGemini(question, context);

    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}