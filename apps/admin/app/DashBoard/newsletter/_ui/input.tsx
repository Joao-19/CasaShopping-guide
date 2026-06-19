import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-[#717182] selection:bg-[#030213] selection:text-white border border-black/10 flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base bg-[#f3f3f5] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
