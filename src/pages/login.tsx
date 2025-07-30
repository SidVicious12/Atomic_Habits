import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { EmailAuthForm } from "@/components/EmailAuthForm";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true }); // Redirect to homepage if already logged in
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    // Supabase Google OAuth
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert(error.message);
  };

  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            <h1 className="text-3xl font-semibold">Login</h1>
          </div>
          <div className="flex w-full flex-col gap-8">
            {/* Email/password login */}
            <EmailAuthForm mode="signin" />
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/forgot-password" className="hover:underline">
                Forgot password?
              </Link>
            </p>

            {/* Google OAuth login */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              type="button"
            >
              <FcGoogle className="mr-2 size-5" />
              Login with Google
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
