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
  article_html?: string | null;
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
              <div className="text-xs text-slate-500 mt-1">Dibuat: {new Date(g.created_at).toISOString().split("T")[0]}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="px-3 py-1.5 rounded-lg border text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={() => setOpenId(g.id)}
              >
                Update
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border text-red-700 border-red-300 hover:bg-red-50"
                onClick={() => onDelete(g.id)}
              >
                Delete
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Judul</label>
                <input name="title" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                <input name="description" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">YouTube URL</label>
                <input name="youtube_url" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Artikel (HTML)</label>
                <RichTextEditor name="article_html" placeholder="Tulis artikel panduan di sini..." />
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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 h-[80%] flex flex-col">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Judul</label>
                <input name="title" defaultValue={guide.title} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
                <label className="text-sm font-medium text-slate-700">Artikel (HTML)</label>
                <RichTextEditor name="article_html" defaultValue={guide.article_html ?? ""} />
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

function RichTextEditor({ name, defaultValue = "", placeholder }: { name: string; defaultValue?: string; placeholder?: string }) {
  const [html, setHtml] = useState<string>(defaultValue || "");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<any>(null);

  // Load CKEditor 5 from CDN once
  useEffect(() => {
    let mounted = true;

    const loadScript = () =>
      new Promise<any>((resolve, reject) => {
        if ((window as any).ClassicEditor) return resolve((window as any).ClassicEditor);
        let script = document.getElementById("ckeditor5-cdn") as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = "ckeditor5-cdn";
          script.src = "https://cdn.ckeditor.com/ckeditor5/41.3.1/classic/ckeditor.js";
          script.async = true;
          script.onload = () => resolve((window as any).ClassicEditor);
          script.onerror = reject;
          document.body.appendChild(script);
        } else {
          script.onload = () => resolve((window as any).ClassicEditor);
          script.onerror = reject;
          // If it's already loaded, resolve immediately
          if ((window as any).ClassicEditor) return resolve((window as any).ClassicEditor);
        }
      });

    const init = async () => {
      try {
        const ClassicEditor = await loadScript();
        if (!mounted || !hostRef.current) return;
        const editor = await ClassicEditor.create(hostRef.current, {
          placeholder: placeholder || "Tulis di sini...",
          toolbar: [
            "heading",
            "|", 
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "bulletedList",
            "numberedList",
            "outdent",
            "indent",
            "|",
            "link",
            "blockQuote",
            "insertTable",
            "|",
            "undo",
            "redo",
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
            ]
          },
          // Apply styles to make editor content look like final output
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
              }
            ]
          }
        });
        
        editorInstanceRef.current = editor;
        if (defaultValue) editor.setData(defaultValue);
        
        editor.model.document.on("change:data", () => {
          const data = editor.getData();
          setHtml(data);
        });

        // Add custom CSS to make editor content preview realistic
        const editorElement = editor.ui.getEditableElement();
        if (editorElement) {
          editorElement.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
          editorElement.style.fontSize = '16px';
          editorElement.style.lineHeight = '1.6';
          editorElement.style.padding = '16px';
          
          // Add styles for headings and other elements
          const style = document.createElement('style');
          style.textContent = `
            .ck-editor__editable h1 {
              font-size: 2rem;
              font-weight: 700;
              margin: 1rem 0 0.5rem 0;
              color: #1f2937;
              line-height: 1.2;
            }
            .ck-editor__editable h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 1rem 0 0.5rem 0;
              color: #374151;
              line-height: 1.3;
            }
            .ck-editor__editable h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 0.75rem 0 0.5rem 0;
              color: #4b5563;
              line-height: 1.4;
            }
            .ck-editor__editable p {
              margin: 0.5rem 0;
              color: #374151;
            }
            .ck-editor__editable ul {
              padding-left: 1.5rem;
              margin: 0.5rem 0;
              list-style-type: disc;
              list-style-position: outside;
            }
            .ck-editor__editable ol {
              padding-left: 1.5rem;
              margin: 0.5rem 0;
              list-style-type: decimal;
              list-style-position: outside;
            }
            .ck-editor__editable ul ul {
              list-style-type: circle;
            }
            .ck-editor__editable ul ul ul {
              list-style-type: square;
            }
            .ck-editor__editable li {
              margin: 0.25rem 0;
              color: #374151;
              display: list-item;
            }
            .ck-editor__editable blockquote {
              border-left: 4px solid #d1d5db;
              padding-left: 1rem;
              margin: 1rem 0;
              font-style: italic;
              color: #6b7280;
            }
            .ck-editor__editable a {
              color: #2563eb;
              text-decoration: underline;
            }
            .ck-editor__editable strong {
              font-weight: 700;
            }
            .ck-editor__editable em {
              font-style: italic;
            }
          `;
          document.head.appendChild(style);
        }
      } catch (e) {
        console.error("CKEditor load/init failed", e);
      }
    };

    init();
    return () => {
      mounted = false;
      const ed = editorInstanceRef.current;
      if (ed) {
        ed.destroy().catch(() => {});
        editorInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={html} />
      <div ref={hostRef} className="min-h-[200px] border border-slate-300 rounded-lg overflow-hidden" />
    </div>
  );
}
