import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import NextTopLoader from 'nextjs-toploader';
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Traficare Admin",
  description: "Manajemen konten, siswa, dan trafik untuk platform edukasi P3K",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedCookie = cookieStore.get("traficare_logged_in")?.value === "true";

  return (
    <html lang="id">
      <body className="font-sans antialiased bg-slate-50 w-full overflow-x-hidden">
        {/* NextJS TopLoader for route transitions */}
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
                   <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />

        <AuthProvider>
          <AuthGuard isPreAuthenticated={isLoggedCookie}>
            <AdminShell>
              <div className="max-w-full mx-auto w-full overflow-x-hidden">{children}</div>
            </AdminShell>
          </AuthGuard>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
