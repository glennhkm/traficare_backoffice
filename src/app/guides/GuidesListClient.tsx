"use client";

import { useMemo, useState, FormEvent, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Guide = {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  pdf_url?: string | null;
  published: boolean;
  created_at: string;
};

export default function GuidesListClient({
  guides,
  createAction,
  updateAction,
  deleteAction,
}: {
  guides: Guide[];
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const onDelete = async (id: string) => {
    if (!confirm("Hapus panduan ini?")) return;
    const fd = new FormData();
    fd.append("id", id);
  const p = deleteAction(fd);
  await toast.promise(p, {
      loading: "Menghapus...",
      success: "Panduan dihapus",
      error: "Gagal menghapus",
    });
  router.refresh();
  };

  return (
    <div className="divide-y divide-slate-200 w-full max-w-full overflow-x-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">Kelola panduan P3K sekolah Anda</div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          onClick={() => setOpenCreate(true)}
        >
          <span>➕</span>
          <span>Tambah Panduan</span>
        </button>
      </div>

      {guides.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-xl font-medium text-slate-600 mb-2">Belum ada panduan</div>
          <div className="text-slate-500">Mulai dengan menambahkan panduan pertama Anda</div>
        </div>
      ) : (
        guides.map((g) => (
          <div key={g.id} className="flex items-start justify-between p-4 w-full">
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge category={g.category} />
                <span className={`text-xs px-2 py-0.5 rounded-full border ${g.published ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                  {g.published ? "Dipublikasi" : "Draft"}
                </span>
              </div>
              <div className="font-medium text-slate-800 truncate max-w-full">{g.title}</div>
              {g.description && (
                <div className="text-sm text-slate-600 whitespace-normal break-words break-all max-w-full overflow-hidden">
                  {g.description}
                </div>
              )}
              {g.pdf_url && (
                <div className="mt-2">
                  <a
                    href={g.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                  >
                    📄 Lihat PDF
                  </a>
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1">Dibuat: {new Date(g.created_at).toISOString().split("T")[0]}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="px-3 py-1.5 rounded-lg border text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={() => setOpenId(g.id)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border text-red-700 border-red-300 hover:bg-red-50"
                onClick={() => onDelete(g.id)}
              >
                Hapus
              </button>
            </div>

            {openId === g.id && (
              <EditModal guide={g} onClose={() => setOpenId(null)} onSubmit={async (fd) => {
                await updateAction(fd);
                router.refresh();
              }} />
            )}
          </div>
        ))
      )}

      {openCreate && (
        <CreateModal
          onClose={() => setOpenCreate(false)}
          onSubmit={async (fd) => {
            await createAction(fd);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Badge({ category }: { category: string }) {
  const map: Record<string, string> = {
    evakuasi: "bg-red-100 text-red-800 border-red-200",
    luka: "bg-orange-100 text-orange-800 border-orange-200",
    fraktur: "bg-purple-100 text-purple-800 border-purple-200",
    sinkop: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const label: Record<string, string> = {
    evakuasi: "Evakuasi",
    luka: "Luka & Pendarahan",
    fraktur: "Fraktur",
    sinkop: "Sinkop",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${map[category] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {label[category] || category}
    </span>
  );
}

function CreateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (fd: FormData) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await toast.promise(onSubmit(fd), {
        loading: "Menyimpan...",
        success: "Panduan dibuat",
        error: "Gagal menyimpan",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 h-[80%] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-slate-800">Tambah Panduan</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kategori</label>
                <select name="category" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="evakuasi">Evakuasi</option>
                  <option value="luka">Luka & Pendarahan</option>
                  <option value="fraktur">Fraktur</option>
                  <option value="sinkop">Sinkop</option>
                </select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                <input name="description" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">YouTube URL</label>
                <input name="youtube_url" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Link PDF (Google Drive)</label>
                <input
                  name="pdf_url"
                  required
                  inputMode="url"
                  pattern="https://.*"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                />
                <p className="text-xs text-slate-500">Gunakan tautan aman dari Google Drive (file PDF). Contoh: https://drive.google.com/file/d/&lt;FILE_ID&gt;/view</p>
              </div>

              <div className="lg:col-span-2 pt-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <input type="checkbox" name="published" defaultChecked className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  Publikasikan setelah disimpan
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ guide, onClose, onSubmit }: { guide: Guide; onClose: () => void; onSubmit: (fd: FormData) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await toast.promise(onSubmit(fd), {
        loading: "Menyimpan...",
        success: "Panduan diperbarui",
        error: "Gagal menyimpan",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-slate-800">Update Panduan</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 grid gap-4 lg:grid-cols-2">
              <input type="hidden" name="id" defaultValue={guide.id} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kategori</label>
                <select name="category" defaultValue={guide.category} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="evakuasi">Evakuasi</option>
                  <option value="luka">Luka & Pendarahan</option>
                  <option value="fraktur">Fraktur</option>
                  <option value="sinkop">Sinkop</option>
                </select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                <input name="description" defaultValue={guide.description ?? ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">YouTube URL</label>
                <input name="youtube_url" defaultValue={guide.youtube_url ?? ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Link PDF (Google Drive)</label>
                <input
                  name="pdf_url"
                  inputMode="url"
                  pattern="https://.*"
                  defaultValue={guide.pdf_url ?? ""}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                />
                <p className="text-xs text-red-500">* Pastikan file berupa PDF dan disimpan di google drive.</p>
              </div>

              <div className="lg:col-span-2 pt-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <input type="checkbox" name="published" defaultChecked={guide.published} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  Publikasikan
                </label>

                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
