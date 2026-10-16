import { useState, type ReactNode } from "react";
import { Icon, money } from "./ui";
import { dayLabel, first, useStore } from "./store";
import { img } from "./Book";

const field = "w-full rounded-lg border border-[#dfe7ee] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#19334c] outline-none focus:border-[#55b6c3]";

function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f3f6fa] text-[#19334c]">
    <header className="flex items-center gap-3 border-b border-[#e5ebf1] bg-white px-6 py-3">
      <img src={img("kiki-logo.png")} alt="Kiki's" width={40} height={40} className="rounded-full" />
      <div><p className="text-sm font-bold text-[#102b46]">Kiki's La Quinta</p><p className="text-[11px] text-[#7c8a9b]">Deposit payment</p></div>
      <span className="ml-auto text-[11px] text-[#7c8a9b]">Powered by <b className="text-[#153b5b]">kneesup</b></span>
    </header>
    {children}
  </div>;
}

/** The payment link from Allison's approval email, then the confirmation. Not the guest portal. */
export default function Checkout() {
  const s = useStore();
  const b = s.booking;
  const [busy, setBusy] = useState(false);
  const pct = b.total ? Math.round((b.deposit / b.total) * 100) : 50;
  const showPaid = s.page === "confirmed" || s.stage === "confirmed";

  if (showPaid) return <Shell>
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f1e6] text-[#2f7a4d]"><Icon name="check" size={28} /></span>
      <h1 className="mt-5 text-2xl font-bold text-[#102b46]">Reservation confirmed</h1>
      <p className="mt-2 text-sm leading-6 text-[#5f7184]">Hi {first(b.name)}. Your deposit of {money(b.deposit)} is received, and <b>{b.event}</b> is confirmed at Kiki's La Quinta.</p>
      <div className="mt-6 rounded-2xl border border-[#e5ebf1] bg-white p-5 text-left text-sm">
        <p className="font-bold text-[#102b46]">{b.event}</p>
        <p className="mt-1 text-xs text-[#7c8a9b]">{b.space} · {dayLabel(b.day)} · {b.time} · {b.guests} guests</p>
        <dl className="mt-4 space-y-2 border-t border-[#eef2f6] pt-4 text-xs">{[["Deposit received", money(b.deposit)], [`Balance due Oct ${b.day - 1}`, money(Math.max(0, b.total - b.deposit))]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-[#7c8a9b]">{k}</dt><dd className="font-bold text-[#102b46]">{v}</dd></div>)}</dl>
      </div>
      <button onClick={() => s.goto("hostbook")} className="mt-8 rounded-xl bg-[#153b5b] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f2f4b]">See it in the host portal</button>
    </div>
  </Shell>;

  const pay = () => { if (busy) return; setBusy(true); window.setTimeout(() => { s.payDeposit(); s.goto("confirmed"); }, 700); };
  return <Shell>
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={(e) => { e.preventDefault(); pay(); }} className="rounded-2xl border border-[#e5ebf1] bg-white p-6">
        <h1 className="text-xl font-bold text-[#102b46]">Pay your deposit</h1>
        <p className="mt-1 text-sm text-[#7c8a9b]">This is the payment link from Kiki's. {pct}% is due now. The rest is due before the event.</p>
        <div className="mt-5 rounded-xl bg-[#f4f7fa] p-4 text-center"><p className="text-[11px] font-bold uppercase text-[#7c8a9b]">Deposit due now</p><p className="mt-1 text-3xl font-bold text-[#102b46]">{money(b.deposit)}</p></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-[#445a6f] sm:col-span-2">Card number<input className={`${field} mt-1.5`} defaultValue="4242 4242 4242 4242" /></label>
          <label className="text-xs font-bold text-[#445a6f]">Expiry<input className={`${field} mt-1.5`} defaultValue="12 / 28" /></label>
          <label className="text-xs font-bold text-[#445a6f]">CVC<input className={`${field} mt-1.5`} defaultValue="123" /></label>
          <label className="text-xs font-bold text-[#445a6f] sm:col-span-2">Name on card<input className={`${field} mt-1.5`} defaultValue={b.name} /></label>
        </div>
        <p className="mt-3 text-[11px] text-[#8a98a8]">Demo only. No real payment is taken.</p>
        <button disabled={busy || !b.deposit} className="mt-5 w-full rounded-xl bg-[#153b5b] py-3.5 text-sm font-bold text-white hover:bg-[#0f2f4b] disabled:opacity-50">{busy ? "Processing…" : `Pay ${money(b.deposit)} deposit`}</button>
      </form>
      <aside className="h-fit rounded-2xl border border-[#e5ebf1] bg-white p-5">
        <p className="text-sm font-bold text-[#102b46]">{b.event}</p>
        <p className="mt-1 text-xs text-[#7c8a9b]">Kiki's La Quinta · {b.space}<br />{dayLabel(b.day)}, {b.time}<br />{b.guests} guests · {b.name}</p>
        <dl className="mt-4 space-y-2 border-t border-[#eef2f6] pt-4 text-xs">{[["Event total", money(b.total)], [`Deposit (${pct}%)`, money(b.deposit)], ["Due later", money(Math.max(0, b.total - b.deposit))]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-[#7c8a9b]">{k}</dt><dd className="font-bold text-[#102b46]">{v}</dd></div>)}</dl>
      </aside>
    </div>
  </Shell>;
}
