"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  publicPaths?: string[];
}

export function RouteGuard({ 
  children, 
  publicPaths = ["/", "/signin", "/signup", "/forgot-password", "/reset-password"]
}: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Auth isn't ready yet, don't do anything
    if (status === "loading") return;
    
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    // If not authenticated and not on a public path, redirect to signin
    if (!session && !isPublicPath) {
      router.push(`/signin?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, status, pathname, router, publicPaths]);
  
  // While auth is loading, show nothing
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}