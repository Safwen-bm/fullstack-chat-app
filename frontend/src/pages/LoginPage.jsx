import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";
import { validateEmail, validatePassword } from "../lib/validation";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login, isLoggingIn } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoggingIn) return;

    const next = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    setErrors(next);

    const firstInvalid = Object.keys(next).find((key) => next[key]);
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    login({ email: formData.email.trim(), password: formData.password });
  };

  return (
    <AuthLayout
      variant="login"
      title="Welcome back"
      subtitle="Sign in to continue your conversations"
      showcaseTitle="Your people are waiting"
      showcaseSubtitle="Sign in to catch up with your messages and jump back into the conversation."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="link link-primary font-medium">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
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
          autoComplete="current-password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isLoggingIn}
          className="btn btn-primary w-full gap-2 rounded-xl text-base shadow-lg shadow-primary/30"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;