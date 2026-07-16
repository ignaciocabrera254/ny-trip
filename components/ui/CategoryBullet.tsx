import { CATEGORY_COLOR, CATEGORY_LABEL, type DestinationCategory } from "@/lib/types";

type Props = {
  category: DestinationCategory;
  size?: "sm" | "md";
};

export default function CategoryBullet({ category, size = "sm" }: Props) {
  const dim = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/70">
      <span
        className={`inline-block shrink-0 rounded-full ${dim}`}
        style={{ backgroundColor: CATEGORY_COLOR[category] }}
        aria-hidden
      />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
