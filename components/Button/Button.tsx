import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/cn";
import Link from "next/link";
import type { ComponentProps } from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-2 focus-visible:outline-[var(--btn-accent)]",
  {
    variants: {
      variant: {
        ghost:
          "bg-[var(--btn-accent)]/8 border-2 border-[var(--btn-accent)] text-[var(--btn-accent)] hover:bg-[var(--btn-accent)]/20",
        subtle:
          "bg-[var(--btn-accent)]/15 border border-[var(--btn-accent)]/30 text-[var(--btn-accent)] hover:bg-[var(--btn-accent)]/25",
        solid:
          "bg-[var(--btn-accent)] text-bg-200 border-2 border-[var(--btn-accent)] hover:opacity-90",
        neutral:
          "bg-transparent border border-bg-600 text-text-muted hover:text-text hover:border-text-muted",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ButtonVariants {
  accent?: string;
}

export function Button({ className, variant, size, accent, style, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ "--btn-accent": accent, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "color">, ButtonVariants {
  accent?: string;
}

export function LinkButton({
  className,
  variant,
  size,
  accent,
  style,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ "--btn-accent": accent, ...style } as React.CSSProperties}
      {...props}
    />
  );
}
