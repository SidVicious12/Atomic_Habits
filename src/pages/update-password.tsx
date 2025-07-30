"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // If user loads this page directly without a recovery session, redirect
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // No active session, go back to login
        navigate("/login", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Password updated! Please log in again.");
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    }

    setLoading(false);
  };

  return (
    <section className="bg-muted h-screen flex items-center justify-center">
      <div className="border-muted bg-background w-full max-w-sm rounded-md border px-6 py-12 shadow-md flex flex-col gap-6 items-center">
        <h1 className="text-3xl font-semibold text-center">Set new password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </section>
  );
}
