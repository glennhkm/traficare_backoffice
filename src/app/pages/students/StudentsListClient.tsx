"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

type Student = {
  nis: string;
  nama: string;
  umur: number;
  jenis_kelamin: string;
  asal_sekolah: string;
  domisili: string;
  created_at: string;
};

interface StudentsListClientProps {
  students: Student[];
  counts: Record<string, number>;
}

export default function StudentsListClient({ students, counts }: StudentsListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "name_desc">("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search input to prevent database/computational overloading
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter and Sort students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter by search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.asal_sekolah.toLowerCase().includes(q) ||
          s.domisili.toLowerCase().includes(q)
      );
    }

    // Sort by selection
    result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "name_asc") {
        return a.nama.localeCompare(b.nama);
      } else {
        return b.nama.localeCompare(a.nama);
      }
    });

    return result;
  }, [students, debouncedSearch, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(start, start + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage]);

  return (
    <div className="space-y-6">
      {/* Controls: Search, Sort */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, asal sekolah..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <span className="text-sm font-medium text-slate-500">Urutan:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded-3xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="date_desc">Terbaru Bergabung</option>
            <option value="date_asc">Terlama Bergabung</option>
            <option value="name_asc">Nama (A-Z)</option>
            <option value="name_desc">Nama (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          {paginatedStudents.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIS</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Detail</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sekolah</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Akses</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedStudents.map((s) => {
                  const viewCount = counts[s.nis] || 0;
                  return (
                    <tr key={s.nis} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/50">{s.nis}</span>
                      </td>
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{s.nama}</div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{s.umur} Tahun</span> • <span className="capitalize">{s.jenis_kelamin}</span>
                          <div className="text-slate-400 mt-0.5">{s.domisili}</div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {s.asal_sekolah}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          viewCount > 0 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          👁️ {viewCount} Akses
                        </span>
                      </td>
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(s.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-[#0066A5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 p-4 shrink-0">
                <img 
                  src="/icons/member-list.svg" 
                  alt="" 
                  className="w-8 h-8" 
                  style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }}
                />
              </div>
              <h4 className="text-base font-semibold text-slate-700 mb-1">Siswa tidak ditemukan</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">Tidak ada data siswa yang cocok dengan pencarian "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredAndSortedStudents.length)}</span> dari <span className="text-slate-800">{filteredAndSortedStudents.length}</span> siswa
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#0066A5] text-white"
                        : "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
