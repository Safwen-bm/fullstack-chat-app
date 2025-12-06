import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required.");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email))
      return toast.error("Please enter a valid email address.");
    if (!formData.password) return toast.error("Password is required.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) login(formData);
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
              <h1 className="text-3xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-6">
            <p className="text-base-content/60">
              Don’t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <AuthImagePattern
        title="Welcome Back"
        subtitle="Sign in to continue your conversations and catch up with your messages."
      />
    </div>
  );
};

export default LoginPage;
