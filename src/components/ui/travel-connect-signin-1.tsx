import React, { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Hawk3D from "@/components/ui/Hawk3D";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

import { supabase } from "@/lib/supabase";

// Utility for conditional classnames
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/*********************
 * Re-usable UI atoms *
 *********************/
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default:
      "bg-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  } as const;
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-gray-800 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

/*******************
 * Main Card View  *
 *******************/
const SignInCard: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hover, setHover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        alert(error.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('An error occurred during Google login');
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20"
      >
        {/* Form - Full Width */}
        <div className="w-full p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-white/98 to-gray-50/95 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mb-8">Continue building your atomic habits</p>

            <div className="mb-6">
              <button
                className="w-full flex items-center justify-center gap-2 bg-white/80 border border-gray-300/50 rounded-lg p-3 hover:bg-white/90 hover:border-blue-300/50 transition-all duration-300 text-gray-700 shadow-lg backdrop-blur-sm"
                onClick={handleGoogleLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fillOpacity={0.54}
                  />
                  <path
                    fill="#4285F4"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#34A853"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity={0} />
                </svg>
                <span>Login with Google</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleEmailLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                  Email <span className="text-blue-600">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="bg-white/80 border-gray-300/50 placeholder:text-gray-500 text-gray-900 w-full focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                  Password <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-white/80 border-gray-300/50 placeholder:text-gray-500 text-gray-900 w-full pr-10 focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm shadow-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHover(true)}
                onHoverEnd={() => setHover(false)}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className={cn(
                    "w-full bg-gradient-to-r relative overflow-hidden from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                    hover && "shadow-xl shadow-blue-300/50"
                  )}
                >
                  <span className="flex items-center justify-center">
                    {isLoading ? "Signing in..." : "Sign in"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </span>
                  {hover && (
                    <motion.span
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ filter: "blur(8px)" }}
                    />
                  )}
                </Button>
              </motion.div>

              <div className="text-center mt-6">
                <a href="#" className="text-blue-700 hover:text-blue-800 text-sm transition-colors font-medium">
                  Forgot password?
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

/*************
 * Page Wrapper
 *************/
const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700" />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
      
      {/* Title at the top */}
      <div className="absolute top-8 inset-x-0 z-30 w-full flex justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <img 
            src={logo} 
            alt="Atomic Habits Logo" 
            className="h-12 w-12 md:h-16 md:w-16 object-contain drop-shadow-2xl" 
          />
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide drop-shadow-2xl">
            Atomic Habits
          </h1>
        </motion.div>
      </div>

      {/* Subtle sci-fi grid overlay on left side */}
      <div className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center pointer-events-none opacity-30">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-400/30 rounded-lg animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border border-blue-400/30 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>

      {/* 3D Hawk on the left */}
      <div className="absolute inset-0 flex items-center justify-start pl-16 z-20 pointer-events-none">
        <Canvas style={{ width: 396, height: 396 }} camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Suspense fallback={null}>
            <Hawk3D position={[0, 0, 0]} scale={2} />
          </Suspense>
        </Canvas>
      </div>

      {/* Login card on right side */}
      <div className="absolute inset-0 flex items-center justify-end pr-16 z-20">
        <SignInCard />
      </div>
    </div>
  );
};

export default SignInPage;
