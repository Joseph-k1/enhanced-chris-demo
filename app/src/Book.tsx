import { useState, type ReactNode } from "react";
import { Icon } from "./ui";
import { KIKI, SPACES, clash, dayLabel, spaceOf, useStore, type Booking, DEFAULT_BOOKING } from "./store";

export const img = (f: string) => `img/${f}`;
const NAVY = "#0f2c4c";
const ROOMS = SPACES.filter((s) => s.id !== "buyout");
const SLOTS = ["4:30 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];
const range = (a: number, b: number) => `${SLOTS[a].replace(/ [AP]M/, "")}–${SLOTS[b]}`;
const DESC: Record<string, string> = {
  semi: "Large-party dining beside the disco ball. Set for birthdays and rehearsal dinners of up to seventy-five.",
  main: "The long main dining room. A seated celebration for up to a hundred guests.",
  patio: "The outdoor patio under the palms, for dinners that run into the evening.",
};

const Pbtn = ({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) =>
  <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex h-[37px] items-center justify-center gap-1 whitespace-nowrap rounded-3xl px-[18px] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${className}`} style={{ background: NAVY }}>{children}</button>;
const Obtn = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) =>
  <button type="button" onClick={onClick} className="inline-flex h-[37px] items-center rounded-3xl border border-[#d1d5db] bg-white px-5 text-sm font-medium text-[#374151] hover:bg-[#f7f9fc]">{children}</button>;
const Top = ({ children }: { children: ReactNode }) =>
  <div className="border-b border-[#e2e8f0] bg-white"><div className="mx-auto flex h-[52px] max-w-[914px] items-center gap-3 px-5">{children}</div></div>;
const Foot = () => <div className="mt-7 flex h-[52px] items-center justify-center gap-2 border-t border-[#e2e8f0] bg-white text-xs text-[#6b7280]">Powered by <b className="text-sm tracking-tight" style={{ color: NAVY }}>kneesup</b></div>;
const Back = ({ onClick, children }: { onClick: () => void; children: ReactNode }) =>
  <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-xs text-[#374151]"><span className="grid size-[22px] place-items-center rounded-full bg-[#f3f4f6]"><span className="rotate-180"><Icon name="chevron" size={12} /></span></span>{children}</button>;
const Rail = ({ step }: { step: 1 | 2 }) =>
  <div className="flex gap-1.5">{[1, 2].map((n) => <i key={n} className={`grid size-[22px] place-items-center rounded-full text-[11px] font-semibold not-italic ${n === step ? "text-white" : "bg-[#e5e7eb] text-[#6b7280]"}`} style={n === step ? { background: NAVY } : undefined}>{n}</i>)}</div>;
const Head = ({ step }: { step: 1 | 2 }) =>
  <div className="mb-[18px] flex items-start justify-between gap-4"><div><h1 className="m-0 text-xl font-semibold leading-tight">Make a reservation</h1><p className="mt-1.5 text-sm font-medium text-[#6b7280]">Book the full venue or a single space for your event.</p></div><Rail step={step} /></div>;
const Pc = ({ on, onClick, wide, photo, name, label }: { on: boolean; onClick: () => void; wide?: boolean; photo: string; name: string; label: string }) =>
  <button type="button" onClick={onClick} className={`flex-none overflow-hidden rounded-xl border bg-white p-0 text-left ${on ? "shadow-[0_0_0_2px_#0f2c4c]" : "border-[#e2e8f0]"}`} style={{ flexBasis: wide ? 260 : 200, borderColor: on ? NAVY : undefined }}>
    <div className="h-[92px] overflow-hidden bg-[#0f2540]"><img src={photo} alt="" className="size-full object-cover" /></div>
    <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-semibold">{name}<span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${on ? "text-white" : "bg-[#f3f4f6] text-[#6b7280]"}`} style={on ? { background: NAVY } : undefined}>{label}</span></div>
  </button>;

const days = () => {
  const start = new Date(2026, 8, 27), out: { d: number; ok: boolean }[] = [];
  for (let n = 0; n < 35; n++) { const dt = new Date(start); dt.setDate(start.getDate() + n); out.push({ d: dt.getDate(), ok: dt.getMonth() === 9 && dt.getDate() >= 7 && dt.getDay() !== 1 }); }
  return out;
};

export function Book() {
  const { booking, page, set, goto, submitInquiry, reservations } = useStore();
  const [f, setF] = useState<Booking>(DEFAULT_BOOKING);
  const [start, setStart] = useState(2);
  const [end, setEnd] = useState(5);
  const up = (p: Partial<Booking>) => setF((c) => ({ ...c, ...p }));
  const pick = (id: string) => { const s = spaceOf(id); up({ spaceId: id, space: s.short }); };
  const time = range(start, end);
  const taken = clash(reservations, f.day, time, f.space);
  const okTime = end > start;
  const view = page === "sent" ? "sent" : page === "details" || page === "checkout" || page === "form" ? "details" : page === "wizard" || page === "book" ? "wizard" : "venue";
  const go = (slide: string) => goto(slide);
  const field = "h-11 w-full rounded-lg border border-[#e2e8f0] bg-[#f7f9fc] px-3 text-[13px] outline-none focus:border-[#1d8fa5]";

  if (view === "sent") return <div className="min-h-screen bg-[#f3f6fb] text-[#0f1f2e]">
    <Top><Back onClick={() => go("venue")}>Back to Home</Back></Top>
    <div className="mx-auto max-w-[914px] px-5 pt-8">
      <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 pb-8 pt-16 text-center">
        <div className="mx-auto flex max-w-[460px] flex-col items-center">
          <span className="grid size-24 place-items-center rounded-full bg-[rgba(16,185,129,.1)]"><span className="grid size-14 place-items-center rounded-full bg-[#10b981] text-white"><Icon name="check" size={28} /></span></span>
          <h1 className="mt-8 text-xl font-bold">Reservation Request Sent!</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b7280]">Thanks {booking.name.split(" ")[0]}. Your request with <b className="text-[#0f1f2e]">{KIKI.name}</b> is in. The host will review it and email you a quote. Nothing is paid yet.</p>
          <div className="mt-6 w-full rounded-2xl border border-[#e2e8f0] p-4 text-left text-sm"><p className="font-bold">{booking.event}</p><p className="mt-1 text-xs text-[#6b7280]">{booking.space} · {dayLabel(booking.day)} · {booking.time} · {booking.guests} guests</p></div>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><Pbtn onClick={() => go("mailHost")}>See what Kiki's receives</Pbtn><Obtn onClick={() => go("venue")}>Back to Home</Obtn></div>
        </div>
        <p className="mx-auto mt-12 w-fit max-w-full rounded-lg bg-[#e6f4f7] px-4 py-3 text-left text-xs leading-5 text-[#1d8fa5]"><b>Note:</b> Have more questions? Contact support at support@kneesupvenues.com.</p>
      </div>
    </div>
    <Foot />
  </div>;

  if (view === "details") {
    const ok = f.name.trim() && f.email.includes("@") && f.guests >= 1;
    return <div className="min-h-screen bg-[#f3f6fb] text-[#0f1f2e]">
      <Top><Back onClick={() => { set({ page: "wizard" }); go("book"); }}>Back</Back></Top>
      <div className="mx-auto max-w-[914px] px-5 pt-6">
        <Head step={2} />
        <div className="flex flex-col gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-6">
          <div><h2 className="m-0 text-base font-semibold">Confirm reservation details</h2><p className="mt-1.5 text-[13px] text-[#6b7280]">Review your reservation details. Kiki's will send a quote after they approve.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-[13px] font-medium">Full Name<input className={field} value={f.name} onChange={(e) => up({ name: e.target.value })} placeholder="Enter your full name" /></label>
            <label className="flex flex-col gap-2 text-[13px] font-medium">Your email address<input className={field} type="email" value={f.email} onChange={(e) => up({ email: e.target.value })} placeholder="Enter your email" /></label>
            <label className="flex flex-col gap-2 text-[13px] font-medium">Phone Number<input className={field} value={f.phone} onChange={(e) => up({ phone: e.target.value })} placeholder="Enter your phone number" /></label>
            <label className="flex flex-col gap-2 text-[13px] font-medium">How many guest?<input className={field} type="number" min={1} value={f.guests} onChange={(e) => up({ guests: Math.max(1, +e.target.value || 1) })} placeholder="Enter number of people" /></label>
            <label className="flex flex-col gap-2 text-[13px] font-medium sm:col-span-2">Describe your event<textarea className={`${field} min-h-[104px] py-3 leading-5`} value={f.note} onChange={(e) => up({ note: e.target.value })} placeholder="Please provide details about your event or any additional information" /></label>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">
            <div className="px-4 pb-3.5 pt-4"><h3 className="m-0 text-sm font-semibold">Payment Details</h3><p className="mt-1.5 text-xs text-[#9ca3af]">Estimated minimum price and deposit</p></div>
            <div className="border-t border-[#e2e8f0] bg-[#e6f4f7] px-4 py-4 text-[13px] leading-5 text-[#1d8fa5]">Please contact the venue for a custom pricing quote tailored to your event. Nothing is charged today.</div>
            <div className="flex justify-between border-t border-[#e2e8f0] px-4 py-3.5 text-[13px] font-semibold"><span>Estimated Minimum Price</span><span>Contact for pricing</span></div>
          </div>
          <div className="flex justify-end gap-3"><Obtn onClick={() => go("venue")}>Cancel</Obtn><Pbtn disabled={!ok} onClick={() => { if (!ok) return; submitInquiry({ ...f, time }); go("sent"); }}>Reserve Now</Pbtn></div>
        </div>
      </div>
      <Foot />
    </div>;
  }

  if (view === "wizard") {
    const buyout = f.spaceId === "buyout";
    return <div className="min-h-screen bg-[#f3f6fb] text-[#0f1f2e]">
      <Top><Back onClick={() => go("venue")}>Back</Back></Top>
      <div className="mx-auto max-w-[914px] px-5 pt-6">
        <Head step={1} />
        <div className="flex flex-col gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-6">
          <section><h2 className="m-0 text-sm font-semibold">Select venue</h2><p className="mb-3 mt-1 text-xs leading-4 text-[#6b7280]">Select a venue to book it in full, or pick a venue first then choose one space</p>
            <div className="flex gap-3 overflow-x-auto p-0.5"><Pc on wide photo={img("kiki-dining.jpg")} name={KIKI.name} label="Selected" onClick={() => pick("buyout")} /></div>
          </section>
          <div className="h-px bg-[#e2e8f0]" />
          <section><h2 className="m-0 text-sm font-semibold">Select space <em className="font-normal not-italic text-[#6b7280]">(optional)</em></h2>
            <p className="mb-3 mt-1 text-xs leading-4 text-[#6b7280]">{buyout ? <><b>{KIKI.name}</b> is booked as a full venue. Choose a space below only if you want a single area instead.</> : <>Booking a single space at <b>{KIKI.name}</b>. Click the selected space again to switch back to full venue.</>}</p>
            <div className="flex gap-3 overflow-x-auto p-0.5">{ROOMS.map((s) => <Pc key={s.id} on={f.spaceId === s.id} photo={img(s.img)} name={s.short} label={f.spaceId === s.id ? "Selected" : "Select"} onClick={() => pick(f.spaceId === s.id ? "buyout" : s.id)} />)}</div>
          </section>
          <div className="h-px bg-[#e2e8f0]" />
          <section><h2 className="m-0 text-sm font-semibold">Select date & time</h2><p className="mb-3 mt-1 text-xs text-[#6b7280]">Choose date, time, & duration of your reservation.</p>
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
              <div className="flex-[1.3] rounded-xl border border-[#e2e8f0] p-3.5">
                <div className="mb-2.5 text-center text-[13px] font-semibold">October 2026</div>
                <div className="grid grid-cols-7 gap-0.5">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((x) => <span key={x} className="py-1 text-center text-[11px] font-medium text-[#9ca3af]">{x}</span>)}
                  {days().map((x, i) => <button key={i} type="button" disabled={!x.ok} onClick={() => up({ day: x.d })} className={`h-[34px] rounded-lg text-[13px] disabled:cursor-default disabled:text-[#d1d5db] ${x.ok && x.d === f.day ? "font-semibold text-white" : "hover:bg-[#f3f4f6] disabled:hover:bg-transparent"}`} style={x.ok && x.d === f.day ? { background: NAVY } : undefined}>{x.d}</button>)}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 gap-2.5">{(["start", "end"] as const).map((key) => <div key={key} className="flex max-h-[322px] min-w-0 flex-1 flex-col gap-1.5 overflow-y-auto rounded-xl border border-[#e2e8f0] p-2.5">
                <h4 className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">{key === "start" ? "Start time" : "End time"}</h4>
                {SLOTS.map((t, k) => <button key={t} type="button" onClick={() => key === "start" ? setStart(k) : setEnd(k)} className="h-8 flex-none rounded-lg border border-[#e2e8f0] bg-white text-xs hover:bg-[#f3f4f6]" style={(key === "start" ? start : end) === k ? { background: NAVY, borderColor: NAVY, color: "#fff" } : undefined}>{t}</button>)}
              </div>)}</div>
            </div>
          </section>
          <div className="h-px bg-[#e2e8f0]" />
          <section><h2 className="m-0 text-sm font-semibold">Reservation summary</h2><p className="mb-3 mt-1 text-xs text-[#6b7280]">Confirm your date, time, & duration of your reservation.</p>
            <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">{[["Date", dayLabel(f.day)], ["Time", okTime ? `${SLOTS[start]} – ${SLOTS[end]}` : "—"], ["Total duration", okTime ? `${end - start} hour${end - start === 1 ? "" : "s"}` : "0 hours"]].map(([k, v], i) => <div key={k} className={`flex justify-between gap-3 px-3.5 py-3 text-[13px] ${i ? "border-t border-[#e2e8f0]" : ""}`}><span className="text-[#6b7280]">{k}</span><b className="font-semibold">{v}</b></div>)}</div>
            {taken && <p className="mt-2 text-xs font-medium text-[#ef4444]">That space is already booked then. Try another time or space.</p>}
          </section>
          <div className="flex items-center justify-end gap-3.5">{!okTime && <span className="mr-auto text-xs font-medium text-[#ef4444]">Choose an end time after the start time.</span>}
            <button type="button" onClick={() => go("venue")} className="text-sm font-medium text-[#6b7280] hover:text-[#0f1f2e]">Cancel</button>
            <Pbtn disabled={!okTime || !!taken} onClick={() => { if (!okTime || taken) return; up({ time }); set({ page: "details" }); go("checkout"); }}>Continue reservation</Pbtn>
          </div>
        </div>
      </div>
      <Foot />
    </div>;
  }

  return <div className="min-h-screen bg-[#f3f6fb] text-[#0f1f2e]">
    <Top><div className="flex items-center gap-2.5 text-[13px] font-semibold"><img src={img("kiki-logo.png")} alt="" width={32} height={32} className="rounded-lg" />{KIKI.name}</div></Top>
    <div className="h-[250px] overflow-hidden bg-[#0f2540]"><img src={img("kiki-dining.jpg")} alt="" className="size-full object-cover" /></div>
    <div className="mx-auto max-w-[720px] px-5 pt-[22px]">
      <div className="flex items-start justify-between gap-4 pb-3.5 max-[480px]:flex-col">
        <div><h1 className="m-0 text-2xl font-semibold leading-tight">{KIKI.name}</h1><p className="mt-1.5 text-[15px] font-medium text-[#1d8fa5]">{KIKI.addr}</p></div>
        <Pbtn onClick={() => { pick("buyout"); go("book"); }}>Book Full Venue</Pbtn>
      </div>
      <p className="mb-3 text-sm leading-6 text-[#6b7280]">An Italian restaurant in La Quinta with a disco-ball dining room, a patio under the palms, and space for birthdays, rehearsal dinners and family milestones.</p>
      <div className="flex gap-10 pb-[18px] pt-1 max-[480px]:flex-col max-[480px]:gap-4"><div><span className="block text-xs font-medium text-[#6b7280]">Venue Est. Minimum</span><strong className="mt-1 block text-base">Contact for pricing</strong></div><div><span className="block text-xs font-medium text-[#6b7280]">Deposit Required</span><strong className="mt-1 block text-base">None until approved</strong></div></div>
      <div className="h-px bg-[#e2e8f0]" />
      <div className="flex items-center gap-2 py-3.5 text-[13px] text-[#6b7280]"><Icon name="calendar" size={16} /><b className="font-semibold text-[#1d8fa5]">Open</b><span>• Closes 9pm · Closed Monday</span></div>
      <div className="h-px bg-[#e2e8f0]" />
      <div className="py-3.5 text-[13px] leading-[1.9] text-[#6b7280]"><b className="font-semibold text-[#1d8fa5]">Phone:</b> {KIKI.phone}<br /><b className="font-semibold text-[#1d8fa5]">Email:</b> {KIKI.email}</div>
      <div className="h-px bg-[#e2e8f0]" />
      <div className="mt-1.5 flex gap-1.5 overflow-x-auto border-b border-[#e2e8f0]">{["Spaces", "Updates", "Photos", "Menu & Packages", "Upcoming Events", "More Info"].map((t, i) => <span key={t} className={`whitespace-nowrap px-3.5 py-3 text-[13px] ${i === 0 ? "border-b-2 font-semibold text-[#1d8fa5]" : "text-[#4b5563]"}`} style={i === 0 ? { borderColor: "#1d8fa5" } : undefined}>{t}</span>)}</div>
      <div className="flex flex-col gap-3.5 pt-[18px] pb-6">{ROOMS.map((s) => <article key={s.id} className="flex gap-5 rounded-3xl border border-[#e2e8f0] bg-white p-3.5 max-[760px]:flex-col">
        <div className="h-44 w-[250px] flex-none overflow-hidden rounded-2xl bg-[#0f2540] max-[760px]:w-full"><img src={img(s.img)} alt="" className="size-full object-cover" /></div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-1">
          <h3 className="m-0 text-xl font-semibold leading-tight">{s.name}</h3>
          <p className="m-0 text-sm leading-[1.55] text-[#6b7280]">{DESC[s.id]}</p>
          <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f4f6] px-3 py-1.5 text-xs font-medium text-[#6b7280]"><Icon name="users" size={14} />Up to {s.cap} guests</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f4f6] px-3 py-1.5 text-xs font-medium text-[#6b7280]">Contact for Pricing</span></div>
          <div className="mt-auto flex items-end justify-between gap-3 pt-1">
            <div className="flex gap-8"><div><span className="block text-[11px] font-medium text-[#6b7280]">Est. Minimum Spend</span><b className="mt-1 block text-sm">Contact</b></div><div><span className="block text-[11px] font-medium text-[#6b7280]">Deposit Required</span><b className="mt-1 block text-sm">After approval</b></div></div>
            <Pbtn onClick={() => { pick(s.id); go("book"); }}>Book Space <Icon name="chevron" size={14} /></Pbtn>
          </div>
        </div>
      </article>)}</div>
    </div>
    <Foot />
  </div>;
}
