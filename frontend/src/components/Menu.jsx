import { useEffect, useRef, useState } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { assetUrl } from "@/lib/api";
import { Lightbox } from "@/components/PhotoGallery";
import { cn } from "@/lib/utils";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Indian menu convention: green mark = vegetarian, red = non-vegetarian.
function VegMark({ veg, inline = false }) {
  if (veg === null || veg === undefined) return null;
  const color = veg ? "#4ADE80" : "#F87171";
  return (
    <span
      className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border", !inline && "mt-1")}
      style={{ borderColor: color }}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

const matches = (it, q) =>
  `${it.name} ${it.description || ""}`.toLowerCase().includes(q);

// `photos` are the restaurant's menu pages (uploaded with the "menu" category); `menu` is the optional typed menu.
export function MenuSection({ menu = [], photos = [], card, heading }) {
  const sections = menu.filter((s) => s.items?.length);
  const pages = photos.filter((p) => p.category === "menu");
  const [active, setActive] = useState(null); // null = first section
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const tabsRef = useRef(null);

  const activeId = active ?? sections[0]?.id ?? "all";
  const q = query.trim().toLowerCase();
  const base = q || activeId === "all" ? sections : sections.filter((s) => s.id === activeId);
  const shown = q
    ? base.map((s) => ({ ...s, items: s.items.filter((it) => matches(it, q)) })).filter((s) => s.items.length)
    : base;
  const hasVegInfo = sections.some((s) => s.items.some((it) => it.veg !== null && it.veg !== undefined));

  // Keep the selected tab in view when the row scrolls horizontally.
  useEffect(() => {
    const el = tabsRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId]);

  return (
    <section className={card} data-testid="venue-menu">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className={heading}>Menu</h2>
        {hasVegInfo && (
          <div className="flex items-center gap-4 text-xs text-[#8F8781]">
            <span className="inline-flex items-center gap-1.5">
              <VegMark veg={true} inline /> Veg
            </span>
            <span className="inline-flex items-center gap-1.5">
              <VegMark veg={false} inline /> Non-veg
            </span>
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="menu-pages">
          {pages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open menu page ${i + 1}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#1F1D1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CE6A4A]"
            >
              <img
                src={assetUrl(p.thumb_url || p.url)}
                alt={p.caption || `Menu page ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-left text-xs font-semibold text-white">
                {p.caption || `Page ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {pages.length === 0 && sections.length === 0 && (
        <div
          className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-white/15 px-6 py-12 text-center"
          data-testid="menu-placeholder"
        >
          <UtensilsCrossed strokeWidth={1.4} className="h-8 w-8 text-[#EE9B79]" />
          <div className="mt-3 font-bold">Menu coming soon</div>
          <p className="mt-1 max-w-xs text-sm text-[#8F8781]">Photos of this restaurant&apos;s menu will appear here.</p>
        </div>
      )}

      {open !== null && pages[open] && (
        <Lightbox photos={pages} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      )}

      {sections.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-64 sm:shrink-0">
            <Search strokeWidth={1.6} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8781]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu"
              aria-label="Search the menu"
              data-testid="menu-search"
              className="w-full rounded-full border border-white/10 bg-[#23201E] py-2 pl-9 pr-3 text-sm text-[#F2EDE7] outline-none placeholder:text-[#8F8781] focus:border-[#CE6A4A]"
            />
          </div>
          {sections.length > 1 && (
            <div className="relative min-w-0 flex-1">
              <div
                ref={tabsRef}
                role="tablist"
                className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[...sections, { id: "all", name: "All" }].map((s) => {
                  const on = !q && activeId === s.id;
                  return (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setQuery("");
                        setActive(s.id);
                      }}
                      className={cn(
                        "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                        on ? "bg-[#F5F5F3] text-[#121110]" : "bg-[#23201E] text-[#B8B2AA] hover:text-white",
                      )}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#1B1917] to-transparent" />
            </div>
          )}
        </div>
      )}

      {q && shown.length === 0 && (
        <p className="mt-8 text-center text-sm text-[#8F8781]">Nothing on the menu matches &ldquo;{query}&rdquo;.</p>
      )}

      <div className={cn("space-y-10", sections.length > 0 && "mt-7")}>
        {shown.map((sec) => (
          <div key={sec.id} data-testid={`menu-section-${sec.id}`}>
            <div className="flex items-baseline gap-3 border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#EE9B79]">{sec.name}</h3>
              <span className="text-xs text-[#8F8781]">{sec.items.length} {sec.items.length === 1 ? "dish" : "dishes"}</span>
            </div>
            <ul className="mt-1 grid gap-x-12 md:grid-cols-2">
              {sec.items.map((it) => (
                <li key={it.id} className="flex items-start gap-3 border-b border-white/[0.06] py-4">
                  <VegMark veg={it.veg} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold leading-snug">{it.name}</span>
                      <span aria-hidden className="mb-1 hidden min-w-4 flex-1 border-b border-dotted border-white/20 sm:block" />
                      <span className="ml-auto shrink-0 font-bold tabular-nums text-[#F2EDE7] sm:ml-0">{formatPrice(it.price)}</span>
                    </div>
                    {it.description && <p className="mt-1 text-sm leading-relaxed text-[#8F8781]">{it.description}</p>}
                  </div>
                  {it.photo_url && (
                    <img src={assetUrl(it.photo_url)} alt={it.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
