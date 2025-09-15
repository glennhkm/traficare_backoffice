import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const { data: students } = await supabaseAdmin
    .from("students")
    .select("nis, nama, umur, jenis_kelamin, asal_sekolah, domisili, created_at")
    .order("created_at", { ascending: false });

  // counts per student
  const { data: allViews } = await supabaseAdmin
    .from("guide_views")
    .select("student_nis");
  const counts = new Map<string, number>();
  (allViews ?? []).forEach((r: any) => counts.set(r.student_nis, (counts.get(r.student_nis) ?? 0) + 1));

  return (
    <main className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
            👥
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Daftar Siswa</h1>
        </div>
        <p className="text-slate-600">Kelola data siswa yang telah mendaftar pada platform Traficare</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{students?.length || 0}</p>
              <p className="text-sm text-slate-600">Total Siswa</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              📖
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{Array.from(counts.values()).reduce((a, b) => a + b, 0)}</p>
              <p className="text-sm text-slate-600">Total Akses Panduan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🏫
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {new Set(students?.map(s => s.asal_sekolah)).size || 0}
              </p>
              <p className="text-sm text-slate-600">Sekolah Terdaftar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <span>📋</span>
            <span>Data Siswa ({students?.length || 0})</span>
          </h2>
        </div>
        
        <div className="overflow-auto">
          {(students ?? []).length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">NIS</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Nama</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Detail</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Sekolah</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(students ?? []).map((s) => (
                  <tr key={s.nis} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{s.nis}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{s.nama}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600">
                        <div>{s.umur} tahun • {s.jenis_kelamin}</div>
                        <div className="text-slate-500">{s.domisili}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {s.asal_sekolah}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600">
                        {new Date(s.created_at as unknown as string).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-xl font-medium text-slate-600 mb-2">Belum ada siswa terdaftar</div>
              <div className="text-slate-500">Siswa akan muncul setelah mengisi biodata di frontpage</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
