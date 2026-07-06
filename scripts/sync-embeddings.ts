import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values;
}

async function syncContent() {
  console.log("Clearing old content chunks...");
  await supabase.from("content_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // --- Blogs ---
  const { data: blogs } = await supabase.from("blogs").select("*").eq("published", true);
  for (const b of blogs ?? []) {
    const text = `Blog Post: ${b.title}\n${b.content}\nAuthor: ${b.author ?? "N/A"}`;
    const embedding = await embedText(text);
    const { error: insertError } = await supabase.from("content_chunks").insert({
      source_type: "blog",
      source_id: b.id,
      content: text,
      embedding,
    });
    if (insertError) {
      console.error(`Failed to embed blog "${b.title}":`, insertError.message);
    } else {
      console.log(`Embedded blog: ${b.title}`);
    }
  }

  // --- Events ---
  const { data: events } = await supabase.from("events").select("*");
  for (const e of events ?? []) {
    const text = `Event: ${e.title}\n${e.description}\nDate: ${e.event_date}\nLocation: ${e.location ?? "N/A"}\nRegistration Open: ${e.registration_open}`;
    const embedding = await embedText(text);
    const { error: insertError } = await supabase.from("content_chunks").insert({
      source_type: "event",
      source_id: e.id,
      content: text,
      embedding,
    });
    if (insertError) {
      console.error(`Failed to embed event "${e.title}":`, insertError.message);
    } else {
      console.log(`Embedded event: ${e.title}`);
    }
  }

  // --- Scholarships ---
  const { data: scholarships } = await supabase.from("scholarships").select("*").eq("published", true);
  for (const s of scholarships ?? []) {
    const text = `Scholarship: ${s.title}\n${s.description}\nCountry: ${s.country}\nFunding: ${s.funding_type}\nStudy Level: ${s.study_level}\nDeadline: ${s.deadline ?? "Not specified"}\nEligibility: ${s.eligibility ?? "N/A"}\nRequired Documents: ${s.required_documents ?? "N/A"}`;
    const embedding = await embedText(text);
    const { error: insertError } = await supabase.from("content_chunks").insert({
      source_type: "scholarship",
      source_id: s.id,
      content: text,
      embedding,
    });
    if (insertError) {
      console.error(`Failed to embed scholarship "${s.title}":`, insertError.message);
    } else {
      console.log(`Embedded scholarship: ${s.title}`);
    }
  }

  // --- Programmes ---
  const { data: programmes } = await supabase.from("programmes").select("*").eq("published", true);
  for (const p of programmes ?? []) {
    const text = `Programme: ${p.title}\n${p.description}\nCategory: ${p.category}`;
    const embedding = await embedText(text);
    const { error: insertError } = await supabase.from("content_chunks").insert({
      source_type: "programme",
      source_id: p.id,
      content: text,
      embedding,
    });
    if (insertError) {
      console.error(`Failed to embed programme "${p.title}":`, insertError.message);
    } else {
      console.log(`Embedded programme: ${p.title}`);
    }
  }

  console.log("Sync complete!");
}

syncContent();