import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/gemini";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { sourceType, sourceId, content } = await req.json();

    if (!sourceType || !sourceId || !content) {
      return NextResponse.json(
        { error: "sourceType, sourceId, and content are required" },
        { status: 400 }
      );
    }

    const embedding = await embedText(content);

    // Remove any existing chunk for this item first (handles updates cleanly)
    await supabase
      .from("content_chunks")
      .delete()
      .eq("source_type", sourceType)
      .eq("source_id", sourceId);

    // Insert the fresh version
    const { error } = await supabase.from("content_chunks").insert({
      source_type: sourceType,
      source_id: sourceId,
      content,
      embedding,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sourceType, sourceId } = await req.json();

    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: "sourceType and sourceId are required" },
        { status: 400 }
      );
    }

    await supabase
      .from("content_chunks")
      .delete()
      .eq("source_type", sourceType)
      .eq("source_id", sourceId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}