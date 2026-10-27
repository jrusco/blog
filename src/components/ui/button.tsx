import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium outline-none transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-foreground/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        glass: "liquid-glass text-foreground hover:scale-[1.03]",
      },
      size: {
        nav: "rounded-full px-6 py-2.5 text-sm",
        hero: "mt-12 rounded-full px-14 py-5 text-base",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "nav",
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
