import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateProfile } from "@/store/slices/authSlice";
import api from "@/api/axios";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    await dispatch(updateProfile({ name, phone }));
    setSavedMsg("Profile updated.");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setPwError(message ?? "Failed to change password.");
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">My profile</h1>

      <form onSubmit={handleSaveProfile} className="mb-8 space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-900">Account details</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
          <input
            disabled
            value={user.email}
            className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
        <button type="submit" className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500">
          Save changes
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-900">Change password</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
        {pwError && <p className="text-sm text-red-600">{pwError}</p>}
        <button type="submit" className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500">
          Update password
        </button>
      </form>
    </div>
  );
}
