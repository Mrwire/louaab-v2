import Link from "next/link";

interface AgePillProps {
  label: string;
  href: string;
}

export function AgePill({ label, href }: AgePillProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-charcoal shadow-sm shadow-mist/40 transition hover:-translate-y-1 hover:bg-mint/20"
    >
      {label}
    </Link>
  );
}




