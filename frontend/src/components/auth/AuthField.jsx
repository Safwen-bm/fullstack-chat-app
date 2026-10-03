import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthField = ({ label, icon: Icon, type = "text", error, children, ...inputProps }) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="form-control">
      <label htmlFor={id} className="label py-1">
        <span className="label-text font-medium">{label}</span>
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-base-content/40" />

        <input
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`input input-bordered w-full rounded-xl pl-11 ${
            isPassword ? "pr-12" : ""
          } ${error ? "input-error" : ""}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-base-content/40 transition-colors hover:text-base-content"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}

      {children}
    </div>
  );
};

export default AuthField;