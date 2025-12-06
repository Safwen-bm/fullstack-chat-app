import React, { useState } from "react";
import { Camera, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ profilePic: base64Image });
      } catch (error) {
        alert("Failed to update profile picture. Please try again.");
      }
    };
  };

  return (
    <div className="min-h-screen pt-24 bg-base-200 flex justify-center px-4">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
          <p className="text-zinc-400 mt-2 text-sm">Manage your account information</p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-base-300/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-base-300">
          
          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile avatar"
                className="size-36 rounded-full object-cover border-4 border-base-100 shadow-md transition-all duration-300 group-hover:scale-105"
              />

              {/* Upload Btn */}
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md cursor-pointer
                transition-all duration-200 hover:scale-110 
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              {isUpdatingProfile ? "Uploading..." : "Click the camera to update photo"}
            </p>
          </div>

          {/* PROFILE INFO */}
          <div className="mt-10 space-y-6">

            {/* NAME */}
            <div className="space-y-1">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="size-4" /> Full Name
              </label>

              <div className="bg-base-200 border border-base-300 rounded-lg p-3 px-4 text-sm font-medium">
                {authUser?.fullName}
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="size-4" /> Email Address
              </label>

              <div className="bg-base-200 border border-base-300 rounded-lg p-3 px-4 text-sm font-medium">
                {authUser?.email}
              </div>
            </div>
          </div>

          {/* ACCOUNT SETTINGS */}
          <div className="mt-10 bg-base-200/60 border border-base-300 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-zinc-400">Member Since</span>
                <span className="font-medium">{authUser.createdAt?.split("T")[0]}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-zinc-400">Account Status</span>
                <span className="text-green-500 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
};

export default ProfilePage;
