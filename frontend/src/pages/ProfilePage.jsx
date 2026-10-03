import React, { useState } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  Copy,
  Loader2,
  Mail,
  Pencil,
  User,
  Wifi,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/useAuthStore";
import { compressImage } from "../lib/image";
import { validateFullName } from "../lib/validation";

const MAX_NAME = 50;
const MAX_FILE_MB = 15;

const InfoCard = ({ icon: Icon, label, action, children }) => (
  <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/60">
        <Icon className="size-4" />
        {label}
      </p>
      {action}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, onlineUsers } = useAuthStore();

  const [preview, setPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");

  const isOnline = onlineUsers.includes(authUser?._id);

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Just joined";

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`That image is too large. Choose one under ${MAX_FILE_MB} MB.`);
      return;
    }

    setUploadingPhoto(true);
    try {
      const dataUrl = await compressImage(file, { maxSize: 512, square: true });
      setPreview(dataUrl);
      const ok = await updateProfile({ profilePic: dataUrl });
      if (!ok) setPreview(null); // do not show a photo that was not saved
    } catch (err) {
      setPreview(null);
      toast.error(err.message || "Could not process this image.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startEditingName = () => {
    setNameDraft(authUser.fullName);
    setNameError("");
    setEditingName(true);
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNameError("");
  };

  const saveName = async () => {
    const clean = nameDraft.trim();
    const error =
      validateFullName(clean) ||
      (clean.length > MAX_NAME ? `Keep it under ${MAX_NAME} characters.` : "");
    if (error) {
      setNameError(error);
      return;
    }
    if (clean === authUser.fullName) {
      cancelEditingName();
      return;
    }
    const ok = await updateProfile({ fullName: clean });
    if (ok) cancelEditingName();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(authUser.email);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy the email.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 pb-16 pt-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">
          {/* BANNER */}
          <div className="relative h-36 bg-gradient-to-r from-primary via-secondary to-accent sm:h-44">
            <div className="absolute inset-0 text-white/25 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          </div>

          <div className="px-6 pb-8 sm:px-10">
            {/* AVATAR + HEADER */}
            <div className="-mt-16 flex flex-col items-center gap-4 sm:-mt-20 sm:flex-row sm:items-end">
              <div className="relative shrink-0">
                <img
                  src={preview || authUser?.profilePic || "/avatar.png"}
                  alt="Profile avatar"
                  className="size-32 rounded-full border-4 border-base-100 object-cover shadow-xl sm:size-40"
                />

                {uploadingPhoto && (
                  <div className="absolute inset-0 grid place-items-center rounded-full bg-base-100/60 backdrop-blur-sm">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  title="Change photo"
                  className={`absolute bottom-1 right-1 cursor-pointer rounded-full bg-primary p-2.5 text-primary-content shadow-lg transition-transform duration-200 hover:scale-110 ${
                    uploadingPhoto ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <Camera className="size-5" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>

              <div className="min-w-0 text-center sm:pb-3 sm:text-left">
                <h1 className="truncate text-3xl font-extrabold">{authUser?.fullName}</h1>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`badge gap-1.5 ${
                      isOnline ? "badge-success badge-outline" : "badge-ghost"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-base-content/50 sm:text-left">
              {uploadingPhoto
                ? "Uploading your photo..."
                : "Tap the camera to change your photo. It is resized automatically."}
            </p>

            {/* DETAILS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={User}
                label="Full name"
                action={
                  !editingName && (
                    <button
                      type="button"
                      onClick={startEditingName}
                      aria-label="Edit name"
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )
                }
              >
                {editingName ? (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      maxLength={MAX_NAME}
                      value={nameDraft}
                      onChange={(e) => {
                        setNameDraft(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") cancelEditingName();
                      }}
                      aria-invalid={!!nameError}
                      className={`input input-bordered input-sm w-full ${
                        nameError ? "input-error" : ""
                      }`}
                    />
                    {nameError && (
                      <p role="alert" className="text-xs text-error">
                        {nameError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveName}
                        disabled={isUpdatingProfile}
                        className="btn btn-primary btn-sm flex-1 gap-1"
                      >
                        {isUpdatingProfile ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingName}
                        aria-label="Cancel"
                        className="btn btn-ghost btn-sm"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="truncate text-lg font-semibold">{authUser?.fullName}</p>
                )}
              </InfoCard>

              <InfoCard
                icon={Mail}
                label="Email address"
                action={
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="Copy email"
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <Copy className="size-3.5" />
                  </button>
                }
              >
                <p className="truncate text-lg font-semibold">{authUser?.email}</p>
              </InfoCard>

              <InfoCard icon={CalendarDays} label="Member since">
                <p className="text-lg font-semibold">{memberSince}</p>
              </InfoCard>

              <InfoCard icon={Wifi} label="Connection">
                <p
                  className={`text-lg font-semibold ${
                    isOnline ? "text-success" : "text-base-content/60"
                  }`}
                >
                  {isOnline ? "Connected" : "Not connected"}
                </p>
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;