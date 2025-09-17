"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createGuideAction(formData: FormData) {
  const category = formData.get("category") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const youtube_url = (formData.get("youtube_url") as string)?.trim();
  const pdf_url_raw = (formData.get("pdf_url") as string)?.trim();
  const pdf_url = normalizeDrivePdfUrl(pdf_url_raw); // reuse column pdf_url to store the PDF link
  const published = formData.get("published") === "on";
  const youtube_embed_url = toEmbed(youtube_url);
  await supabaseAdmin.from("guides").insert({
    category,
    title,
    description,
    youtube_url,
    youtube_embed_url,
    pdf_url,
    published,
  });
}

export async function updateGuideAction(formData: FormData) {
  const id = formData.get("id") as string;
  const payload: any = {
    category: formData.get("category") as string,
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim(),
    youtube_url: (formData.get("youtube_url") as string)?.trim(),
    pdf_url: normalizeDrivePdfUrl((formData.get("pdf_url") as string)?.trim()),
    published: formData.get("published") === "on",
  };
  payload.youtube_embed_url = toEmbed(payload.youtube_url);
  await supabaseAdmin.from("guides").update(payload).eq("id", id);
}

export async function deleteGuideAction(formData: FormData) {
  const id = formData.get("id") as string;
  await supabaseAdmin.from("guides").delete().eq("id", id);
}

function toEmbed(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be"))
      return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    if (u.hostname.includes("youtube.com"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
  } catch {}
  return null;
}

// Normalize Google Drive links to a safe, shareable PDF link
function normalizeDrivePdfUrl(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Only allow https
    if (u.protocol !== "https:") return null;

    // Accept common Drive patterns and turn them into export=download/view links
    if (u.hostname.includes("drive.google.com")) {
      // Patterns:
      // - /file/d/<id>/view
      // - /uc?id=<id>&export=download
      // - /open?id=<id>
      const m = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const id = m?.[1] || u.searchParams.get("id");
      if (id) {
        // Use direct view link that works in browser
        return `https://drive.google.com/file/d/${id}/view?usp=sharing`;
      }
    }

    // If it's already a direct https link to a PDF somewhere else, allow it
    if (u.pathname.toLowerCase().endsWith(".pdf")) {
      return u.toString();
    }
  } catch {}
  return null;
}
