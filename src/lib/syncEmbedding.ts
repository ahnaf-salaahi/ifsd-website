export async function syncEmbedding(
  sourceType: "blog" | "event" | "scholarship" | "programme",
  sourceId: string,
  content: string
) {
  try {
    await fetch("/api/embed-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType, sourceId, content }),
    });
  } catch (err) {
    // Silent fail — we don't want AI-sync issues to block the admin's actual save
    console.error("Embedding sync failed:", err);
  }
}

export async function deleteEmbedding(
  sourceType: "blog" | "event" | "scholarship" | "programme",
  sourceId: string
) {
  try {
    await fetch("/api/embed-content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType, sourceId }),
    });
  } catch (err) {
    console.error("Embedding delete failed:", err);
  }
}