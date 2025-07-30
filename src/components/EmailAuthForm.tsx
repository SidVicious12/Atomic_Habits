"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface EmailAuthFormProps {
  /**
   * "signin" – existing account; "signup" – create account
   */
  mode: "signin" | "signup";
  /**
   * Optional callback when auth succeeds
   */
  onSuccess?: () => void;
}

/**
 * Lightweight email / password auth form for Supabase.
 *
 * Example usage:
 * ```tsx
 * <EmailAuthForm mode="signup" />
 * <EmailAuthForm mode="signin" onSuccess={() => navigate('/')} />
 * ```
 */
export function EmailAuthForm({ mode, onSuccess }: EmailAuthFormProps) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
        // Supabase will send a confirmation email by default
        setMessage("Check your email to confirm your account.");
      } else {
        await signIn(email, password);
        setMessage("Logged in successfully.");
        if (onSuccess) onSuccess();
        else navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = mode === "signup" ? "Sign up" : "Log in";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
