function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function ApprovalRow({
  name,
  subtitle,
  meta,
  tag,
  onApprove,
  onReject,
}: {
  name: string;
  subtitle?: string;
  meta?: string;
  tag?: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="glass flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-iris text-sm font-display text-[#1b1229]">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          {subtitle && <p className="truncate text-xs text-ink-faint">{subtitle}</p>}
          <div className="mt-0.5 flex items-center gap-2">
            {tag && <span className="chip !py-0.5 !text-[.65rem]">{tag}</span>}
            {meta && <span className="text-[.7rem] text-ink-faint">{meta}</span>}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onApprove}
          aria-label="Approve"
          className="grid h-8 w-8 place-items-center rounded-full bg-mint/15 text-mint transition-transform hover:scale-110"
        >
          ✓
        </button>
        <button
          onClick={onReject}
          aria-label="Reject"
          className="grid h-8 w-8 place-items-center rounded-full bg-rose/15 text-rose transition-transform hover:scale-110"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
