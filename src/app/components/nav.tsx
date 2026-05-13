import Link from "next/link";

/* 4a: Shared nav component — used by both the home page and public audit page */
export function Nav({
  rightLabel = "Free AI spend audit",
}: {
  rightLabel?: string;
}) {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--color-border)] px-[clamp(18px,4vw,56px)] py-[18px]">
      <Link
        href="/"
        className="text-lg font-extrabold text-[var(--color-brand-dark)] no-underline"
      >
        StackTrim
      </Link>
      <span>{rightLabel}</span>
    </nav>
  );
}
