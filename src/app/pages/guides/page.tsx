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
      "id, category, title, description, youtube_url, youtube_embed_url, pdf_url, published, created_at"
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function GuidesPage() {
  const guides = await getGuides();
  return (
    <main className="p-6 lg:p-8 space-y-8 overflow-x-hidden w-full">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-3xl font-semibold text-slate-900 mb-1 leading-tight font-sans">
          Kelola Panduan P3K
        </h1>
        <p className="text-slate-500 text-sm">
          Tambah, edit, dan kelola konten panduan Pertolongan Pertama Pada Kecelakaan
        </p>
      </div>

      {/* Guides List */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <img src="/icons/info-guide.svg" alt="info-guide" style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }} className="w-6 h-6" />
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
