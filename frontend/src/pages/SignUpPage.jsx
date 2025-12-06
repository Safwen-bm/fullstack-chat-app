import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required.");
    
    if (!formData.email.trim()) return toast.error("Email is required.");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailPattern.test(formData.email)) return toast.error("Please enter a valid email address.");

    if (!formData.password) return toast.error("Password is required.");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters long.");
  
    return true; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-200">

      {/* Left LOGO + FORM */}
      <div className="flex flex-cols justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-base-100/60 backdrop-blur-xl
         border border-base-300/50 rounded-2xl shadow-xl p-10
         animate-fadeIn">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex flex-col items-center gap-3 group">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center
                shadow-inner transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-105">
                <MessageSquare className="size-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <User className="absolute top-3 left-3 size-5 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 rounded-xl"
                  placeholder="Who Are You"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 size-5 text-base-content/40 pointer-events-none" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 rounded-xl"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 size-5 text-base-content/40 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 rounded-xl"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-6">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;
