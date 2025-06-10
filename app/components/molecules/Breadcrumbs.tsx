import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li
              key={item.label}
              className="flex items-center"
            >
              {index > 0 && (
                <span className="mx-1 text-muted-foreground" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={cn(
                  "flex items-center gap-1.5",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground"
                )}>
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}