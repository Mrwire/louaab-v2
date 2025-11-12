interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl"
      }
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full bg-mint/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 text-3xl font-bold uppercase tracking-[0.12em] text-charcoal md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base text-slate">{description}</p>
      ) : null}
    </div>
  );
}




