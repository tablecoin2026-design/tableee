import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, List, Search, UtensilsCrossed, X } from "lucide-react";
import { assetUrl } from "@/lib/api";
import { Lightbox } from "@/components/PhotoGallery";
import { cn } from "@/lib/utils";
import { MenuBook } from "@/components/MenuBook";

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

const matches = (it, q) => `${it.name} ${it.description || ""}`.toLowerCase().includes(q);

const DIETS = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg" },
  { id: "nonveg", label: "Non-veg" },
];
const dietOk = (it, diet) =>
  diet === "all" || (diet === "veg" ? it.veg === true : it.veg === false);

// `photos` are the restaurant's menu pages (uploaded with the "menu" category); `menu` is the optional typed menu.
export function MenuSection({ menu = [], photos = [], card, heading, venueName }) {
  const allSections = menu.filter((s) => s.items?.length);
  const pages = photos.filter((p) => p.category === "menu");
  const [active, setActive] = useState(null); // null = first section
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("all");
  const [view, setView] = useState("book"); // "book" | "list"
  const list = view === "list";
  const [open, setOpen] = useState(null);
  const tabsRef = useRef(null);
  const topRef = useRef(null);

  const hasVegInfo = allSections.some((s) => s.items.some((it) => it.veg === true || it.veg === false));
  // Sections after the veg / non-veg filter (empty ones drop out of the tabs).
  const sections = allSections
    .map((s) => ({ ...s, items: s.items.filter((it) => dietOk(it, diet)) }))
    .filter((s) => s.items.length);
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  const q = query.trim().toLowerCase();
  const activeId = active === "all" || sections.some((s) => s.id === active) ? active : sections[0]?.id ?? "all";
  const idx = sections.findIndex((s) => s.id === activeId);
  const shown = q
    ? sections.map((s) => ({ ...s, items: s.items.filter((it) => matches(it, q)) })).filter((s) => s.items.length)
    : activeId === "all"
      ? sections
      : sections.filter((s) => s.id === activeId);
  const found = shown.reduce((n, s) => n + s.items.length, 0);

  // Keep the selected tab in view when the row scrolls horizontally.
  useEffect(() => {
    const el = tabsRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId]);

  const go = (id) => {
    setQuery("");
    setActive(id);
    topRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  };

  return (
    <section className={card} data-testid="venue-menu">
      <div ref={topRef} className="scroll-mt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={heading}>Menu</h2>
            {allSections.length > 0 && (
              <p className="mt-1 text-sm text-[#8F8781]">
                {total} dishes across {sections.length} {sections.length === 1 ? "category" : "categories"}
              </p>
            )}
          </div>
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

      {pages.length === 0 && allSections.length === 0 && (
        <div
          className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-white/15 px-6 py-12 text-center"
          data-testid="menu-placeholder"
        >
          <UtensilsCrossed strokeWidth={1.4} className="h-8 w-8 text-[#E3B364]" />
          <div className="mt-3 font-bold">Menu coming soon</div>
          <p className="mt-1 max-w-xs text-sm text-[#8F8781]">Photos of this restaurant&apos;s menu will appear here.</p>
        </div>
      )}

      {open !== null && pages[open] && (
        <Lightbox photos={pages} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      )}

      {allSections.length > 0 && (
        <div
          className={cn("mt-5 space-y-3", list && "sticky top-0 z-30 -mx-6 border-b border-white/[0.08] bg-[#13110F]/95 px-6 py-3 backdrop-blur")}
          data-testid="menu-controls"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {list && (
            <div className="relative sm:w-64 sm:shrink-0">
              <Search strokeWidth={1.6} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8781]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the menu"
                aria-label="Search the menu"
                data-testid="menu-search"
                className="w-full rounded-full border border-white/10 bg-[#23201E] py-2 pl-9 pr-9 text-sm text-[#F2EDE7] outline-none placeholder:text-[#8F8781] focus:border-[#CE6A4A] [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F8781] hover:text-white"
                >
                  <X strokeWidth={1.8} className="h-4 w-4" />
                </button>
              )}
            </div>
            )}
            {hasVegInfo && (
              <div className="inline-flex shrink-0 self-start rounded-full bg-[#23201E] p-0.5" role="group" aria-label="Dietary filter">
                {DIETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={diet === d.id}
                    data-testid={`menu-diet-${d.id}`}
                    onClick={() => setDiet(d.id)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                      diet === d.id ? "bg-[#F5F5F3] text-[#121110]" : "text-[#B8B2AA] hover:text-white",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
            <div className="inline-flex shrink-0 self-start rounded-full bg-[#23201E] p-0.5 sm:ml-auto" role="group" aria-label="Menu view">
              {[
                { id: "book", label: "Book", Icon: BookOpen },
                { id: "list", label: "List", Icon: List },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  data-testid={`menu-view-${id}`}
                  onClick={() => setView(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    view === id ? "bg-[#F5F5F3] text-[#121110]" : "text-[#B8B2AA] hover:text-white",
                  )}
                >
                  <Icon strokeWidth={1.6} className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {list && sections.length > 1 && (
            <div className="relative">
              <div
                ref={tabsRef}
                role="tablist"
                className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[...sections, { id: "all", name: "All", items: { length: total } }].map((s) => {
                  const on = !q && activeId === s.id;
                  return (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => go(s.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                        on ? "bg-[#F5F5F3] text-[#121110]" : "bg-[#23201E] text-[#B8B2AA] hover:text-white",
                      )}
                    >
                      {s.name}
                      <span className={cn("text-[11px] font-medium tabular-nums", on ? "text-[#121110]/60" : "text-[#8F8781]")}>
                        {s.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#13110F] to-transparent" />
            </div>
          )}
        </div>
      )}

      {!list && allSections.length > 0 && (
        <div className="mt-6">
          {sections.length > 0 ? (
            <MenuBook sections={sections} venueName={venueName} />
          ) : (
            <p className="py-10 text-center text-sm text-[#8F8781]">No dishes match this filter.</p>
          )}
        </div>
      )}

      {list && q && (
        <p className="mt-4 text-sm text-[#8F8781]" role="status">
          {found === 0
            ? <>Nothing on the menu matches &ldquo;{query}&rdquo;.</>
            : <>{found} {found === 1 ? "dish matches" : "dishes match"} &ldquo;{query}&rdquo;.</>}
        </p>
      )}

      <div className={cn("space-y-10", !list && "hidden", allSections.length > 0 && !q && "mt-6", q && "mt-4")}>
        {shown.map((sec) => (
          <div key={sec.id} data-testid={`menu-section-${sec.id}`}>
            <div className="flex items-baseline gap-3 border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#E3B364]">{sec.name}</h3>
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

      {list && !q && activeId !== "all" && sections.length > 1 && (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5" data-testid="menu-pager">
          {idx > 0 ? (
            <button
              type="button"
              onClick={() => go(sections[idx - 1].id)}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#23201E] py-2 pl-3 pr-4 text-sm font-semibold text-[#B8B2AA] transition-colors hover:text-white"
            >
              <ChevronLeft strokeWidth={1.8} className="h-4 w-4 shrink-0" />
              <span className="truncate">{sections[idx - 1].name}</span>
            </button>
          ) : <span />}
          {idx < sections.length - 1 && (
            <button
              type="button"
              onClick={() => go(sections[idx + 1].id)}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#F5F5F3] py-2 pl-4 pr-3 text-sm font-semibold text-[#121110] transition-opacity hover:opacity-90"
            >
              <span className="truncate">{sections[idx + 1].name}</span>
              <ChevronRight strokeWidth={1.8} className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
