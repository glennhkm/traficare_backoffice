import { supabaseAdmin } from "@/lib/supabaseAdmin";
import StatCard from "@/components/admin/StatCard";
import ChatHistoryClient from "./ChatHistoryClient";

export const dynamic = "force-dynamic";

async function getChatRoomsWithStats() {
  // Fetch all chat rooms
  const { data: rooms } = await supabaseAdmin
    .from("chat_rooms")
    .select("id, student_id, student_nis, status, created_at, updated_at, last_message_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (!rooms || rooms.length === 0) return { rooms: [], messageCounts: {}, studentNames: {} };

  // Fetch message counts per room
  const { data: messageCounts } = await supabaseAdmin
    .from("chat_messages")
    .select("room_id");

  const countMap: Record<string, number> = {};
  (messageCounts ?? []).forEach((m: any) => {
    countMap[m.room_id] = (countMap[m.room_id] ?? 0) + 1;
  });

  // Fetch student names by NIS
  const nisSet = [...new Set(rooms.map((r: any) => r.student_nis))];
  const { data: students } = await supabaseAdmin
    .from("students")
    .select("nis, nama")
    .in("nis", nisSet);

  const studentNames: Record<string, string> = {};
  (students ?? []).forEach((s: any) => {
    studentNames[s.nis] = s.nama;
  });

  return { rooms: rooms ?? [], messageCounts: countMap, studentNames };
}

export default async function HistoryPage() {
  const { rooms, messageCounts, studentNames } = await getChatRoomsWithStats();

  const totalMessages = Object.values(messageCounts).reduce((a, b) => a + b, 0);
  const activeRooms = rooms.filter((r: any) => r.status === "active").length;
  const uniqueStudents = new Set(rooms.map((r: any) => r.student_nis)).size;

  return (
    <main className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-3xl font-semibold text-slate-900 mb-1 leading-tight font-sans">
          Riwayat Chatbot Pengguna
        </h1>
        <p className="text-slate-500 text-sm">
          Lihat riwayat percakapan antara siswa dengan chatbot Traficare.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Sesi Chat"
          value={rooms.length}
          icon="/icons/chatbot.svg"
          bgOpacity={10}
        />
        <StatCard
          label="Total Pesan"
          value={totalMessages}
          icon="/icons/overview.svg"
          bgOpacity={10}
        />
        <StatCard
          label="Siswa Aktif"
          value={uniqueStudents}
          icon="/icons/member-list.svg"
          bgOpacity={10}
        />
      </div>

      {/* Chat History Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <img src="/icons/chatbot.svg" alt="list" style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }} className="w-6 h-6" />
            <span>Daftar Sesi Chat ({rooms.length})</span>
          </h2>
        </div>
        <ChatHistoryClient
          rooms={rooms as any}
          messageCounts={messageCounts}
          studentNames={studentNames}
        />
      </section>
    </main>
  );
}