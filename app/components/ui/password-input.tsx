import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useState } from "react";
import * as React from "react";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
