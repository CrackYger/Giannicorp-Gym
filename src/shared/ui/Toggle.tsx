import { type ButtonHTMLAttributes } from "react";

type Props = {
  pressed: boolean;
  onPressedChange: (v: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "aria-pressed">;

// Minimal, dependency-free class combiner
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Toggle({ pressed, onPressedChange, className = "", disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-pressed={pressed}
      onClick={() => !disabled && onPressedChange(!pressed)}
      disabled={disabled}
      className={cx(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-accent",
        pressed ? "bg-accent border-accent" : "bg-zinc-800 border-zinc-700",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    >
      <span
        className={cx(
          "inline-block h-5 w-5 transform rounded-full bg-zinc-950 transition-transform",
          pressed ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
