import React, { useState } from "react";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";
import { InfinityLoop } from "@/components/ui/infinity-loop";
import { supabase } from "@/lib/supabase";

// Utility for conditional classnames
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/*******************
 * Sign In Card    *
 *******************/
const SignInCard: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === "email") {
      if (!email) return;
      setStep("password");
    } else {
      if (!password) return;
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep("email");
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-sm"
    >
      <div className="rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-8 shadow-2xl">
        <h2 className="text-xl font-medium text-white mb-6">
          Step {step === "email" ? "1" : "2"}: {step === "email" ? "Email" : "Password"}
        </h2>

        <form onSubmit={handleNext} className="space-y-6">
          {step === "email" ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 6l9 6 9-6" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Back
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
                className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              <p className="text-sm text-zinc-500 mt-2">Signing in as {email}</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || (step === "email" ? !email : !password)}
            className={cn(
              "w-full h-12 rounded-lg font-medium transition-all duration-200",
              "bg-zinc-100 text-zinc-900 hover:bg-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-white/50"
            )}
          >
            {isLoading ? "Signing in..." : "Next"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

/*************
 * Page Wrapper
 *************/
const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Sparkle particles background */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="signin-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.5}
        />
      </div>

      {/* Infinity Loop - positioned higher */}
      <div className="absolute top-[20%] inset-x-0 flex justify-center z-10 pointer-events-none">
        <InfinityLoop className="w-[600px] h-[300px] md:w-[800px] md:h-[400px] opacity-80" />
      </div>

      {/* Title at the top */}
      <div className="absolute top-8 md:top-12 inset-x-0 z-30 w-full flex justify-center items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-white tracking-tight italic"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Habit Loop
        </motion.h1>
      </div>

      {/* Login card below infinity loop */}
      <div className="absolute top-[55%] inset-x-0 flex justify-center z-20 px-4">
        <SignInCard />
      </div>

      {/* Decorative star in bottom right */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-6 right-6 z-30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>
    </div>
  );
};

export default SignInPage;
