import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createGuideAction,
  updateGuideAction,
  deleteGuideAction,
} from "./actions";
import GuidesListClient from "./GuidesListClient";

export const dynamic = "force-dynamic";

async function getGuides() {
  const { data } = await supabaseAdmin
    .from("guides")
    .select(
      "id, category, title, description, youtube_url, youtube_embed_url, article_html, published, created_at"
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function GuidesPage() {
  const guides = await getGuides();
  return (
    <main className="p-6 lg:p-8 space-y-8 overflow-x-hidden w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
            📚
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Kelola Panduan P3K
          </h1>
        </div>
        <p className="text-slate-600">
          Tambah, edit, dan kelola konten panduan Pertolongan Pertama Pada
          Kecelakaan
        </p>
      </div>

      {/* Guides List */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <span>📋</span>
            <span>Daftar Panduan ({guides.length})</span>
          </h2>
        </div>
        <GuidesListClient
          guides={guides as any}
          createAction={createGuideAction}
          updateAction={updateGuideAction}
          deleteAction={deleteGuideAction}
        />
      </section>
    </main>
  );
}
