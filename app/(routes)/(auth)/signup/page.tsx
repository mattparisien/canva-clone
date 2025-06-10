"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@components/atoms/button";
import { Input } from "@components/atoms/input";
import { Checkbox } from "@components/atoms/checkbox";
import { Label } from "@components/atoms/label";
import { Alert, AlertDescription } from "@components/atoms/alert";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { authAPI } from "@lib/api";

// Schema for validation
const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  form?: string;
};

export default function SignUp() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // Get return URL from query parameter
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const returnUrl = searchParams.get("returnUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate form data
    const result = SignupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const formattedErrors: FormErrors = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof FormErrors;
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path]?.push(issue.message);
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setErrors({ form: "You must agree to the Terms & Conditions to continue." });
      setIsLoading(false);
      return;
    }

    try {
      // Register user with your API
      const response = await authAPI.register(name, email, password);
      
      // After successful registration, sign in with NextAuth
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ form: "Authentication failed after registration. Please try signing in manually." });
      } else {
        // Redirect to dashboard on successful sign-in
        router.push(returnUrl);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          setErrors({ email: ["This email is already registered. Please use another email or sign in."] });
        } else {
          setErrors({ form: error.message });
        }
      } else {
        setErrors({ form: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar with gradient background and logo */}
      <div className="hidden md:flex w-[450px] flex-col items-center justify-center bg-gradient-to-b from-brand-blue-light to-brand-teal-light p-8">
        <div className="w-full max-w-[200px] mb-20">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">
            Create.
          </h1>
        </div>
        <div className="text-left w-full">
          <h2 className="text-2xl font-bold text-gray-800">Join Us!</h2>
          <p className="text-xl text-gray-600">Start Your Journey</p>
          <p className="text-xl text-gray-500">with Droip Today</p>
        </div>
        <div className="mt-auto w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium text-brand-blue hover:text-brand-teal"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Right side with signup form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-1">Create Account</h1>
            <p className="text-gray-500">Enter your information to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-2xl"
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-2xl"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-2xl"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password[0]}</p>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600"
                >
                  I agree to the <Link href="/terms" className="text-brand-blue hover:text-brand-teal">Terms & Conditions</Link>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white font-medium py-3 h-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Sign Up <span className="ml-2">→</span></span>
              )}
            </Button>

            <div className="relative flex items-center justify-center my-6">
              <hr className="w-full border-gray-200" />
              <span className="absolute bg-white px-3 text-sm text-gray-400">Or</span>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              onClick={() => signIn("google", { callbackUrl: returnUrl })}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"></path>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"></path>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"></path>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"></path>
              </svg>
              Sign up with Google
            </button>

            <div className="text-center text-sm mt-6">
              Already have an account?{" "}
              <Link href="/signin" className="text-brand-blue font-medium hover:text-brand-teal">
                Login
              </Link>
            </div>
          </form>

          <div className="mt-10 text-center text-xs text-gray-400">
            <div className="flex justify-center space-x-4">
              <Link href="/terms" className="hover:text-gray-600">Terms & Condition</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}