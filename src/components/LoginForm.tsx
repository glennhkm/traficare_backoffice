"use client";

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Email dan password harus diisi')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast.error(error.message || 'Login gagal')
      } else {
        toast.success('Login berhasil!')
        router.push('/')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-repeat bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans"
      style={{ backgroundImage: "url('/patterns/medical-pattern.svg')" }}
    >
      {/* Main Split Container */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center justify-between relative z-10">

        {/* Left Side: Brand Text & Float Illustration */}
        {/* ponytail: keep elements minimal to align with requested layout references */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center space-y-6">
          <div className="space-y-4 -mb-16">
            <img src="/images/logo-traficare.png" alt="logo-trafficare" className="w-full h-64 object-contain" />
          </div>

          <div className="relative w-full h-[400px] scale-in">
            <div className="relative w-full h-full float-animation">
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <Image
                  src="/images/IMG_4409.PNG"
                  alt="Traficare Illustration"
                  fill
                  className="object-contain rounded-3xl scale-110"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Admin Form inside a Translucent White Card */}
        {/* ponytail: use opacity-based background (bg-white/80) and backdrop blur for a sleek card glassmorphism */}
        <div className="w-full md:w-[42%]">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-[32px] p-8 md:p-12 space-y-6 text-left">
            <div className="text-center">
              <p className="text-[#0066A5] text-xs font-bold uppercase tracking-widest mb-1">
                Admin Panel
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Masuk ke Backoffice
              </h2>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-[#0066A5] to-[#1f2937] rounded-full"></div>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 text-slate-900 dark:text-slate-50 bg-white/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0066A5]/25 focus:border-[#0066A5] transition-all text-sm"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 text-slate-900 dark:text-slate-50 bg-white/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0066A5]/25 focus:border-[#0066A5] transition-all text-sm"
                  placeholder="Masukkan kata sandi"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0066A5] hover:bg-[#00588E] disabled:bg-[#0066A5]/50 text-white font-bold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer h-12 text-sm mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
