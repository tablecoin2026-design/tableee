import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Bell, Calendar, Clock, MapPin, MessageSquare, ChefHat, CalendarCheck, Users, Gift, Sparkles, Leaf, ChevronRight, ArrowRight, Star, Ticket } from "lucide-react";
import { toast } from "sonner";
import { api, assetUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { queueLabel } from "@/components/StatusIndicator";
import { fillingFastStatus, isClosed, closedLabel } from "@/components/FillingFastCard";
import { ConciergeModal } from "@/components/ConciergeModal";
import { BookingModal } from "@/components/BookingModal";
import { PhotoGallery } from "@/components/PhotoGallery";
import { MenuSection } from "@/components/Menu";
import { ReviewsSection } from "@/components/Reviews";
import { VenueHero, GOLD_BTN } from "@/components/VenueHero";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/lib/usePageTitle";
import { cn } from "@/lib/utils";

const TIER_ORDER = ["Guest", "Regular", "Insider", "Inner Circle"];

export default function VenueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { has, toggle } = useFavorites();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [conciergePreset, setConciergePreset] = useState({});
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loyalty, setLoyalty] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);
  const [rating, setRating] = useState(null);
  usePageTitle(venue?.name);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api.get(`/venues/${id}`);
        if (!cancelled) setVenue(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || (user.role !== "member" && user.role !== "admin")) return;
    let cancelled = false;
    async function loadLoyalty() {
      try {
        const { data } = await api.get(`/venues/${id}/loyalty`);
        if (!cancelled) setLoyalty(data);
      } catch {
        // no-op — loyalty card just won't render
      }
    }
    loadLoyalty();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // Browsing is public; anything that acts on the member's account needs a sign-in first.
  const requireLogin = (action) => () => {
    if (!user) {
      toast.message("Sign in to continue.");
      navigate("/login", { state: { from: { pathname: `/venues/${id}` } } });
      return;
    }
    action();
  };

  async function handleRedeem(reward) {
    if (!loyalty || loyalty.balance < reward.cost || redeemingId) return;
    setRedeemingId(reward.id);
    try {
      const { data } = await api.post(`/venues/${id}/loyalty/redeem`, { reward_id: reward.id });
      toast.success(`${reward.name} redeemed. Show this at the table: ${data.redemption.code}`);
      setLoyalty((prev) => (prev ? { ...prev, balance: data.balance } : prev));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not redeem right now.");
    } finally {
      setRedeemingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1100px] px-3 sm:px-6 space-y-4" aria-busy="true" data-testid="venue-skeleton">
        <Skeleton className="h-[420px] rounded-2xl bg-white/[0.06]" />
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4">
          <Skeleton className="h-40 rounded-2xl bg-white/[0.06]" />
          <Skeleton className="h-40 rounded-2xl bg-white/[0.06]" />
        </div>
        <Skeleton className="h-56 rounded-2xl bg-white/[0.06]" />
      </div>
    );
  }
  if (!venue) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-center">
        <div className="text-sm text-[#8F8781]">This room could not be found.</div>
        <Link to="/discover" className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2 text-sm font-semibold">Return</Link>
      </div>
    );
  }

  const userTierIdx = TIER_ORDER.indexOf(user?.tier || "Guest");
  const { dot: statusDot } = fillingFastStatus(venue);
  const statusText = isClosed(venue)
    ? venue.is_open === false
      ? closedLabel(venue)
      : "Closed for the night"
    : venue.availability === "fully_booked"
      ? "Fully booked"
      : venue.status === "At Capacity"
          ? "At capacity"
          : venue.status === "Filling In"
            ? "Filling in"
            : "Quiet · seat now";
  const card = "rounded-3xl border border-[#E3B364]/20 bg-[#13110F] p-6";
  const heading =
    "font-cormorant relative pb-3 text-[34px] font-semibold leading-none text-[#F6EBD6] after:absolute after:bottom-0 after:left-0 after:h-px after:w-9 after:bg-[#E3B364]";
  const jump = (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openConcierge = (preset = {}) => requireLogin(() => {
    setConciergePreset(preset);
    setConciergeOpen(true);
  })();
  const hasLoyalty = !!(loyalty && (loyalty.balance > 0 || loyalty.config.rewards.length > 0));
  const quickActions = [
    {
      icon: Bell,
      label: "Speak with\nthe Room",
      testId: "quick-concierge",
      onClick: () => openConcierge(),
    },
    {
      icon: Users,
      label: "Private Dining\n& Groups",
      testId: "quick-private-dining",
      onClick: () =>
        openConcierge({ mode: "group" }),
    },
    {
      icon: Ticket,
      label: "Ongoing\nEvents",
      testId: "quick-events",
      onClick: () => (venue.events?.length ? jump("#venue-events") : toast.message(`No events scheduled at ${venue.name} right now.`)),
    },
    {
      icon: Star,
      label: "Earn Rewards\nHere",
      testId: "quick-rewards",
      onClick: () => (hasLoyalty ? jump("#venue-loyalty") : requireLogin(() => navigate(`/checkin/${venue.id}`))()),
    },
  ];
  const facts = [
    { icon: Clock, label: "Hours", value: venue.hours },
    { icon: MapPin, label: "Neighborhood", value: venue.neighborhood },
    {
      icon: Leaf,
      label: "Room energy",
      value: (
        <span className="inline-flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", statusDot)} />
          {venue.status}
        </span>
      ),
    },
    venue.queue_length != null && {
      icon: Users,
      label: "Waitlist",
      testId: "venue-queue",
      value: (
        <>
          {queueLabel(venue.queue_length)}
          {venue.wait_minutes > 0 && <span className="text-[#8F8781]"> · ~{venue.wait_minutes} min</span>}
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="relative mx-auto max-w-[1180px] space-y-6 overflow-x-clip px-3 pb-8 sm:px-6" data-testid="venue-detail-page">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[40%] -z-10 h-[420px] w-[420px] rounded-full bg-[#B8742A]/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-[20%] -z-10 h-[420px] w-[420px] rounded-full bg-[#B8742A]/10 blur-3xl" />

      <VenueHero
        venue={venue}
        statusText={statusText}
        statusDot={statusDot}
        rating={rating}
        saved={has(venue.id)}
        onToggleSave={() => toggle(venue.id)}
        onBook={requireLogin(() => setBookingOpen(true))}
        onViewMenu={() => jump('[data-testid="venue-menu"]')}
      />

      {/* About + quick actions | facts */}
      <div className="grid grid-cols-1 items-start gap-8 pt-2 md:grid-cols-[1.45fr_1fr]">
        <div className="space-y-10 px-1 sm:px-3">
          <section className="relative">
            <svg aria-hidden viewBox="0 0 220 90" className="pointer-events-none absolute -top-2 right-0 hidden h-24 w-56 text-[#E3B364]/15 sm:block" fill="none" stroke="currentColor" strokeWidth="0.8">
              {Array.from({ length: 9 }, (_, k) => (
                <path key={k} d={`M0 ${70 + k * 2} C 40 ${40 - k * 2}, 90 ${95 - k * 3}, 220 ${10 + k * 4}`} />
              ))}
            </svg>
            <h2 className={heading}>About {venue.name}</h2>
            <p className="relative mt-6 max-w-xl text-[18px] leading-relaxed text-[#D6CCBC]">{venue.description}</p>
            {venue.vibes?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2" data-testid="venue-vibes">
                {venue.vibes.map((v) => (
                  <span key={v} className="rounded-full border border-[#E3B364]/30 px-3.5 py-1 text-xs font-semibold text-[#E9D3A6]">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className={cn(heading, "text-[28px]")}>Quick Actions</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((a) => (
                <button
                  key={a.testId}
                  type="button"
                  onClick={a.onClick}
                  data-testid={a.testId}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-[#E3B364]/25 bg-[#12100E]/80 px-3 py-6 text-center text-[15px] leading-snug text-[#F3E9D8] transition-colors hover:border-[#E3B364]/60 hover:bg-[#1A1612]"
                >
                  <a.icon strokeWidth={1.4} className="h-8 w-8 text-[#E3B364]" />
                  <span className="whitespace-pre-line">{a.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-[#E3B364]/30 bg-gradient-to-b from-[#16130F] to-[#0F0D0B] px-7 py-3">
          {facts.map((f, i) => (
            <div
              key={f.label}
              data-testid={f.testId}
              className={cn("flex items-center gap-5 py-5", i > 0 && "border-t border-[#E3B364]/15")}
            >
              <f.icon strokeWidth={1.4} className="h-6 w-6 shrink-0 text-[#E3B364]" />
              <div>
                <div className="text-[13px] text-[#9A9082]">{f.label}</div>
                <div className="text-[18px] font-semibold text-[#F6EBD6]">{f.value}</div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <MenuSection menu={venue.menu} photos={venue.photos} heading={heading} card={card} venueName={venue.name} />

      <PhotoGallery photos={venue.photos} heading={heading} card={card} />

      {/* Signature offerings */}
      {(venue.signature_offerings || []).length > 0 && (
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className={heading}>What regulars order</h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E3B364]">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3">
            {venue.signature_offerings.map((o, i) => (
              <div
                key={o.name}
                className={cn("flex items-center gap-5 py-4", i > 0 && "border-t border-white/[0.08]")}
                data-testid={`offering-${i}`}
              >
                <span className="w-6 text-sm font-bold text-[#E3B364] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[17px] font-semibold">{o.name}</span>
                <span className="text-sm text-[#8F8781]">{o.order_count} returned</span>
                <ChevronRight className="h-4 w-4 text-[#8F8781]" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loyalty program — points earned & spent only at this restaurant */}
      {loyalty && (loyalty.balance > 0 || loyalty.config.rewards.length > 0) && (
        <section id="venue-loyalty" className={card} data-testid="venue-loyalty">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className={heading}>Your loyalty at {venue.name}</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#E3B364]" data-testid="venue-loyalty-balance">
                {loyalty.balance}
              </span>
              <span className="text-xs text-[#8F8781]">points here</span>
            </div>
          </div>
          {loyalty.config.rewards.length > 0 ? (
            <div className="mt-4 space-y-3">
              {loyalty.config.rewards.map((r) => {
                const affordable = loyalty.balance >= r.cost;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center justify-between gap-6 rounded-xl bg-[#1F1D1B] p-4",
                      !affordable && "opacity-50",
                    )}
                    data-testid={`venue-reward-${r.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <Gift strokeWidth={1.5} className="h-5 w-5 text-[#E3B364] mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold">{r.name}</div>
                        <p className="text-sm text-[#8F8781] mt-0.5">{r.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#E3B364]">{r.cost} pts</span>
                      <button
                        onClick={() => handleRedeem(r)}
                        disabled={!affordable || redeemingId === r.id}
                        data-testid={`redeem-venue-reward-${r.id}`}
                        className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold hover:border-[#E3B364] disabled:cursor-not-allowed"
                      >
                        {redeemingId === r.id ? "Redeeming…" : "Redeem"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#8F8781] flex items-center gap-2">
              <Sparkles strokeWidth={1.5} className="h-4 w-4" />
              Dine in or book a table to start earning points here.
            </p>
          )}
        </section>
      )}

      <ReviewsSection venueId={venue.id} user={user} card={card} heading={heading} onSummary={setRating} />

      {/* Kitchen + calendar | CTA */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          {venue.chef && (
            <section className={card}>
              <h2 className={heading}>In the kitchen</h2>
              <div className="mt-4 flex items-start gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#33302D]">
                  <ChefHat strokeWidth={1.4} className="h-7 w-7 text-[#E3B364]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#E3B364]">Chef</div>
                  <div className="text-xl font-bold">{venue.chef}</div>
                  <p className="mt-1 text-sm text-[#8F8781] leading-relaxed">
                    Leads the {venue.cuisine || "kitchen"} at {venue.name}. Menu evolves with the
                    season; recognition comes from returning guests.
                  </p>
                </div>
              </div>
            </section>
          )}

          {venue.events?.length > 0 && (
            <section id="venue-events" className={card}>
              <h2 className={heading}>On the calendar</h2>
              <div className="mt-4 space-y-5">
                {venue.events.map((e) => {
                  const gated = e.tier_required && TIER_ORDER.indexOf(e.tier_required) > userTierIdx;
                  return (
                    <div key={e.id} className="flex items-start gap-5" data-testid={`event-${e.id}`}>
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#33302D]">
                        <Calendar strokeWidth={1.4} className="h-7 w-7 text-[#E3B364]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-[#8F8781] tabular-nums">
                          {e.date} · {e.time}
                        </div>
                        <div className="text-xl font-bold">{e.title}</div>
                        <p className="mt-1 text-sm text-[#8F8781] leading-relaxed">{e.description}</p>
                        {e.tier_required && (
                          <div className="mt-2 text-xs font-bold text-[#E3B364]">
                            {gated ? `${e.tier_required} Access` : `Open to ${e.tier_required}+`}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 mt-2 text-[#8F8781]" />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <section className={cn(card, "p-7")}>
          <div className="text-sm text-[#B8B2AA]">A moment awaits</div>
          <div className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight">
            Begin your Table at {venue.name}.
          </div>
          <button
            onClick={requireLogin(() => setBookingOpen(true))}
            data-testid="reserve-table-button"
            className={cn("mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-extrabold transition", GOLD_BTN)}
          >
            <CalendarCheck strokeWidth={1.8} className="h-4 w-4" />
            Reserve a table
          </button>
          <button
            onClick={() => openConcierge()}
            data-testid="speak-with-room-button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#E3B364]/60 py-4 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <MessageSquare strokeWidth={1.6} className="h-4 w-4" />
            Speak with the room
          </button>
          <Link
            to={`/checkin/${venue.id}`}
            data-testid="begin-ritual-button"
            className="mt-4 inline-block text-sm text-[#8F8781] hover:text-white transition-colors"
          >
            Or check in on arrival
          </Link>
        </section>
      </div>

      {conciergeOpen && <ConciergeModal venue={venue} onClose={() => setConciergeOpen(false)} {...conciergePreset} />}
      {bookingOpen && <BookingModal venue={venue} onClose={() => setBookingOpen(false)} />}
    </div>
  );
}
