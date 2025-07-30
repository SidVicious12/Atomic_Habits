"use client";

import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="bg-muted h-screen flex items-center justify-center">
      <div className="border-muted bg-background w-full max-w-sm rounded-md border px-6 py-12 shadow-md flex flex-col gap-6 items-center">
        <h1 className="text-3xl font-semibold text-center">Forgot password</h1>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
