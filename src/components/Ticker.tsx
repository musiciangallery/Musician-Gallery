const ITEMS = [
  "Aotearoa, New Zealand",
  "Event Musicians",
  "Music Teachers",
  "Police Vetted",
  "Free to List",
  "Secure Payments",
  "Built for Independence",
  "Est. 2026",
];

export default function Ticker() {
  const items = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-rule py-4">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="text-[10px] tracking-[0.14em] uppercase text-mid whitespace-nowrap px-4 flex items-center gap-4"
              >
                {item}
                <span className="text-rule">&middot;</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
