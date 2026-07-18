import { supabaseAdmin } from "@/lib/supabaseAdmin";
import StudentsListClient from "./StudentsListClient";
import StatCard from "@/components/admin/StatCard";

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

  // Convert Map to a serializable plain object
  const countsObj = Object.fromEntries(counts.entries());

  return (
    <main className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-3xl font-semibold text-slate-900 mb-1 leading-tight font-sans">Daftar Siswa</h1>
        <p className="text-slate-500 text-sm">Kelola data siswa yang telah mendaftar pada platform Traficare</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Siswa" 
          value={students?.length || 0} 
          icon="/icons/member-list.svg" 
          bgOpacity={10} 
        />
        <StatCard 
          label="Total Akses Panduan" 
          value={Array.from(counts.values()).reduce((a, b) => a + b, 0)} 
          icon="/icons/visit.svg" 
          bgOpacity={10} 
        />
        <StatCard 
          label="Sekolah Terdaftar" 
          value={new Set(students?.map(s => s.asal_sekolah)).size || 0} 
          icon="/icons/school.svg" 
          bgOpacity={10} 
        />
      </div>

      {/* Student List Client Component */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            {/* <span>📋</span> */}
            <img className="w-6 h-6" src="/icons/member-list.svg" alt="" style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }} />
            <span>Data Siswa ({students?.length || 0})</span>
          </h2>
        </div>

        <StudentsListClient 
          students={students as any || []} 
          counts={countsObj} 
        />
      </section>
    </main>
  );
}
