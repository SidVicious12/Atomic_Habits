// src/pages/login.tsx
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInPage from "@/components/ui/travel-connect-signin-1";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  // Render the new sign-in UI
  return <SignInPage />;
}
