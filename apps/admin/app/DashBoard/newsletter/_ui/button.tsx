import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Valores literais portados do modelo (theme.css light):
// primary #030213, fg branco, accent #e9ebef, border black/10.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#030213] text-white hover:bg-[#030213]/90",
        destructive: "bg-[#d4183d] text-white hover:bg-[#d4183d]/90",
        outline:
          "border border-black/10 bg-white text-gray-900 hover:bg-[#e9ebef] hover:text-[#030213]",
        secondary:
          "bg-[#eceef2] text-[#030213] hover:bg-[#eceef2]/80",
        ghost: "hover:bg-[#e9ebef] hover:text-[#030213]",
        link: "text-[#030213] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
