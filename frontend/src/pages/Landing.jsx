import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, QrCode, Gift, CalendarCheck, Leaf, UtensilsCrossed, Star, Crown, Store } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BrandLockup } from "@/components/BrandLockup";
import { FillingFastCard } from "@/components/FillingFastCard";
import { Footer } from "@/components/Footer";
import { usePageTitle } from "@/lib/usePageTitle";

const STEPS = [
  { icon: CalendarCheck, title: "Dine anywhere", body: "Book a table or walk in at any partner restaurant in the network." },
  { icon: QrCode, title: "Check in & earn", body: "Scan the code at the table. Every visit earns you points, no receipts to upload." },
  { icon: Gift, title: "Redeem where you earned", body: "Your points are yours at the restaurant that gave them, redeemed for perks right there." },
];

const TIERS = [
  { icon: Leaf, name: "Guest", pts: 0, note: "Start earning from your first visit" },
  { icon: UtensilsCrossed, name: "Regular", pts: 500, note: "Complimentary signatures and early access" },
  { icon: Star, name: "Insider", pts: 1500, note: "Curated tastings and chef's counter" },
  { icon: Crown, name: "Inner Circle", pts: 3000, note: "The network's most exclusive tables" },
];

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#CE6A4A] px-7 py-3.5 text-[15px] font-extrabold text-[#0B0A0A] hover:bg-[#E8A06E] transition-colors";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-[15px] font-bold text-white hover:bg-white/5 transition-colors";
const GOLD_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F3CB84] to-[#D9A04E] px-7 py-3.5 text-[15px] font-bold text-[#2A1A08] shadow-[0_8px_24px_-8px_rgba(227,179,100,0.6)] hover:brightness-105 transition";
const wrap = "mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-16";

// Brand backdrop, not any one restaurant's photo. Drop a photo at frontend/public/hero.jpg to use it;
// until then (or if it fails to load) the dark-and-gold gradient below is shown.
function HeroBackdrop() {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_20%,rgba(214,160,80,0.22),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_90%,rgba(206,106,74,0.16),transparent_60%),linear-gradient(160deg,#1b1713_0%,#100e0c_100%)]"
      />
      {photoOk && (
        <img
          src="/hero.jpg"
          alt=""
          onError={() => setPhotoOk(false)}
          className="absolute inset-0 h-full w-full object-cover object-[60%_80%]"
        />
      )}
    </>
  );
}

function Eyebrow({ children }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E3B364]">{children}</div>;
}

export default function Landing() {
  usePageTitle();
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    api.get("/venues").then(({ data }) => setVenues(data)).catch(() => {});
  }, []);

  if (user) {
    return <Navigate to={user.role === "staff" ? "/staff" : "/discover"} replace />;
  }

  const featured = venues.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#121110] text-[#F2EDE7]" data-testid="landing-page">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className={`${wrap} flex items-center justify-between py-4`}>
          <Link to="/" aria-label="Table home"><BrandLockup /></Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link to="/discover" className="hidden sm:inline px-4 py-2 text-sm font-semibold text-white/80 hover:text-white">
              Restaurants
            </Link>
            <Link to="/login" data-testid="landing-signin" className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white">
              Sign in
            </Link>
            <Link
              to="/login"
              state={{ mode: "create" }}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#121110] hover:bg-white/90 transition-colors"
            >
              Join free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[640px] sm:min-h-[720px] overflow-hidden">
        <HeroBackdrop />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/45 to-[#121110]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121110]/85 via-[#121110]/40 to-transparent" />
        <div className={`${wrap} relative flex min-h-[640px] sm:min-h-[720px] flex-col justify-end pb-16 sm:pb-24 pt-36`}>
          <div className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#EE9B79]">Dine · Earn · Return</div>
          <h1 className="mt-4 max-w-3xl text-5xl sm:text-7xl font-extrabold tracking-[-0.045em] leading-[0.98]">
            One membership.<br />Every table.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">
            Earn points at the restaurants you love and redeem them there, while one membership tier
            follows you to every room. Table is the loyalty and reservations network for places worth returning to.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className={btnPrimary} data-testid="landing-explore">
              Explore restaurants <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" state={{ mode: "create" }} className={btnGhost}>
              Join free
            </Link>
          </div>
          {venues.length > 0 && (
            <div className="mt-10 flex items-center gap-2 text-sm font-semibold text-white/70">
              <span className="h-2 w-2 rounded-full bg-[#7DBE8A]" />
              {venues.length} partner restaurants live now
            </div>
          )}
        </div>
      </section>

      {/* Membership */}
      <section className={`${wrap} pt-20`}>
        <Eyebrow>Membership</Eyebrow>
        <h2 className="font-cormorant mt-3 text-4xl font-medium leading-tight text-[#FBF1DC] sm:text-5xl">
          The more you dine, the more opens up
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, i) => {
            const top = i === TIERS.length - 1;
            return (
              <div
                key={t.name}
                className={
                  top
                    ? "rounded-2xl border border-[#E3B364]/70 bg-gradient-to-br from-[#3A2A14] to-[#1B140C] p-6 shadow-[0_0_40px_-12px_rgba(227,179,100,0.45)]"
                    : "rounded-2xl border border-[#E3B364]/20 bg-[#17130F] p-6"
                }
              >
                <t.icon strokeWidth={1.4} className="h-6 w-6 text-[#E3B364]" />
                <div className={`font-cormorant mt-4 text-[28px] font-semibold leading-none ${top ? "text-[#E3B364]" : "text-[#F6EBD6]"}`}>
                  {t.name}
                </div>
                <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A89C8C]">
                  {t.pts === 0 ? "Free to join" : `${t.pts.toLocaleString("en-IN")} pts`}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#CFC3B2]">{t.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className={`${wrap} pt-14`}>
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#E3B364]/20 bg-gradient-to-br from-[#1E1710] to-[#14100C] p-7 sm:p-9 lg:grid-cols-[0.8fr_2.2fr] lg:gap-12">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-cormorant mt-3 text-3xl font-medium leading-tight text-[#FBF1DC] sm:text-4xl">
              Loyalty that rewards your regular tables
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {STEPS.map((st, i) => (
              <div key={st.title}>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#E3B364]/40 text-[#E3B364]">
                  <st.icon strokeWidth={1.5} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 flex items-baseline gap-2.5 text-lg font-bold text-[#F6EBD6]">
                  <span className="text-sm font-bold text-[#E3B364]">0{i + 1}</span>
                  {st.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#B8AA98]">{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants */}
      {featured.length > 0 && (
        <section className={`${wrap} pt-20`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>The network</Eyebrow>
              <h2 className="font-cormorant mt-3 text-4xl font-medium leading-tight text-[#FBF1DC] sm:text-5xl">Rooms on Table</h2>
              <p className="mt-2 text-[16px] text-[#B8AA98]">Explore our curated partner restaurants, each with its own dining experience.</p>
            </div>
            <Link to="/discover" className="hidden whitespace-nowrap text-sm font-semibold text-[#E3B364] hover:underline sm:block">
              See all rooms →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((v) => <FillingFastCard venue={v} key={v.id} />)}
          </div>
          <Link to="/discover" className="mt-5 block text-center text-sm font-semibold text-[#E3B364] hover:underline sm:hidden">
            See all rooms →
          </Link>
        </section>
      )}

      {/* CTA + restaurants */}
      <section className="py-20">
        <div className={`${wrap} grid grid-cols-1 gap-4 md:grid-cols-2`}>
          <div className="rounded-2xl border border-[#E3B364]/30 bg-gradient-to-br from-[#2A1D10] to-[#14100C] p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#E3B364]/45 text-[#E3B364]">
              <UtensilsCrossed strokeWidth={1.5} className="h-5 w-5" />
            </span>
            <h3 className="font-cormorant mt-6 text-4xl font-medium leading-tight text-[#FBF1DC]">Ready for your first table?</h3>
            <p className="mt-3 max-w-md text-[#CFC3B2]">Create an account, earn points and unlock exclusive dining experiences. Free to join.</p>
            <Link to="/login" state={{ mode: "create" }} className={`${GOLD_CTA} mt-7`}>
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#14100C] p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#E3B364]/30 text-[#E3B364]">
              <Store strokeWidth={1.5} className="h-5 w-5" />
            </span>
            <h3 className="font-cormorant mt-6 text-4xl font-medium leading-tight text-[#FBF1DC]">A partner restaurant?</h3>
            <p className="mt-3 max-w-md text-[#CFC3B2]">Sign in with your access code to manage bookings, rewards and events for your venue.</p>
            <Link
              to="/restaurant-login"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-[#E3B364]/60 px-7 py-3.5 text-[15px] font-semibold text-[#F6EBD6] transition-colors hover:bg-[#E3B364]/10"
            >
              Restaurant sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
