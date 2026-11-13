import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const Ornament = ({ className }) => (
  <svg viewBox="0 0 200 12" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden>
    <path d="M0 6h84M116 6h84" />
    <path d="M100 1l4 5-4 5-4-5z" />
    <circle cx="90" cy="6" r="1.2" fill="currentColor" />
    <circle cx="110" cy="6" r="1.2" fill="currentColor" />
  </svg>
);

const Sprig = ({ className }) => (
  <svg viewBox="0 0 80 90" className={className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden>
    <path d="M12 86C26 62 40 40 62 8" />
    <path d="M26 64c-10-2-16-8-18-16 10 0 17 5 18 16z" />
    <path d="M36 48c-9-4-13-11-13-19 10 2 15 9 13 19z" />
    <path d="M46 32c-8-5-10-12-9-20 9 3 13 10 9 20z" />
    <path d="M30 60c8-2 15-8 17-16-9-1-15 5-17 16z" />
    <path d="M42 42c8-3 13-9 14-17-9 0-14 6-14 17z" />
  </svg>
);

const Cloche = ({ className }) => (
  <svg viewBox="0 0 64 44" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
    <circle cx="32" cy="8" r="3" />
    <path d="M9 34a23 23 0 0146 0" />
    <path d="M4 34h56M2 39h60" />
  </svg>
);

const Waves = ({ className }) => (
  <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={className} fill="none" stroke="currentColor" strokeWidth="0.7" aria-hidden>
    {Array.from({ length: 12 }, (_, k) => (
      <path key={k} d={`M0 ${96 - k * 1.5} C 50 ${80 - k * 4}, 100 ${100 - k * 2}, 200 ${10 + k * 5}`} />
    ))}
  </svg>
);

function Dot({ veg }) {
  if (veg !== true && veg !== false) return <span className="mt-[7px] h-2 w-2 shrink-0" aria-hidden />;
  return (
    <span
      className="mt-[6px] grid h-[11px] w-[11px] shrink-0 place-items-center rounded-[2px] border"
      style={{ borderColor: veg ? "#3F8F55" : "#B5483F" }}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: veg ? "#3F8F55" : "#B5483F" }} />
    </span>
  );
}

function Cover({ venueName, onOpen, active }) {
  return (
    <div className="mb-face mb-cover" onClick={onOpen}>
      <div className="mb-frame mb-frame-1" aria-hidden />
      <div className="mb-frame mb-frame-2" aria-hidden />
      <Waves className="pointer-events-none absolute bottom-0 left-0 h-[34%] w-full text-[#C9A55C]/55" />
      <div className="relative flex h-full flex-col items-center px-8 pb-16 pt-[16%] text-center">
        <div className="mb-gold mb-serif text-[24px] font-semibold uppercase tracking-[0.5em] pl-[0.5em]">Table</div>
        <Cloche className="mt-[9%] h-12 w-16 text-[#D8B873]" />
        <div className="mb-gold mt-[6%] mb-serif text-[68px] font-medium uppercase leading-none tracking-[0.06em]">Menu</div>
        <Ornament className="mt-5 w-32 text-[#C9A55C]" />
        {venueName && (
          <div className="mt-5 mb-serif text-xl italic tracking-wide text-[#D8B873]/90">{venueName}</div>
        )}
        {active && (
          <div className="mt-auto text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D8B873]/70">Open the menu</div>
        )}
      </div>
    </div>
  );
}

function Page({ section, number, active }) {
  const scrollRef = useRef(null);
  const [more, setMore] = useState(false); // is there content below the fold?

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (el) setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
  }, []);

  useEffect(() => {
    check();
    const t = setTimeout(check, 400); // after fonts/page-turn settle
    const el = scrollRef.current;
    let ro;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(check);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    return () => {
      clearTimeout(t);
      ro?.disconnect();
    };
  }, [check, section, active]);

  const showHint = active && more;

  return (
    <div className="mb-face mb-page">
      <div className="mb-frame mb-frame-page" aria-hidden />
      <Sprig className="pointer-events-none absolute right-6 top-6 h-14 w-14 text-[#C9A55C]" />
      <div
        ref={scrollRef}
        onScroll={check}
        className={cn("mb-scroll relative h-full px-8 pb-10 pt-9", active ? "overflow-y-auto" : "overflow-hidden")}
        tabIndex={active ? 0 : -1}
        data-testid={`menu-book-page-${section.id}`}
      >
        <div className="pr-12 mb-serif text-[40px] font-semibold leading-[1.02] text-[#241A12]">{section.name}</div>
        <Ornament className="mt-4 w-40 text-[#B8913F]" />
        <ul className="mt-5">
          {section.items.map((it) => (
            <li key={it.id} className="flex items-start gap-2 py-[9px]">
              <Dot veg={it.veg} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="mb-serif text-[19.5px] font-semibold leading-snug text-[#241A12]">{it.name}</span>
                  <span aria-hidden className="mb-1 min-w-3 flex-1 border-b border-dotted border-[#B8913F]/45" />
                  <span className="mb-serif shrink-0 text-[18px] font-bold text-[#4A3722] [font-variant-numeric:lining-nums_tabular-nums]">{formatPrice(it.price)}</span>
                </div>
                {it.description && (
                  <p className="mt-0.5 mb-serif text-[15.5px] italic leading-snug text-[#6E5C47]">{it.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center mb-serif text-sm text-[#B8913F]">· {number} ·</div>
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-3 bottom-3 h-20 rounded-b-xl bg-gradient-to-t from-[#EBDFC8] via-[#EBDFC8]/80 to-transparent transition-opacity duration-300",
          more ? "opacity-100" : "opacity-0",
        )}
      />
      <button
        type="button"
        tabIndex={showHint ? 0 : -1}
        aria-hidden={!showHint}
        onClick={() => scrollRef.current?.scrollBy({ top: scrollRef.current.clientHeight * 0.75, behavior: "smooth" })}
        data-testid="menu-book-scroll-hint"
        className={cn(
          "absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#B8913F]/60 bg-[#241A12]/90 py-1.5 pl-4 pr-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#F0D89C] shadow-lg backdrop-blur-sm transition-opacity duration-300",
          showHint ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        Scroll for more dishes
        <ChevronDown strokeWidth={2} className="h-3.5 w-3.5 motion-safe:animate-bounce" />
      </button>
    </div>
  );
}

// Leather-bound menu: a cover plus one cream page per category, fanned out in 3D.
export function MenuBook({ sections, venueName }) {
  const [i, setI] = useState(0); // 0 = cover, 1..n = categories
  const touchX = useRef(null);
  const stageRef = useRef(null);
  const n = sections.length;
  const last = n; // index of the final page

  // A diet filter can shrink the book; never point past the end.
  useEffect(() => {
    if (i > last) setI(last);
  }, [i, last]);

  // Every newly opened page starts at its top.
  useEffect(() => {
    stageRef.current?.querySelector('[data-active="true"] .mb-scroll')?.scrollTo?.({ top: 0 });
  }, [i]);

  const go = (k) => setI(Math.max(0, Math.min(last, k)));
  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
  };

  const leaves = [{ id: "__cover" }, ...sections];
  const label = i === 0 ? "Cover" : sections[i - 1].name;

  return (
    <div className="mb-root" data-testid="menu-book">
      <div
        ref={stageRef}
        className="mb-stage"
        tabIndex={0}
        onKeyDown={onKey}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${venueName || "Restaurant"} menu`}
      >
        <div className="mb-glow" aria-hidden />
        {leaves.map((leaf, idx) => {
          const d = idx - i;
          return (
            <div
              key={leaf.id}
              className={cn("mb-leaf", d < 0 && "mb-gone", d > 4 && "mb-far")}
              style={{ "--d": Math.max(d, 0), zIndex: leaves.length - Math.abs(d) }}
              data-active={d === 0}
              aria-hidden={d !== 0}
              onClick={d !== 0 ? () => go(idx) : undefined}
            >
              {idx === 0 ? (
                <Cover venueName={venueName} active={d === 0} onOpen={() => d === 0 && go(1)} />
              ) : (
                <Page section={leaf} number={idx} active={d === 0} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label="Previous page"
          data-testid="menu-book-prev"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#C9A55C]/60 text-[#D8B873] transition-colors hover:bg-[#C9A55C]/15 disabled:opacity-30"
        >
          <ChevronLeft strokeWidth={1.6} className="h-5 w-5" />
        </button>
        <div className="min-w-0 text-center" role="status" aria-live="polite">
          <div className="truncate mb-serif text-xl text-[#F2EDE7]">{label}</div>
          <div className="mt-0.5 text-xs text-[#8F8781]">{i === 0 ? `${n} categories` : `${i} of ${n}`}</div>
        </div>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === last}
          aria-label="Next page"
          data-testid="menu-book-next"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#C9A55C]/60 text-[#D8B873] transition-colors hover:bg-[#C9A55C]/15 disabled:opacity-30"
        >
          <ChevronRight strokeWidth={1.6} className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <label className="sr-only" htmlFor="menu-book-jump">Jump to category</label>
        <div className="relative w-full max-w-xs">
          <select
            id="menu-book-jump"
            value={i}
            onChange={(e) => go(Number(e.target.value))}
            data-testid="menu-book-jump"
            className="w-full cursor-pointer appearance-none truncate rounded-full border border-white/10 bg-[#23201E] py-2.5 pl-5 pr-11 text-sm font-medium text-[#F2EDE7] outline-none transition-colors hover:border-[#C9A55C]/50 focus:border-[#CE6A4A]"
          >
            <option value={0}>Cover</option>
            {sections.map((s, k) => (
              <option key={s.id} value={k + 1}>{s.name}</option>
            ))}
          </select>
          <ChevronDown strokeWidth={1.6} className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B873]" />
        </div>
      </div>
    </div>
  );
}
