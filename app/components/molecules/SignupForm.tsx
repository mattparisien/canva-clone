'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/atoms/card";
import { Label } from "@components/atoms/label";
import { Input } from "@components/atoms/input";
import { Button } from "@components/atoms/button";
import { Alert, AlertDescription } from "@components/atoms/alert";
import { Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api";

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

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate form data
    const result = SignupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const formattedErrors: FormErrors = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof Omit<FormErrors, 'form'>;
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        (formattedErrors[path] as string[]).push(issue.message);
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Register user with your API
      const response = await authAPI.register(name, email, password);
      
      // After successful registration, redirect to dashboard
      router.push("/");
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
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create an account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <Alert variant="destructive">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </div>
      </CardFooter>
    </Card>
  );
}