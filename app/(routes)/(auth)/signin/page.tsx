"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect authenticated users away from signin page
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
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {

        let msg;

        switch (result.error) {
          case "CredentialsSignin":
            msg = "Invalid email or password";
            break;
          case "OAuthAccountNotLinked":
            msg = "This account is linked to another provider. Please use that provider to sign in.";
            break;
          case "OAuthCallbackError":
            msg = "An error occurred during the OAuth callback. Please try again.";
            break;
          case "OAuthCreateAccount":
            msg = "An error occurred while creating the account. Please try again.";
            break;
          case "OAuthSignIn":
            msg = "An error occurred during the OAuth sign-in. Please try again.";
            break;
          case "OAuthSignOut":
            msg = "An error occurred during the OAuth sign-out. Please try again.";
            break;
          case "OAuthTokenError":
            msg = "An error occurred while retrieving the OAuth token. Please try again.";
            break;
          default:
            msg = "An unknown error occurred. Please try again.";
        }


        setError(msg || "Failed to sign in");
      } else {
        router.push(returnUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
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
            Make.
          </h1>
        </div>
        <div className="text-left w-full">
          <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
          <p className="text-xl text-gray-600">Build, Create, and</p>
          <p className="text-xl text-gray-500">Innovate with Droip</p>
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

      {/* Right side with login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-1">Login</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example123"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-2xl"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-blue hover:text-brand-teal"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600"
                >
                  Remember Me
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
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Login <span className="ml-2">→</span></span>
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
              Login with Google
            </button>

            <div className="text-center text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-brand-blue font-medium hover:text-brand-teal">
                Create Account
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