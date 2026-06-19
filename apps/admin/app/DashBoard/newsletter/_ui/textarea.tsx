import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border border-black/10 placeholder:text-[#717182] focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400/40 flex field-sizing-content min-h-16 w-full rounded-md bg-[#f3f3f5] px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
