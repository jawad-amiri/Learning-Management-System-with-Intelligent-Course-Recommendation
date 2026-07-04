// NEW - PROFILE PHOTO FEATURE: complete profile management page.
import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, ChevronDown, Lock, Save, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordRequest,
  removeProfilePhotoRequest,
  updateProfileRequest,
  type ChangePasswordPayload,
} from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/context/useAuth";
import { getErrorMessage } from "@/services/api";
import { resolveMediaUrl } from "@/lib/media";

const emptyPassword: ChangePasswordPayload = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
    email: "",
    bio: "",
    expertise: "",
    experience: "",
  });
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [openProfilePanel, setOpenProfilePanel] = useState<"personal" | "security">("personal");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      full_name: user.full_name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
      expertise: user.expertise ?? "",
      experience: user.experience ?? "",
    });
  }, [user]);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewUrl("");
      return;
    }

    const nextPreview = URL.createObjectURL(profilePhoto);
    setPreviewUrl(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [profilePhoto]);

  const photoUrl = previewUrl || resolveMediaUrl(user?.profile_photo_url);
  const completion = user?.profile_completion ?? calculateCompletion(user, profileForm, Boolean(photoUrl));

  const passwordError = useMemo(() => {
    if (!passwordForm.current_password && !passwordForm.new_password && !passwordForm.confirm_password) return "";
    if (passwordForm.new_password.length < 6) return "New password must be at least 6 characters.";
    if (passwordForm.new_password !== passwordForm.confirm_password) return "Confirm password must match new password.";
    return "";
  }, [passwordForm]);

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");

    try {
      await updateProfileRequest(profileForm, profilePhoto);
      setProfilePhoto(null);
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true);
    setError("");

    try {
      await removeProfilePhotoRequest();
      setProfilePhoto(null);
      await refreshUser();
      toast.success("Profile photo removed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemovingPhoto(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSavingPassword(true);
    setError("");

    try {
      await changePasswordRequest(passwordForm);
      setPasswordForm(emptyPassword);
      toast.success("Password changed successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-[1.75rem] bg-primary-50 text-primary-700">
              {photoUrl ? (
                <img src={photoUrl} alt={user?.full_name ?? "Profile"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{user?.full_name}</h1>
              <p className="mt-1 text-sm capitalize text-slate-500">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-2xl bg-primary-50 p-4 dark:bg-primary-400/10">
            <div className="flex items-center justify-between text-sm font-semibold text-primary-900 dark:text-primary-100">
              <span>Profile Completion</span>
              <span>{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-surface-dark">
              <div className="h-full rounded-full bg-primary-700 transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleSaveProfile} className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
          <button
            type="button"
            onClick={() => setOpenProfilePanel(openProfilePanel === "personal" ? "security" : "personal")}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">Photo, name, contact info, and teacher profile fields.</p>
            </div>
            <ChevronDown className={openProfilePanel === "personal" ? "h-5 w-5 rotate-180 text-slate-400 transition" : "h-5 w-5 text-slate-400 transition"} />
          </button>

          {openProfilePanel === "personal" ? (
          <>
          <div className="mt-5 rounded-2xl border border-dashed border-primary-200 bg-primary-50/45 p-4 dark:border-primary-400/25 dark:bg-primary-400/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-surface-subtle">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-700">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile photo</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG, or WebP. Preview appears before saving.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                    <Camera className="h-4 w-4" />
                    {profilePhoto || user?.profile_photo_url ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => setProfilePhoto(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {(profilePhoto || user?.profile_photo_url) ? (
                    <button
                      type="button"
                      onClick={profilePhoto ? () => setProfilePhoto(null) : handleRemovePhoto}
                      disabled={removingPhoto}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {profilePhoto ? "Remove preview" : removingPhoto ? "Removing..." : "Remove photo"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProfileInput label="Full name" value={profileForm.full_name} onChange={(value) => setProfileForm((current) => ({ ...current, full_name: value }))} required />
            <ProfileInput label="Username" value={profileForm.username} onChange={(value) => setProfileForm((current) => ({ ...current, username: value }))} required />
            <ProfileInput label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm((current) => ({ ...current, email: value }))} required />
            <ProfileInput label="Bio" value={profileForm.bio} onChange={(value) => setProfileForm((current) => ({ ...current, bio: value }))} />
            {user?.role === "teacher" ? (
              <>
                <ProfileInput label="Expertise" value={profileForm.expertise} onChange={(value) => setProfileForm((current) => ({ ...current, expertise: value }))} />
                <ProfileInput label="Experience" value={profileForm.experience} onChange={(value) => setProfileForm((current) => ({ ...current, experience: value }))} />
              </>
            ) : null}
          </div>

          <button type="submit" disabled={savingProfile} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
          </>
          ) : null}
        </form>

        <form onSubmit={handleChangePassword} className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
          <button
            type="button"
            onClick={() => setOpenProfilePanel(openProfilePanel === "security" ? "personal" : "security")}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Change password</h2>
                <p className="text-sm text-slate-500">Confirm your current password first.</p>
              </div>
            </div>
            <ChevronDown className={openProfilePanel === "security" ? "h-5 w-5 rotate-180 text-slate-400 transition" : "h-5 w-5 text-slate-400 transition"} />
          </button>

          {openProfilePanel === "security" ? (
          <>
          <div className="mt-5 space-y-4">
            <ProfileInput label="Current password" type="password" value={passwordForm.current_password} onChange={(value) => setPasswordForm((current) => ({ ...current, current_password: value }))} required />
            <ProfileInput label="New password" type="password" value={passwordForm.new_password} onChange={(value) => setPasswordForm((current) => ({ ...current, new_password: value }))} required />
            <ProfileInput label="Confirm password" type="password" value={passwordForm.confirm_password} onChange={(value) => setPasswordForm((current) => ({ ...current, confirm_password: value }))} required />
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
          </div>

          <button type="submit" disabled={savingPassword || Boolean(passwordError)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            <CheckCircle2 className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Update password"}
          </button>
          </>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function ProfileInput({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100"
      />
    </label>
  );
}

function calculateCompletion(
  user: ReturnType<typeof useAuth>["user"],
  form: {
    full_name: string;
    email: string;
    bio: string;
    expertise: string;
    experience: string;
  },
  hasPhoto: boolean,
) {
  const fields = [
    hasPhoto,
    form.full_name,
    form.email,
    form.bio,
    user?.role === "teacher" ? form.expertise : true,
    user?.role === "teacher" ? form.experience : true,
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
