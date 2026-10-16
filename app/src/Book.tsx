import { useState, type ReactNode } from "react";
import { Icon } from "./ui";
import { KIKI, SPACES, clash, dayLabel, spaceOf, useStore, weekday, type Booking, DEFAULT_BOOKING } from "./store";

export const img = (f: string) => `img/${f}`;
const GREEN = "#2a392c";

function Frame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-[#1b2630]">
    <header className="flex items-center gap-3 border-b border-[#e3e8ee] px-6 py-3"><img src={img("kiki-logo.png")} alt="Kiki's" width={40} height={40} className="rounded-full" /><div><p className="text-sm font-bold">Kiki's La Quinta</p><p className="text-[11px] text-[#7c8794]">Private events</p></div><span className="ml-auto text-[11px] text-[#7c8794]">Powered by <b className="text-[#153b5b]">kneesup</b></span></header>
    {children}
  </div>;
}

/* The reservation request: the guest's first step. */
const DAYS = Array.from({ length: 25 }, (_, i) => i + 7).filter((d) => new Date(2026, 9, d).getDay() !== 1); // Kiki's is closed on Mondays
const SLOTS = ["4:30–7:30 PM", "5:00–8:00 PM", "6:00–9:00 PM"];

const Field = ({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) => <label className={`block text-xs font-semibold text-[#44525f] ${span ? "sm:col-span-2" : ""}`}>{label}<div className="mt-1.5">{children}</div></label>;
const input = "w-full rounded-lg border border-[#d9e0e7] bg-white px-3 py-2.5 text-sm font-normal text-[#1b2630] outline-none focus:border-[#2a392c]";

export function Book() {
  const { booking, page, goto, submitInquiry, reservations } = useStore();
  const [f, setF] = useState<Booking>(DEFAULT_BOOKING);
  const sp = spaceOf(f.spaceId);
  const up = (p: Partial<Booking>) => setF({ ...f, ...p });
  const taken = clash(reservations, f.day, f.time, f.space);
  const tooMany = f.guests > sp.cap, tooFew = f.guests < sp.min;
  const ok = f.name.trim() && f.email.includes("@") && f.event.trim() && f.guests > 0 && !tooMany && !taken;

  if (page === "sent") return <Frame>
    <div className="mx-auto max-w-xl px-6 py-14 text-center text-[#1b2630]">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f1e6] text-[#2f7a4d]"><Icon name="check" size={28} /></span>
      <h1 className="mt-5 text-2xl font-bold">Request sent to Kiki's</h1>
      <p className="mt-2 text-sm text-[#5b6a78]">Thanks {booking.name.split(" ")[0]}! We emailed a copy to {booking.email}. You don't pay anything yet.</p>
      <div className="mt-6 rounded-2xl border border-[#e3e8ee] p-5 text-left text-sm"><p className="font-bold">{booking.event}</p><p className="mt-1 text-xs text-[#6b7683]">{booking.space} · {dayLabel(booking.day)} · {booking.time} · {booking.guests} guests</p></div>
      <ol className="mt-6 space-y-3 text-left text-sm">{["Kiki's reviews your request and confirms the price.", "You get an email with a deposit request.", "Pay the deposit and your date is confirmed."].map((t, i) => <li key={t} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#2a392c] text-[11px] font-bold text-white">{i + 1}</span><span className="text-[#44525f]">{t}</span></li>)}</ol>
      <div className="mt-8 flex justify-center gap-3"><button onClick={() => goto("mailHost")} className="rounded-xl px-5 py-3 text-sm font-bold text-white" style={{ background: GREEN }}>See what Kiki's receives</button><button onClick={() => goto("book")} className="rounded-xl border border-[#d9e0e7] px-5 py-3 text-sm font-semibold text-[#44525f]">Make another request</button></div>
    </div>
  </Frame>;

  return <Frame>
    <div className="mx-auto max-w-5xl px-6 py-6 text-[#1b2630]">
      <h1 className="text-2xl font-bold">Request your event</h1><p className="mt-1 text-sm text-[#6b7683]">Tell us about your celebration. Kiki's will confirm availability and pricing.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={(e) => { e.preventDefault(); if (ok) { submitInquiry(f); goto("sent"); } }} className="grid gap-4 rounded-2xl border border-[#e3e8ee] p-5 sm:grid-cols-2">
          <Field label="Space" span><select value={f.spaceId} onChange={(e) => up({ spaceId: e.target.value, space: spaceOf(e.target.value).short })} className={input}>{SPACES.map((s) => <option key={s.id} value={s.id}>{s.name} (up to {s.cap})</option>)}</select></Field>
          <Field label="Date"><select value={f.day} onChange={(e) => up({ day: +e.target.value })} className={input}>{DAYS.map((d) => <option key={d} value={d}>{new Date(2026, 9, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</option>)}</select></Field>
          <Field label="Time"><select value={f.time} onChange={(e) => up({ time: e.target.value })} className={input}>{SLOTS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Number of guests"><input type="number" min={1} value={f.guests} onChange={(e) => up({ guests: Math.max(0, +e.target.value) })} className={input} />{taken && <p className="mt-1.5 text-[11px] text-[#b03a3a]">That space is already booked then. Try another time or space.</p>}{(tooMany || tooFew) && <p className={`mt-1.5 text-[11px] ${tooMany ? "text-[#b03a3a]" : "text-[#8a6114]"}`}>{tooMany ? `${sp.short} holds up to ${sp.cap} guests.` : `${sp.short} works best for ${sp.min}+ guests.`}</p>}</Field>
          <Field label="Event name"><input value={f.event} onChange={(e) => up({ event: e.target.value })} className={input} /></Field>
          <Field label="Your name"><input value={f.name} onChange={(e) => up({ name: e.target.value })} className={input} /></Field>
          <Field label="Email"><input type="email" value={f.email} onChange={(e) => up({ email: e.target.value })} className={input} /></Field>
          <Field label="Phone" span><input value={f.phone} onChange={(e) => up({ phone: e.target.value })} className={input} /></Field>
          <Field label="Anything we should know?" span><textarea value={f.note} onChange={(e) => up({ note: e.target.value })} className={`${input} min-h-24 resize-none`} /></Field>
          <div className="sm:col-span-2"><button disabled={!ok} className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: GREEN }}>Send reservation request</button></div>
        </form>
        <aside className="h-fit rounded-2xl border border-[#e3e8ee] p-5"><img src={img(sp.img)} alt="" className="h-36 w-full rounded-xl object-cover" /><h2 className="mt-4 text-sm font-bold">{sp.name}</h2><p className="mt-1 text-xs text-[#6b7683]">Kiki's La Quinta</p>
          <dl className="mt-4 space-y-2 text-xs">{[["Date", `${weekday(f.day)}, Oct ${f.day}`], ["Time", f.time], ["Guests", String(f.guests)], ["Minimum spend", "Kiki's will confirm"], ["Deposit", "Requested after approval"]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-[#7c8794]">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
          <p className="mt-4 rounded-lg bg-[#f4f7f4] p-3 text-[11px] leading-5 text-[#5b6a78]">No payment today. You'll get an email when Kiki's approves your request.</p></aside>
      </div>
    </div>
  </Frame>;
}
