"use client";

import { useMemo, useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {Eye, Edit2, Trash2, Plus} from "lucide-react";

type Guide = {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  youtube_embed_url?: string | null;
  pdf_url?: string | null;
  published: boolean;
  created_at: string;
};

// Safely convert a Google Drive file URL to an embeddable preview URL
function toGoogleDriveEmbed(url?: string | null): string | null {
  if (!url) return null;
  let u: URL | null = null;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!u) return null;
  const host = u.hostname;
  if (!/\.google\.(com|[a-z]{2,6})$/.test(host) && host !== "google.com" && host !== "drive.google.com") {
    return null;
  }

  let id: string | null = null;
  const pathMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) id = pathMatch[1];
  if (!id) id = u.searchParams.get("id");

  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

// Convert a YouTube URL to an embed URL
function toYouTubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch { }
  return null;
}

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
  const [previewGuide, setPreviewGuide] = useState<Guide | null>(null);

  const existingCategories = useMemo(() => {
    return new Set(guides.map(g => g.category));
  }, [guides]);

  const allCategories = ["evakuasi", "luka", "fraktur", "sinkop"];
  const isCreateDisabled = existingCategories.size >= allCategories.length;

  const onDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus panduan ini?")) return;
    const fd = new FormData();
    fd.append("id", id);
    const p = deleteAction(fd);
    await toast.promise(p, {
      loading: "Menghapus...",
      success: "Panduan berhasil dihapus",
      error: "Gagal menghapus panduan",
    });
    router.refresh();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-6 space-y-6">
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Status Kelola Kategori</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {isCreateDisabled
              ? "Semua 4 kategori panduan P3K telah terisi sepenuhnya."
              : `Tersisa ${allCategories.length - existingCategories.size} kategori yang dapat ditambahkan.`}
          </p>
        </div>

        <button
          disabled={isCreateDisabled}
          onClick={() => setOpenCreate(true)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${isCreateDisabled
              ? "bg-slate-200/70 border border-slate-300 text-slate-400 cursor-not-allowed"
              : "bg-[#0066A5] text-white hover:bg-[#0066A5]/95 shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/15"
            }`}
        >
          {/* <span>➕</span> */}
          <Plus className="h-4 w-4" />
          <span>Tambah Panduan</span>
        </button>
      </div>

      {guides.length === 0 ? (
        <div className="p-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300/80">
          <div className="text-6xl mb-4">📚</div>
          <h4 className="text-lg font-medium text-slate-700 mb-1">Belum Ada Panduan</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Mulai dengan menambahkan panduan pertama Anda untuk membekali edukasi siswa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((g) => {
            const videoCount = (g.youtube_url || "").split(",").map(x => x.trim()).filter(Boolean).length;
            const pdfCount = (g.pdf_url || "").split(",").map(x => x.trim()).filter(Boolean).length;

            return (
              <div
                key={g.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge category={g.category} />
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${g.published ? "bg-green-50 text-green-700 border-green-200/60" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {g.published ? "🟢 Dipublikasi" : "⚪ Draft"}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 mb-2 leading-snug">{g.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                    {g.description || "Tidak ada deskripsi."}
                  </p>

                  <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                    <div className="flex items-center text-sm font-semibold text-slate-600">
                      <span className="mr-2 text-base">📹</span>
                      <span className="text-slate-800 font-medium">{videoCount}</span>&nbsp;Video Panduan
                    </div>
                    <div className="flex items-center text-sm font-semibold text-slate-600">
                      <span className="mr-2 text-base">📄</span>
                      <span className="text-slate-800 font-medium">{pdfCount}</span>&nbsp;Dokumen PDF / Google Drive
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setPreviewGuide(g)}
                    className="flex-1 py-2.5 px-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" /> 
                    Pratinjau
                  </button>
                  <button
                    onClick={() => setOpenId(g.id)}
                    className="flex-1 py-2.5 px-3 bg-[#0066A5]/80 hover:bg-[#0066A5] text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(g.id)}
                    className="py-2.5 px-3 bg-red-500 hover:bg-red-600 text-red-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center"
                    title="Hapus Panduan"
                  >
                    <Trash2 className="text-white h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popups & Modals */}
      {previewGuide && (
        <PreviewModal guide={previewGuide} onClose={() => setPreviewGuide(null)} />
      )}

      {openId && (
        <EditModal
          guide={guides.find(g => g.id === openId)!}
          onClose={() => setOpenId(null)}
          onSubmit={async (fd) => {
            await updateAction(fd);
            router.refresh();
          }}
        />
      )}

      {openCreate && (
        <CreateModal
          guides={guides}
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
    evakuasi: "bg-rose-50 text-rose-700 border-rose-200/60",
    luka: "bg-amber-50 text-amber-700 border-amber-200/60",
    fraktur: "bg-purple-50 text-purple-700 border-purple-200/60",
    sinkop: "bg-sky-50 text-sky-700 border-sky-200/60",
  };
  const label: Record<string, string> = {
    evakuasi: "Evakuasi",
    luka: "Luka & Pendarahan",
    fraktur: "Fraktur",
    sinkop: "Sinkop",
  };
  return (
    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${map[category] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
      {label[category] || category}
    </span>
  );
}

function PreviewModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"video" | "pdf">("video");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activePdfIndex, setActivePdfIndex] = useState(0);

  const videos = useMemo(() => (guide.youtube_url || "").split(",").map(x => x.trim()).filter(Boolean), [guide.youtube_url]);
  const pdfs = useMemo(() => (guide.pdf_url || "").split(",").map(x => x.trim()).filter(Boolean), [guide.pdf_url]);

  useEffect(() => {
    if (videos.length === 0 && pdfs.length > 0) {
      setActiveTab("pdf");
    }
  }, [videos, pdfs]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge category={guide.category} />
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${guide.published ? "bg-green-50 text-green-700 border-green-200/60" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {guide.published ? "Dipublikasi" : "Draft"}
                </span>
              </div>
              <h3 className="font-medium text-lg text-slate-900 leading-tight">Pratinjau: {guide.title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-semibold transition-all">✕</button>
          </div>

          {/* Description summary */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{guide.description || "Tidak ada deskripsi."}</p>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-slate-100 shrink-0 bg-white">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex-1 py-3.5 text-center text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === "video"
                  ? "border-[#0066A5] text-[#0066A5]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              <span>📹</span> Video Panduan ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`flex-1 py-3.5 text-center text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === "pdf"
                  ? "border-[#0066A5] text-[#0066A5]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              <span>📄</span> Dokumen PDF ({pdfs.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
            {activeTab === "video" && (
              <div className="h-full flex flex-col">
                {videos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                    <span className="text-5xl mb-3">📹</span>
                    <p className="text-sm font-semibold">Belum ada video panduan</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col space-y-4">
                    {/* Video Selector Tabs if multiple */}
                    {videos.length > 1 && (
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {videos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveVideoIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeVideoIndex === idx
                                ? "bg-[#0066A5] text-white border-transparent"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            Video {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Video Player */}
                    {(() => {
                      const videoUrl = videos[activeVideoIndex];
                      const embedUrl = toYouTubeEmbed(videoUrl);
                      return embedUrl ? (
                        <div className="flex-1 aspect-video rounded-xl overflow-hidden shadow-md bg-black max-h-[450px]">
                          <iframe
                            src={embedUrl}
                            title={`Video Panduan ${activeVideoIndex + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white p-8 text-center text-slate-500">
                          <span className="text-3xl mb-2">⚠️</span>
                          <p className="text-sm font-medium">Link Youtube tidak valid</p>
                          <p className="text-sm text-slate-400 mt-1">{videoUrl}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="h-full flex flex-col">
                {pdfs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                    <span className="text-5xl mb-3">📄</span>
                    <p className="text-sm font-semibold">Belum ada dokumen PDF</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col space-y-4">
                    {/* PDF Selector Tabs if multiple */}
                    {pdfs.length > 1 && (
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {pdfs.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePdfIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activePdfIndex === idx
                                ? "bg-[#0066A5] text-white border-transparent"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            Dokumen {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active PDF Viewer */}
                    {(() => {
                      const pdfUrl = pdfs[activePdfIndex];
                      const embedUrl = toGoogleDriveEmbed(pdfUrl);
                      return embedUrl ? (
                        <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white min-h-[400px]">
                          <iframe
                            src={embedUrl}
                            title={`Dokumen PDF ${activePdfIndex + 1}`}
                            className="w-full h-full"
                            allow="fullscreen"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white p-8 text-center text-slate-500">
                          <span className="text-3xl mb-2">⚠️</span>
                          <p className="text-sm font-medium">Link PDF/Google Drive tidak valid</p>
                          <p className="text-sm text-slate-400 mt-1">{pdfUrl}</p>
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm text-blue-600 hover:underline">Buka tautan secara langsung</a>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ guides, onClose, onSubmit }: { guides: Guide[]; onClose: () => void; onSubmit: (fd: FormData) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([""]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([""]);

  const allCategories = ["evakuasi", "luka", "fraktur", "sinkop"];
  const availableCategories = allCategories.filter(cat => !guides.some(g => g.category === cat));

  const handleAddYoutube = () => setYoutubeUrls([...youtubeUrls, ""]);
  const handleRemoveYoutube = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, idx) => idx !== index));
  };
  const handleYoutubeChange = (index: number, val: string) => {
    const updated = [...youtubeUrls];
    updated[index] = val;
    setYoutubeUrls(updated);
  };

  const handleAddPdf = () => setPdfUrls([...pdfUrls, ""]);
  const handleRemovePdf = (index: number) => {
    setPdfUrls(pdfUrls.filter((_, idx) => idx !== index));
  };
  const handlePdfChange = (index: number, val: string) => {
    const updated = [...pdfUrls];
    updated[index] = val;
    setPdfUrls(updated);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Clean and join urls with comma
    const cleanYoutube = youtubeUrls.map(x => x.trim()).filter(Boolean).join(",");
    const cleanPdf = pdfUrls.map(x => x.trim()).filter(Boolean).join(",");

    fd.set("youtube_url", cleanYoutube);
    fd.set("pdf_url", cleanPdf);

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
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
            <h3 className="font-medium text-slate-800 text-lg">Tambah Panduan</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-semibold transition-all">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="grid gap-6">

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <select name="category" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "evakuasi" ? "Evakuasi" : cat === "luka" ? "Luka & Pendarahan" : cat === "fraktur" ? "Fraktur" : "Sinkop"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Judul Panduan</label>
                <input name="title" required className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Contoh: Penanganan Luka Bakar Ringan" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
                <textarea name="description" required rows={3} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none" placeholder="Tuliskan petunjuk ringkas atau pengantar materi..." />
              </div>

              {/* Dynamic YouTube URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Link YouTube Video</label>
                  <button
                    type="button"
                    onClick={handleAddYoutube}
                    className="text-sm font-medium text-[#0066A5] hover:underline flex items-center gap-1"
                  >
                    <span>➕</span> Tambah Video
                  </button>
                </div>
                <div className="space-y-2.5">
                  {youtubeUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleYoutubeChange(idx, e.target.value)}
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {youtubeUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveYoutube(idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all shrink-0"
                          title="Hapus link ini"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic PDF URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Link PDF (Google Drive)</label>
                  <button
                    type="button"
                    onClick={handleAddPdf}
                    className="text-sm font-medium text-[#0066A5] hover:underline flex items-center gap-1"
                  >
                    <span>➕</span> Tambah PDF
                  </button>
                </div>
                <div className="space-y-2.5">
                  {pdfUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handlePdfChange(idx, e.target.value)}
                        required={idx === 0}
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                      />
                      {pdfUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all shrink-0"
                          title="Hapus link ini"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan tautan aman dari Google Drive (file PDF). Contoh: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">https://drive.google.com/file/d/FILE_ID/view</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2.5 select-none cursor-pointer">
                  <input type="checkbox" name="published" defaultChecked className="w-4.5 h-4.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  Publikasikan secara langsung
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border font-semibold text-sm hover:bg-slate-50 transition-all">Batal</button>
                  <button disabled={submitting} type="submit" className="px-5 py-2.5 rounded-xl bg-[#0066A5] text-white hover:bg-[#0066A5]/95 font-semibold text-sm transition-all shadow-md shadow-blue-600/10">
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
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);

  useEffect(() => {
    const listYt = (guide.youtube_url || "").split(",").map(x => x.trim()).filter(Boolean);
    setYoutubeUrls(listYt.length > 0 ? listYt : [""]);

    const listPdf = (guide.pdf_url || "").split(",").map(x => x.trim()).filter(Boolean);
    setPdfUrls(listPdf.length > 0 ? listPdf : [""]);
  }, [guide]);

  const handleAddYoutube = () => setYoutubeUrls([...youtubeUrls, ""]);
  const handleRemoveYoutube = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, idx) => idx !== index));
  };
  const handleYoutubeChange = (index: number, val: string) => {
    const updated = [...youtubeUrls];
    updated[index] = val;
    setYoutubeUrls(updated);
  };

  const handleAddPdf = () => setPdfUrls([...pdfUrls, ""]);
  const handleRemovePdf = (index: number) => {
    setPdfUrls(pdfUrls.filter((_, idx) => idx !== index));
  };
  const handlePdfChange = (index: number, val: string) => {
    const updated = [...pdfUrls];
    updated[index] = val;
    setPdfUrls(updated);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Clean and join urls with comma
    const cleanYoutube = youtubeUrls.map(x => x.trim()).filter(Boolean).join(",");
    const cleanPdf = pdfUrls.map(x => x.trim()).filter(Boolean).join(",");

    fd.set("youtube_url", cleanYoutube);
    fd.set("pdf_url", cleanPdf);

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
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
            <h3 className="font-medium text-slate-800 text-lg">Update Panduan</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-semibold transition-all">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <input type="hidden" name="id" defaultValue={guide.id} />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <select name="category" defaultValue={guide.category} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white">
                  <option value="evakuasi">Evakuasi</option>
                  <option value="luka">Luka & Pendarahan</option>
                  <option value="fraktur">Fraktur</option>
                  <option value="sinkop">Sinkop</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Judul Panduan</label>
                <input name="title" required defaultValue={guide.title} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
                <textarea name="description" required rows={3} defaultValue={guide.description ?? ""} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none" />
              </div>

              {/* Dynamic YouTube URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Link YouTube Video</label>
                  <button
                    type="button"
                    onClick={handleAddYoutube}
                    className="text-sm font-medium text-[#0066A5] hover:underline flex items-center gap-1"
                  >
                    <span>➕</span> Tambah Video
                  </button>
                </div>
                <div className="space-y-2.5">
                  {youtubeUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleYoutubeChange(idx, e.target.value)}
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {youtubeUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveYoutube(idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all shrink-0"
                          title="Hapus link ini"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic PDF URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Link PDF (Google Drive)</label>
                  <button
                    type="button"
                    onClick={handleAddPdf}
                    className="text-sm font-medium text-[#0066A5] hover:underline flex items-center gap-1"
                  >
                    <span>➕</span> Tambah PDF
                  </button>
                </div>
                <div className="space-y-2.5">
                  {pdfUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handlePdfChange(idx, e.target.value)}
                        required={idx === 0}
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                      />
                      {pdfUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all shrink-0"
                          title="Hapus link ini"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan tautan aman dari Google Drive (file PDF). Contoh: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">https://drive.google.com/file/d/FILE_ID/view</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2.5 select-none cursor-pointer">
                  <input type="checkbox" name="published" defaultChecked={guide.published} className="w-4.5 h-4.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  Publikasikan secara langsung
                </label>
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border font-semibold text-sm hover:bg-slate-50 transition-all">Batal</button>
                  <button disabled={submitting} type="submit" className="px-5 py-2.5 rounded-xl bg-[#0066A5] text-white hover:bg-[#0066A5]/95 font-semibold text-sm transition-all shadow-md shadow-blue-600/10">
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
