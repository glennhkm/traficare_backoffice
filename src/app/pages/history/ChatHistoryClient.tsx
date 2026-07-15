"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, MessageSquare, ChevronLeft, ChevronRight, User, Bot, Calendar, Hash } from "lucide-react";

type ChatRoom = {
  id: string;
  student_id: string | null;
  student_nis: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

type ChatMessage = {
  id: string;
  room_id: string;
  student_nis: string;
  role: string;
  message: string;
  status: string;
  created_at: string;
};

interface ChatHistoryClientProps {
  rooms: ChatRoom[];
  messageCounts: Record<string, number>;
  studentNames: Record<string, string>;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDate(dateStr);
}

function ChatDetailModal({
  room,
  studentName,
  messageCount,
  onClose,
}: {
  room: ChatRoom;
  studentName: string;
  messageCount: number;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chat-history/messages?room_id=${room.id}`);
        const data = await res.json();
        setMessages(data.messages ?? []);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [room.id]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "88vh", animation: "modalIn 0.2s ease-out" }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066A5]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#0066A5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{studentName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  NIS: {room.student_nis}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  room.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {room.status === "active" ? "Aktif" : room.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Session Meta */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex gap-5 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Mulai: <span className="font-medium text-slate-700">{formatDateTime(room.created_at)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-700">{messageCount}</span> pesan
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div
                    className="rounded-2xl bg-slate-100 animate-pulse"
                    style={{ width: `${50 + Math.random() * 30}%`, height: "56px" }}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Belum ada pesan</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user" || msg.role === "human";
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#0066A5] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-[#0066A5] text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ChatHistoryClient({
  rooms,
  messageCounts,
  studentNames,
}: ChatHistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"last_msg" | "date_desc" | "date_asc" | "msg_count">("last_msg");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const itemsPerPage = 10;

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    let result = [...rooms];

    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.student_nis.toLowerCase().includes(q) ||
          (studentNames[r.student_nis] ?? "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "last_msg") {
        const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bt - at;
      } else if (sortBy === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return (messageCounts[b.id] ?? 0) - (messageCounts[a.id] ?? 0);
      }
    });

    return result;
  }, [rooms, debouncedSearch, sortBy, filterStatus, messageCounts, studentNames]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleOpenModal = useCallback((room: ChatRoom) => setSelectedRoom(room), []);
  const handleCloseModal = useCallback(() => setSelectedRoom(null), []);

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama atau NIS siswa..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? "bg-[#0066A5] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s === "all" ? "Semua" : s === "active" ? "Aktif" : "Selesai"}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 hidden sm:block">Urutan:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 shadow-sm font-medium"
              >
                <option value="last_msg">Pesan Terakhir</option>
                <option value="date_desc">Terbaru Dibuat</option>
                <option value="date_asc">Terlama Dibuat</option>
                <option value="msg_count">Terbanyak Pesan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        {debouncedSearch && (
          <p className="text-xs text-slate-500 -mt-2 px-1">
            Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> hasil untuk &ldquo;<span className="italic">{debouncedSearch}</span>&rdquo;
          </p>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            {paginated.length > 0 ? (
              <table className="min-w-[700px] w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {/* <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-8">#</th> */}
                    <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Siswa</th>
                    <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Pesan</th>
                    <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pesan Terakhir</th>
                    <th className="py-3.5 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mulai Sesi</th>
                    <th className="py-3.5 px-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginated.map((room, idx) => {
                    const name = studentNames[room.student_nis] ?? room.student_nis;
                    const count = messageCounts[room.id] ?? 0;
                    const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr
                        key={room.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Row num */}
                        {/* <td className="py-4 px-5">
                          <span className="text-xs font-medium text-slate-400">{rowNum}</span>
                        </td> */}

                        {/* Siswa */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066A5] to-[#0091d5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm leading-tight">{name}</div>
                              <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/80 mt-0.5 inline-block">
                                {room.student_nis}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            room.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              room.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`} />
                            {room.status === "active" ? "Aktif" : "Selesai"}
                          </span>
                        </td>

                        {/* Jumlah Pesan */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              count > 0
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}>
                              <MessageSquare className="w-3 h-3" />
                              {count} pesan
                            </div>
                          </div>
                        </td>

                        {/* Pesan Terakhir */}
                        <td className="py-4 px-5">
                          <div className="text-xs text-slate-600 font-medium">{timeAgo(room.last_message_at)}</div>
                          {room.last_message_at && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(room.last_message_at)}</div>
                          )}
                        </td>

                        {/* Mulai Sesi */}
                        <td className="py-4 px-5">
                          <span className="text-xs text-slate-500 font-medium">
                            {formatDate(room.created_at)}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenModal(room)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0066A5] hover:bg-[#0055a0] text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow group-hover:scale-105 active:scale-95"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Lihat Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-[#0066A5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-[#0066A5]" />
                </div>
                <h4 className="text-base font-semibold text-slate-700 mb-1">
                  {debouncedSearch ? "Tidak ditemukan" : "Belum ada sesi chat"}
                </h4>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  {debouncedSearch
                    ? `Tidak ada sesi chat yang cocok dengan "${debouncedSearch}"`
                    : "Riwayat percakapan chatbot akan tampil di sini."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-500">
                Menampilkan{" "}
                <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span>
                {" – "}
                <span className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span>
                {" dari "}
                <span className="text-slate-800 font-bold">{filtered.length}</span> sesi
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const pages: (number | "…")[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else if (currentPage <= 3) {
                    pages.push(1, 2, 3, "…", totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, "…", totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages);
                  }
                  return pages.map((p, i) =>
                    p === "…" ? (
                      <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">···</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === p
                            ? "bg-[#0066A5] text-white"
                            : "border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Detail Modal */}
      {selectedRoom && (
        <ChatDetailModal
          room={selectedRoom}
          studentName={studentNames[selectedRoom.student_nis] ?? selectedRoom.student_nis}
          messageCount={messageCounts[selectedRoom.id] ?? 0}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
