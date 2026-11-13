import { useMemo, useRef, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, BookOpen, Heart, MapPin } from "lucide-react";
import { assetUrl } from "@/lib/api";
import { RatingBadge } from "@/components/Reviews";
import { cn } from "@/lib/utils";

export const GOLD_BTN =
  "bg-gradient-to-b from-[#F3CB84] to-[#D9A04E] text-[#2A1A08] shadow-[0_8px_24px_-8px_rgba(227,179,100,0.65)] hover:brightness-105";
const OUTLINE_BTN =
  "border border-[#E3B364]/60 bg-black/25 text-[#F6EBD6] backdrop-blur-sm hover:bg-[#E3B364]/10";
const ROUND_BTN =
  "grid h-11 w-11 place-items-center rounded-full border border-[#E3B364]/50 bg-black/40 text-[#F6EBD6] backdrop-blur-sm transition-colors hover:bg-black/60";

// Hero: the restaurant's cover plus its uploaded gallery photos as a swipeable carousel.
export function VenueHero({ venue, statusText, statusDot, rating, saved, onToggleSave, onBook, onViewMenu }) {
  const slides = useMemo(() => {
    const urls = [venue.image_url, ...(venue.photos || []).filter((p) => p.category !== "menu").map((p) => p.url)];
    return [...new Set(urls.filter(Boolean))];
  }, [venue.image_url, venue.photos]);
  const [idx, setIdx] = useState(0);
  const touchX = useRef(null);
  const n = slides.length;
  const cur = Math.min(idx, n - 1);
  const go = (k) => setIdx(((k % n) + n) % n);
  const r = rating ?? { avg: venue.rating_avg, count: venue.rating_count };
  const blurb = venue.tagline || (venue.description || "").split(". ")[0];

  return (
    <section data-testid="venue-hero">
      <div
        className="relative h-[520px] overflow-hidden rounded-[28px] border border-[#E3B364]/15 sm:h-[500px]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || n < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
        }}
      >
        {slides.map((u, i) => (
          <div
            key={u}
            aria-hidden={i !== cur}
            className={cn("absolute inset-0 transition-opacity duration-700", i === cur ? "opacity-100" : "opacity-0")}
          >
            {/* Blurred copy fills the frame; the real photo is shown whole (never cropped or zoomed) on top. */}
            <img src={assetUrl(u)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl" />
            <img
              src={assetUrl(u)}
              alt={i === 0 ? venue.name : `${venue.name} photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-contain object-top sm:object-right"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

        <div
          className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-[13px] font-semibold text-[#F6EBD6] backdrop-blur-sm sm:left-7 sm:top-7"
          data-testid="venue-status"
        >
          <span className={cn("h-2 w-2 rounded-full", statusDot)} />
          {statusText}
        </div>

        <div className="absolute inset-x-5 bottom-8 sm:inset-x-10 sm:bottom-auto sm:top-1/2 sm:-translate-y-[42%]">
          <div className="flex flex-wrap items-center gap-x-2 text-[15px] font-medium text-[#F6EBD6]/90">
            <MapPin strokeWidth={1.8} className="h-4 w-4 text-[#E3B364]" />
            <span>
              {venue.neighborhood}
              {venue.cuisine && <> · {venue.cuisine}</>}
            </span>
            {r?.count > 0 && (
              <>
                <span aria-hidden>·</span>
                <RatingBadge avg={r.avg} count={r.count} className="align-middle text-[#F6EBD6]" />
              </>
            )}
          </div>
          <h1
            className="font-cormorant mt-2 text-[64px] font-medium leading-[0.95] text-[#FBF1DC] sm:text-[88px]"
            data-testid="venue-name"
          >
            {venue.name}
          </h1>
          {blurb && <p className="mt-4 max-w-md text-[17px] leading-snug text-[#F6EBD6]/85">{blurb}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBook}
              data-testid="hero-reserve-button"
              className={cn("inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-bold transition", GOLD_BTN)}
            >
              <CalendarCheck strokeWidth={1.8} className="h-[18px] w-[18px]" />
              Book a Table
            </button>
            <button
              type="button"
              onClick={onViewMenu}
              data-testid="hero-menu-button"
              className={cn("inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors", OUTLINE_BTN)}
            >
              <BookOpen strokeWidth={1.6} className="h-[18px] w-[18px]" />
              View Menu
            </button>
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved restaurants" : "Save restaurant"}
              data-testid="venue-save-button"
              className={cn("inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors", OUTLINE_BTN)}
            >
              <Heart strokeWidth={1.7} className={cn("h-[18px] w-[18px]", saved && "fill-[#F07F5E] text-[#F07F5E]")} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {n > 1 && (
          <div className="absolute bottom-5 right-5 flex gap-2.5 sm:bottom-auto sm:right-7 sm:top-1/2 sm:-translate-y-1/2">
            <button type="button" onClick={() => go(cur - 1)} aria-label="Previous photo" data-testid="hero-prev" className={ROUND_BTN}>
              <ChevronLeft strokeWidth={1.8} className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(cur + 1)} aria-label="Next photo" data-testid="hero-next" className={ROUND_BTN}>
              <ChevronRight strokeWidth={1.8} className="h-5 w-5" />
            </button>
          </div>
        )}
        {n > 1 && (
          <div
            className="absolute bottom-5 right-5 hidden rounded-full border border-white/10 bg-black/45 px-4 py-2 text-[13px] font-medium text-[#F6EBD6] backdrop-blur-sm sm:block"
            aria-live="polite"
          >
            {cur + 1} / {n}
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Photos">
          {slides.map((u, i) => (
            <button
              key={u}
              type="button"
              role="tab"
              aria-selected={i === cur}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIdx(i)}
              className={cn("h-2 rounded-full transition-all", i === cur ? "w-5 bg-[#E3B364]" : "w-2 bg-white/25 hover:bg-white/40")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
