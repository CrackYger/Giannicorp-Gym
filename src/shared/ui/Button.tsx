import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "solid" | "outline";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

// Minimal, dependency-free class combiner
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-base rounded-xl",
};

const variantClasses: Record<Variant, string> = {
  solid:
    "bg-accent text-zinc-950 hover:bg-accent/90 active:bg-accent/80 border border-accent",
  outline:
    "bg-transparent text-zinc-100 hover:bg-zinc-800/60 active:bg-zinc-800 border border-zinc-700",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "solid", size = "md", isLoading = false, disabled, children, ...rest }, ref) => {
    const isDisabled = disabled || isLoading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cx(
          "inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...rest}
      >
        {isLoading ? <span className="animate-pulse">•••</span> : null}
        <span className={cx(isLoading && "opacity-80")}>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
