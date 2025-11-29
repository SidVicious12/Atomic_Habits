// src/pages/login.tsx
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInPage from "@/components/ui/travel-connect-signin-1";

export default function LoginPage() {
  const { user, loading, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for loading to complete before making decisions
    if (loading) return;

    // If Supabase is not configured, redirect to home (bypass auth)
    if (!isConfigured) {
      console.log('⚠️ Supabase not configured, bypassing authentication');
      navigate("/", { replace: true });
      return;
    }

    // If user is authenticated, redirect to home
    if (user) {
      console.log('✅ User already authenticated, redirecting to home');
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, isConfigured]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, show redirecting message
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render the sign-in UI if not authenticated and Supabase is configured
  return <SignInPage />;
}
