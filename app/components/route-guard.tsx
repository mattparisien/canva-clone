"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Only handle authorization once the status is determined
    if (status === "loading") return;
    
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    // If authenticated or on a public path, they're authorized
    if (session || isPublicPath) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      // Use a single redirect and store the return URL
      const returnUrl = encodeURIComponent(pathname);
      // Prevent redirect loops by checking we're not already on the signin page
      if (pathname !== '/signin') {
        router.replace(`/signin?returnUrl=${returnUrl}`);
      }
    }
  }, [session, status, pathname, publicPaths]);
  
  // While auth is loading or handling authorization, show loading indicator
  if (status === "loading" || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}