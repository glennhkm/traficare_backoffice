"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast, { LoaderIcon } from "react-hot-toast";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Password baru harus berbeda dengan password lama");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(currentPassword, newPassword);

      if (error) {
        toast.error(error.message || "Gagal mengubah password");
      } else {
        toast.success("Password berhasil diubah!");
        handleClose();
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={handleClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <h3 className="font-semibold text-slate-800 text-lg">
              Ubah Password
            </h3>
            <button 
              onClick={handleClose} 
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-semibold transition-all"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password Lama
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                  placeholder="Masukkan password lama"
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password Baru
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                  placeholder="Masukkan password baru"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Password Baru
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                  placeholder="Konfirmasi password baru"
                  required
                  minLength={6}
                />
              </div>

              {/* Password Requirements */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">Persyaratan password:</p>
                <ul className="space-y-1 font-medium">
                  <li>• Minimal 6 karakter</li>
                  <li>• Berbeda dengan password lama</li>
                  <li>• Kombinasi huruf dan angka disarankan</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-5 py-2.5 rounded-xl border font-semibold text-sm hover:bg-slate-50 transition-all text-slate-700 bg-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-[#0066A5] text-white hover:bg-[#0066A5]/95 font-semibold text-sm transition-all shadow-md shadow-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex justify-center w-full">
                      <LoaderIcon />
                    </div>
                  ) : (
                    "Ubah Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
