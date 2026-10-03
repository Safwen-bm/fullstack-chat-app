import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";
import {
  validateEmail,
  validateFullName,
  validatePassword,
} from "../lib/validation";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

const MIN_PASSWORD = 6;

const STRENGTH = [
  { label: "Too short", color: "bg-error" },
  { label: "Weak", color: "bg-error" },
  { label: "Okay", color: "bg-warning" },
  { label: "Good", color: "bg-info" },
  { label: "Strong", color: "bg-success" },
];

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  const filled = Math.max(score, 1);
  const level = STRENGTH[score];

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < filled ? level.color : "bg-base-300"
            }`}
          />
        ))}
      </div>
      <span className="w-16 text-right text-xs text-base-content/60">{level.label}</span>
    </div>
  );
};

const SignUpPage = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { signup, isSigningUp } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSigningUp) return;

    const next = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password, MIN_PASSWORD),
    };
    setErrors(next);

    const firstInvalid = Object.keys(next).find((key) => next[key]);
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    signup({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <AuthLayout
      variant="signup"
      title="Create account"
      subtitle="Get started with your free account"
      showcaseTitle="Join the conversation"
      showcaseSubtitle="Connect with friends, share moments, and stay close to the people you care about."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="link link-primary font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Full name"
          icon={User}
          name="fullName"
          autoComplete="name"
          autoFocus
          placeholder="Who are you?"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        >
          <PasswordStrength password={formData.password} />
        </AuthField>

        <button
          type="submit"
          disabled={isSigningUp}
          className="btn btn-primary w-full gap-2 rounded-xl text-base shadow-lg shadow-primary/30"
        >
          {isSigningUp ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUpPage;