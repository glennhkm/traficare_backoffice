"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createGuideAction(formData: FormData) {
  const category = formData.get("category") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const youtube_url = (formData.get("youtube_url") as string)?.trim();
  const article_html = (formData.get("article_html") as string)?.trim();
  const published = formData.get("published") === "on";
  const youtube_embed_url = toEmbed(youtube_url);
  await supabaseAdmin
    .from("guides")
    .insert({
      category,
      title,
      description,
      youtube_url,
      youtube_embed_url,
      article_html,
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
    article_html: (formData.get("article_html") as string)?.trim(),
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
