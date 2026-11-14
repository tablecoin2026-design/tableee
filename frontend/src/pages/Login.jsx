import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { SUPPORT_EMAIL, mailto } from "@/lib/site";

const fieldWrap =
  "flex items-center gap-3 rounded-xl border border-[#E3B364]/35 bg-black/25 px-5 transition-colors focus-within:border-[#E3B364]/80";
const fieldInput = "w-full bg-transparent py-3.5 text-[15px] text-[#F6EBD6] outline-none placeholder:text-[#8F8478]";
const fieldLabel = "mb-2 block text-sm font-semibold text-[#F6EBD6]";
const goldLink = "font-semibold text-[#E3B364] hover:underline";

function PasswordInput({ value, onChange, testId, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={fieldWrap}>
      <input
        type={visible ? "text" : "password"}
        placeholder="Enter your password"
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
        data-testid={testId}
        className={fieldInput}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        data-testid={`${testId}-toggle`}
        className="text-[#A89C8C] hover:text-white transition-colors"
      >
        {visible ? <Eye size={19} /> : <EyeOff size={19} />}
      </button>
    </div>
  );
}

// Where to go after sign-in: the page the member came from, query string included (check-in QR codes carry one).
const returnTo = (from) => (from?.pathname ? `${from.pathname}${from.search || ""}` : "/discover");

export default function Login({ staff = false }) {
  const { user, login, loginWithCode, register, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(!staff && location.state?.mode === "create" ? "create" : "signin"); // "signin" | "create" (restaurants never self-register)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && user !== false) {
    const dest = user.role === "staff" || user.role === "admin" ? "/staff" : "/discover";
    return <Navigate to={dest} replace />;
  }

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setConfirmPassword("");
  };

  const doLogin = async (em, pw) => {
    setBusy(true);
    setError("");
    const res = await login(em, pw);
    if (res.ok && staff && res.user.role !== "staff" && res.user.role !== "admin") {
      await logout();
      setBusy(false);
      setError("This account isn't linked to a restaurant. Use member sign in instead.");
      return;
    }
    setBusy(false);
    if (res.ok) {
      toast.success(`A table awaits, ${res.user.name.split(" ")[0]}.`);
      const dest =
        res.user.role === "staff" || res.user.role === "admin"
          ? "/staff"
          : returnTo(location.state?.from);
      navigate(dest, { replace: true });
    } else {
      setError(res.error);
    }
  };

  const doCodeLogin = async () => {
    setBusy(true);
    setError("");
    const res = await loginWithCode(code);
    setBusy(false);
    if (res.ok) {
      toast.success(`Welcome, ${res.user.name}.`);
      navigate("/staff", { replace: true });
    } else {
      setError(res.error);
    }
  };

  const doRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await register(email, password, name);
    setBusy(false);
    if (res.ok) {
      toast.success(`Welcome, ${res.user.name.split(" ")[0]}.`);
      navigate(returnTo(location.state?.from), { replace: true });
    } else {
      setError(res.error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (staff && mode === "signin") {
      await doCodeLogin();
    } else if (mode === "signin") {
      await doLogin(email, password);
    } else {
      await doRegister();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E0B09] text-[#F2EDE7]">
      {/* Full-bleed restaurant photo with a warm dark wash so the text and card stay readable */}
      <img src="/hero.jpg" alt="" className="absolute inset-0 h-full w-full -scale-x-100 object-cover object-[40%_85%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E0B09]/70 via-[#0E0B09]/15 to-[#0E0B09]/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B09]/45 via-transparent to-[#0E0B09]/30" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 sm:px-10 lg:px-16">
        <Link to="/" data-testid="login-brand-link" className="flex items-center gap-3 py-7">
          <img src="/logo.png" alt="" className="h-11 w-auto" />
          <img src="/wordmark.png" alt="Table" className="h-5 w-auto" />
        </Link>

        <div className="grid flex-1 grid-cols-1 items-center gap-10 pb-12 lg:grid-cols-[1fr_minmax(480px,580px)] lg:gap-20">
          <div className="hidden lg:block lg:-translate-y-28">
            <h2 className="font-cormorant text-[56px] font-medium leading-[1.1] tracking-tight text-[#FBF1DC]">
              More than a meal,
              <br />
              <em className="font-normal">a story at every table.</em>
            </h2>
            <div className="mt-8 h-0.5 w-20 bg-[#E3B364]" />
            <div className="mt-7 text-[13px] tracking-[0.42em] text-[#F6EBD6]/85">DINE · EARN · RETURN</div>
          </div>

          <div className="relative w-full animate-fade-up rounded-[32px] border border-[#E3B364]/45 bg-gradient-to-b from-[#2A1D12]/70 to-[#0E0B09]/75 px-6 py-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-12">
            <Link
              to={staff ? "/login" : "/restaurant-login"}
              title={staff ? "Diner sign in" : "Restaurant sign in"}
              aria-label={staff ? "Diner sign in" : "Restaurant sign in"}
              data-testid={staff ? "audience-diner" : "audience-restaurant"}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-[#E3B364]/30 text-[#B8AA98] transition-colors hover:border-[#E3B364]/70 hover:text-white"
            >
              {staff ? <User strokeWidth={1.7} className="h-4 w-4" /> : <Store strokeWidth={1.7} className="h-4 w-4" />}
            </Link>

            <h1 className="font-cormorant text-center text-[52px] font-medium leading-none text-[#FBF1DC] sm:text-[60px]">
              {staff ? "Restaurant sign in" : mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-4 mb-8 text-center text-[16px] text-[#CFC3B2]">
              {staff
                ? "Manage bookings, loyalty and events for your venue."
                : mode === "signin"
                ? "Sign in to continue your dining journey."
                : "Join once. Your tier follows you to every room."}
            </p>

            <form onSubmit={submit} className="space-y-5" data-testid="login-form">
              {mode === "create" && (
                <div>
                  <label className={fieldLabel}>Name</label>
                  <div className={fieldWrap}>
                    <input
                      type="text"
                      required
                      minLength={1}
                      maxLength={80}
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="register-name-input"
                      className={fieldInput}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {staff && mode === "signin" ? (
                <div>
                  <label className={fieldLabel}>Restaurant access code</label>
                  <div className={fieldWrap}>
                    <input
                      type="text"
                      required
                      autoFocus
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      maxLength={40}
                      placeholder="e.g. MEKON-A1B2-C3D4-E5F6"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      data-testid="staff-code-input"
                      className={`${fieldInput} font-mono uppercase tracking-wider`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#A89C8C]">Your code was given to you by Table. Keep it private.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className={fieldLabel}>Email</label>
                    <div className={fieldWrap}>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="login-email-input"
                        className={fieldInput}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Password</label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      testId="login-password-input"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      minLength={6}
                    />
                    {mode === "signin" && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => toast.info("Password reset isn't available yet.")}
                          className="text-xs font-semibold text-[#E3B364] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {mode === "create" && (
                <div>
                  <label className={fieldLabel}>Confirm password</label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    testId="register-confirm-password-input"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <div
                  data-testid="login-error"
                  className="rounded-lg border-l-2 border-[#E8A33D] bg-black/35 px-3 py-2 text-sm text-[#E8A33D]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                data-testid="login-submit-button"
                className="w-full rounded-xl bg-gradient-to-b from-[#F3CB84] to-[#D9A04E] px-6 py-4 text-[16px] font-bold text-[#2A1A08] shadow-[0_10px_28px_-10px_rgba(227,179,100,0.7)] transition hover:brightness-105 disabled:opacity-60"
              >
                {busy ? "One moment" : mode === "signin" ? "Sign In" : "Create account"}
              </button>
            </form>

            {staff ? (
              <p className="mt-6 text-center text-xs leading-relaxed text-[#A89C8C]">
                Table works with partner restaurants only. Your access code comes from the Table team.
                <br />
                Lost your code? Email{" "}
                <a href={mailto("Restaurant access code")} className={goldLink}>{SUPPORT_EMAIL}</a>
              </p>
            ) : (
              <>
                <div className="mt-7 flex items-center gap-4 text-sm text-[#CFC3B2]">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>
                    {mode === "signin" ? (
                      <>
                        New here?{" "}
                        <button type="button" onClick={() => switchMode("create")} data-testid="switch-to-create" className={goldLink}>
                          Create an account
                        </button>
                      </>
                    ) : (
                      <>
                        Already a member?{" "}
                        <button type="button" onClick={() => switchMode("signin")} data-testid="switch-to-signin" className={goldLink}>
                          Sign in
                        </button>
                      </>
                    )}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {mode === "signin" && (
                  <p className="mt-5 text-center text-sm text-[#A89C8C]">
                    Restaurant staff?{" "}
                    <Link to="/restaurant-login" data-testid="restaurant-staff-signin" className={goldLink}>
                      Restaurant sign in
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
