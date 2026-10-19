import { useEffect, useRef, useState, type ReactNode } from "react";
import { Chat, Icon, PayModal, money } from "./ui";
import { DEMO_NOW, VENUE, MARKET, MENUS, dayLabel, first, hoursOf, spaceOf, useStore, weekday } from "./store";
import { img } from "./Book";

/* Allison's guest portal. {VENUE.name} is the venue. Colors match the host workspace: hosts cannot set a guest-portal color. */

const NAV = ["My event", "Messages", "Requests", "Contracts", "Add-ons & partners", "Guests & RSVP", "Payments"];
const REQUEST_TYPES = ["Seating arrangement", "Entertainment preferences", "Dietary restrictions", "Decoration & theme", "Other requests"];
const BTN = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#153b5b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0f2f4b] disabled:opacity-50";
const BTN2 = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce5ed] bg-white px-4 py-2.5 text-xs font-bold text-[#506579] hover:bg-[#f6f8fa]";
const FIELD = "w-full rounded-lg border border-[#dfe7ee] bg-white px-3 py-2.5 text-xs text-[#19334c] outline-none focus:border-[#55b6c3]";

const Card = ({ title, sub, right, children, className = "" }: { title?: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string }) =>
  <section className={`rounded-2xl border border-[#e5ebf1] bg-white p-5 ${className}`}>{(title || right) && <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-[#102b46]">{title}</h2>{sub && <p className="mt-1 text-xs text-[#7c8a9b]">{sub}</p>}</div>{right}</div>}{children}</section>;
const Chip = ({ tone, children }: { tone: "green" | "amber" | "red"; children: ReactNode }) =>
  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tone === "green" ? "bg-[#e2f4e8] text-[#2a7a52]" : tone === "amber" ? "bg-[#fff0d4] text-[#936614]" : "bg-[#fbe6e6] text-[#a04545]"}`}>{children}</span>;
const Locked = () => <Card><p className="text-sm text-[#6b7c8d]">This opens once your deposit is paid. Pay it from the Payments page to unlock menu choices, requests, contracts and guest invitations.</p></Card>;

function Countdown({ day, time }: { day: number; time: string }) {
  const t0 = useRef(Date.now());
  const [, tick] = useState(0);
  useEffect(() => { const id = window.setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  const ms = Math.max(0, new Date(2026, 9, day, hoursOf(time)[0]).getTime() - (DEMO_NOW + Date.now() - t0.current));
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return <div><p className="mt-3 text-3xl font-bold">{d} Days to Go</p><p className="mt-1 text-xs tabular-nums text-white/70">+ {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s</p></div>;
}

function MenuCard() {
  const s = useStore(); const b = s.booking;
  const [choice, setChoice] = useState(s.menu ?? ""); return <Card title="Food & beverage" sub={`Choose a style. ${VENUE.name} chef team reviews and confirms it.`} right={s.menu && <Chip tone={s.menuApproved ? "green" : "amber"}>{s.menuApproved ? "Approved" : "Awaiting approval"}</Chip>}>
    <div className="space-y-2">{MENUS.map(([n, d]) => <button key={n} onClick={() => setChoice(n)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${choice === n ? "border-[#55b6c3] bg-[#e7f4f7]" : "border-[#e5ebf1] hover:border-[#a8d8de]"}`}><span className={`mt-0.5 grid size-4 place-items-center rounded-full border ${choice === n ? "border-[#55b6c3] bg-[#238da1]" : "border-[#cbd4dc]"}`}>{choice === n && <span className="size-1.5 rounded-full bg-white" />}</span><span><span className="block text-xs font-bold text-[#19334c]">{n}</span><span className="mt-1 block text-[11px] leading-5 text-[#7c8a9b]">{d}</span></span></button>)}</div>
    <div className="mt-4 flex justify-end"><button disabled={!choice || choice === s.menu} onClick={() => { s.submitMenu(choice); s.toast_(`Menu choice sent to ${VENUE.name}`); }} className={BTN}>{s.menu && s.menu === choice ? `Sent to ${VENUE.name}` : "Send menu choice"}</button></div></Card>;
}

function MessagesPage() {
  const s = useStore(); const b = s.booking;
  const msgs = s.threadOf(s.rec?.id ?? "");
    useEffect(() => { s.seen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <section className="overflow-hidden rounded-2xl border border-[#e5ebf1] bg-white"><div className="flex items-center gap-3 border-b border-[#e5ebf1] px-5 py-4"><img src={img("tavern-logo.svg")} alt="" width={36} height={36} className="rounded-full" /><div><p className="text-sm font-bold text-[#102b46]">{VENUE.name} Events Team</p><p className="text-[11px] text-[#7c8a9b]">{VENUE.email}</p></div></div><div className="bg-[#f3f6fa] p-5"><Chat msgs={msgs} me="guest" peer={VENUE.name} onSend={(t) => s.sendMsg(s.rec?.id ?? "", "guest", t)} /></div></section>;
}

function GuestsPage() {
  const s = useStore(); const b = s.booking;
    const [f, setF] = useState({ name: "", email: "", diet: "" }); const [open, setOpen] = useState(false);
    const c = (k: string) => s.guestList.filter((p) => p.status === k).length;
    return <Card title="Guest responses" sub={`${b.guests} invited · ${c("Attending")} attending · ${c("Pending")} pending · ${c("Declined")} declined`} right={<button onClick={() => setOpen(!open)} className={BTN}><Icon name="plus" size={14} />Invite Guest</button>}>
      {open && <div className="mb-4 grid gap-3 rounded-xl bg-[#f3f6fa] p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={FIELD} placeholder="Guest name" /><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={FIELD} placeholder="Email" /><input value={f.diet} onChange={(e) => setF({ ...f, diet: e.target.value })} className={FIELD} placeholder="Dietary needs" /><button disabled={!f.name.trim()} onClick={() => { s.addGuest({ name: f.name.trim(), email: f.email || "—", status: "Pending", diet: f.diet || "—" }); setF({ name: "", email: "", diet: "" }); setOpen(false); s.toast_("Invitation sent (demo)"); }} className={BTN}>Send</button></div>}
      <div className="hidden grid-cols-[1fr_1fr_110px_130px] gap-4 border-b border-[#e8eef3] pb-3 text-[10px] font-bold uppercase text-[#8795a6] sm:grid"><span>Name</span><span>Email address</span><span>Status</span><span>Dietary</span></div>
      {s.guestList.map((p) => <div key={p.name + p.email} className="grid items-center gap-2 border-b border-[#e8eef3] py-3.5 text-xs last:border-0 sm:grid-cols-[1fr_1fr_110px_130px] sm:gap-4"><b className="text-[#19334c]">{p.name}</b><span className="text-[#6b7c8d]">{p.email}</span><div><Chip tone={p.status === "Attending" ? "green" : p.status === "Pending" ? "amber" : "red"}>{p.status}</Chip></div><span className="text-[#6b7c8d]">{p.diet}</span></div>)}
    </Card>;
}

function NewRequest({ onClose }: { onClose: () => void }) {
  const s = useStore(); const b = s.booking;
    const [type, setType] = useState(REQUEST_TYPES[0]); const [text, setText] = useState("");
    return <div className="fixed inset-0 z-50 grid place-items-center bg-[#09213a]/55 p-4" onMouseDown={() => onClose()}><div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-base font-bold text-[#102b46]">Submit a request</h2><p className="mt-1 text-xs text-[#7c8a9b]">Send {VENUE.name} your event preferences.</p>
      <label className="mt-5 block text-[11px] font-bold text-[#445a6f]">Request type<select value={type} onChange={(e) => setType(e.target.value)} className={`${FIELD} mt-1.5`}>{REQUEST_TYPES.map((r) => <option key={r}>{r}</option>)}</select></label>
      <label className="mt-4 block text-[11px] font-bold text-[#445a6f]">Request details<textarea value={text} onChange={(e) => setText(e.target.value)} className={`${FIELD} mt-1.5 min-h-28 resize-none`} placeholder="Please describe what you need" /></label>
      <div className="mt-5 flex justify-end gap-2"><button onClick={() => onClose()} className={BTN2}>Cancel</button><button disabled={!text.trim()} onClick={() => { s.addRequest(type, text.trim()); s.sendMsg(s.rec?.id ?? "", "guest", text.trim(), type); onClose(); s.toast_(`Request sent to ${VENUE.name}`); }} className={BTN}>Submit request</button></div></div></div>;
}

export default function Guest() {
  const s = useStore();
  const { booking: b, stage, page } = s;
  const [pay, setPay] = useState<"deposit" | "balance" | null>(null);
  const [signing, setSigning] = useState(false);
  const [newReq, setNewReq] = useState(false);
  const locked = stage !== "confirmed";
  const remaining = b.total - b.deposit;
  const paid = stage === "confirmed" ? b.deposit + (s.balancePaid ? remaining : 0) : 0;
  const go = (p: string) => s.set({ page: p });
  const id = s.rec?.id ?? "";
  const msgs = s.threadOf(id);
  const badge = msgs.at(-1)?.from === "host" ? Math.max(0, msgs.length - s.guestSeen) : 0;
  const sp = spaceOf(b.spaceId);
  const hostSlide = stage === "confirmed" ? "calendar" : "review";
  const steps = s.live ? s.progressFor(s.live) : [];
  const doneCount = steps.filter((x) => x.done).length;
  const nextIdx = steps.findIndex((x) => !x.done);

  const header = <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div><h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#102b46]">Your celebration, coming together.</h1>
      <p className="mt-1 text-sm text-[#7c8a9b]">Hi {first(b.name)}. {stage === "confirmed" ? "Your booking is confirmed!" : stage === "approved" ? "Your request is approved. Pay the deposit to secure your date." : `Your request is with ${VENUE.name}.`}</p></div>
    <div className="flex gap-2"><button onClick={() => go("Messages")} className={BTN2}><Icon name="message" size={14} />Send message</button><button disabled={locked} onClick={() => { go("Requests"); setNewReq(true); }} className={BTN}><Icon name="plus" size={14} />New Request</button></div>
  </div>;

  const overview = <div className="space-y-5">
    {stage === "approved" && <div className="flex flex-col gap-3 rounded-2xl border border-[#ecd7a6] bg-[#fff8e8] p-5 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-sm font-bold text-[#6f4f12]">{VENUE.name} approved your request</p><p className="mt-1 text-xs leading-5 text-[#8a6a2a]">Pay the {money(b.deposit)} deposit to secure {b.space} on {dayLabel(b.day)}.</p></div><button onClick={() => stage === "approved" && setPay("deposit")} className={BTN}>Pay {money(b.deposit)} deposit</button></div>}
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card>
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#102b46]">{b.event} · {b.name}</h2><p className="mt-1 text-xs text-[#7c8a9b]">{b.note}</p></div><Chip tone={stage === "confirmed" ? "green" : "amber"}>{stage === "confirmed" ? "Confirmed" : "Deposit due"}</Chip></div>
          <div className="mt-5 grid gap-4 border-t border-[#e8eef3] pt-5 sm:grid-cols-4">{[["calendar", "Date", `${weekday(b.day)}, October ${b.day}, 2026`, `${Math.max(0, b.day - 6)} days until your celebration`], ["clock", "Time & space", b.time, b.space], ["event", "Venue", VENUE.name, VENUE.addr], ["users", "Guests", `${b.guests} guests · ${s.guestList.filter((p) => p.status === "Attending").length} replied yes`, `Final headcount due October ${b.day - 2}`]].map(([ic, k, v, sub]) => <div key={k}><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#8795a6]"><Icon name={ic as any} size={13} />{k}</p><p className="mt-1.5 text-xs font-semibold text-[#19334c]">{v}</p><p className="mt-0.5 text-[11px] text-[#8795a6]">{sub}</p></div>)}</div>
        </Card>
        <Card title="Upcoming & important">
          <div className="space-y-3 text-xs">{[[`Oct ${b.day - 2}`, "Menu selection & final headcount due"], [`Oct ${b.day - 1}`, `Outstanding balance due · ${money(Math.max(0, b.total - paid))}`], [`Oct ${b.day}`, `Your event at ${b.time.split("–")[0]} PM`.replace(" PM PM", " PM")]].map(([d, t]) => <div key={t} className="flex gap-4"><span className="w-14 font-bold text-[#238da1]">{d}</span><span className="text-[#344b60]">{t}</span></div>)}</div>
        </Card>
        <Card title="Messages with your venue" sub={`Share event updates and approvals with ${VENUE.name} events team.`}><button onClick={() => go("Messages")} className={BTN2}>Open conversation{badge > 0 && <span className="rounded-full bg-[#e95757] px-1.5 text-[10px] text-white">{badge}</span>}</button></Card>
      </div>
      <div className="space-y-5">
        {stage !== "inquiry" && <div className="rounded-2xl bg-[#238da1] p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-[11px] text-white/75">Countdown to your Event</p><p className="mt-1 text-xs font-semibold">{dayLabel(b.day)} · {b.time.split("–")[0]} PM</p></div><span className="grid size-10 place-items-center rounded-full bg-[#153b5b]"><Icon name="clock" size={18} /></span></div><Countdown day={b.day} time={b.time} /></div>}
        <Card title="Your event preparation guide" sub={`${doneCount} of ${steps.length} complete`}>
          <div className="mb-4 flex gap-1">{steps.map((x, i) => <span key={x.label} className={`h-1 flex-1 rounded-full ${x.done ? "bg-[#238da1]" : i === nextIdx ? "bg-[#153b5b]" : "bg-[#e5ebf1]"}`} />)}</div>
          <ul className="space-y-3">{steps.map((x, i) => <li key={x.label} className="flex items-center gap-3 text-xs"><span className={`grid size-5 shrink-0 place-items-center rounded-full border ${x.done ? "border-[#55b6c3] bg-[#e7f4f7] text-[#227c89]" : i === nextIdx ? "border-[#153b5b] bg-white text-[#19334c]" : "border-[#d5dee6] text-transparent"}`}>{x.done && <Icon name="check" size={11} />}</span><span className={x.done ? "text-[#227c89]" : i === nextIdx ? "font-bold text-[#102b46]" : "text-[#7c8a9b]"}>{x.label}</span></li>)}</ul>
        </Card>
      </div>
    </div>
  </div>;

  const docs = [
    { name: "Venue agreement.pdf", note: locked ? "Available after your deposit" : s.contractSigned ? `Signed by ${b.name} · today` : "Awaiting your signature", sign: !locked && !s.contractSigned },
    { name: "Event policies.pdf", note: `Shared by ${VENUE.name} · Oct 6` },
    { name: "Private events menu.pdf", note: `Shared by ${VENUE.name} · Oct 6` },
    ...s.uploads.map((u) => ({ name: u.name, note: `Uploaded by ${u.by} · ${u.at}`, sign: false })),
  ];
  const contracts = locked ? <Locked /> : <Card title="Contracts & files" sub={`Documents shared between you and ${VENUE.name}.`} right={<label className={`${BTN2} cursor-pointer`}><Icon name="upload" size={14} />Upload<input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { s.addUpload(f.name, first(b.name)); s.toast_(`File shared with ${VENUE.name}`); } }} /></label>}>
    {docs.map((d) => <div key={d.name} className="flex items-center gap-3 border-b border-[#e8eef3] py-3 last:border-0"><span className="grid size-10 place-items-center rounded-xl bg-[#e7f4f6] text-[#218597]"><Icon name="file" size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#19334c]">{d.name}</p><p className="text-[11px] text-[#7c8a9b]">{d.note}</p></div>{d.sign && <button onClick={() => setSigning(true)} className={BTN}>Review & sign</button>}<button onClick={() => s.toast_("Download started (demo)")} className="text-[#7c8a9b]" aria-label={`Download ${d.name}`}><Icon name="download" size={16} /></button></div>)}
  </Card>;

  const addons = locked ? <Locked /> : <div className="space-y-5"><MenuCard />
    <Card title="Add-ons & partners" sub={`${VENUE.name} confirms pricing and adds selected items to your final balance.`}><div className="grid gap-3 sm:grid-cols-2">{MARKET.map(([n, p, d]) => <button key={n} onClick={() => s.toggleAddon(n)} className={`rounded-xl border p-4 text-left ${s.addons.includes(n) ? "border-[#55b6c3] bg-[#e7f4f7]" : "border-[#e5ebf1] hover:border-[#a8d8de]"}`}><div className="flex justify-between text-xs font-bold text-[#19334c]"><span>{n}</span><span>{money(p)}</span></div><p className="mt-1 text-[11px] text-[#7c8a9b]">{d}</p><p className="mt-2 text-[10px] font-bold text-[#238da1]">{s.addons.includes(n) ? "Requested ✓" : "Tap to request"}</p></button>)}</div></Card></div>;

  const requests = locked ? <Locked /> : <Card title="Event Requests" sub="Send in your event preferences" right={<button onClick={() => setNewReq(true)} className={BTN}><Icon name="plus" size={14} />New Request</button>}>
    <div className="hidden grid-cols-[170px_1fr_120px_90px] gap-4 border-b border-[#e8eef3] pb-3 text-[10px] font-bold uppercase text-[#8795a6] sm:grid"><span>Request type</span><span>Details</span><span>Date</span><span>Status</span></div>
    {s.requests.length === 0 && <p className="py-8 text-center text-xs text-[#7c8a9b]">No requests yet.</p>}
    {s.requests.map((q, i) => <div key={i} className="grid gap-2 border-b border-[#e8eef3] py-4 last:border-0 sm:grid-cols-[170px_1fr_120px_90px] sm:gap-4"><p className="text-xs font-bold text-[#19334c]">{q.type}</p><p className="text-xs leading-5 text-[#6b7c8d]">{q.details}</p><p className="text-[11px] text-[#7c8a9b]">{q.date}</p><div><Chip tone={q.status === "Approved" ? "green" : "amber"}>{q.status}</Chip></div></div>)}
  </Card>;

  const txs = [...(stage === "confirmed" ? [{ d: "Oct 6, 2026", t: "Booking deposit", a: b.deposit }] : []), ...(s.balancePaid ? [{ d: "Oct 6, 2026", t: "Remaining balance", a: remaining }] : [])];
  const due = stage === "confirmed" ? (s.balancePaid ? 0 : remaining) : b.deposit;
  const payments = <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
    <Card><div className="flex items-start justify-between"><p className="text-sm font-bold text-[#102b46]">{stage === "confirmed" ? "Your remaining balance" : "Your deposit"}</p>{stage === "confirmed" && !s.balancePaid && <Chip tone="amber">Due Oct {b.day - 1}</Chip>}{stage !== "confirmed" && <Chip tone="amber">Due now</Chip>}</div>
      <p className="mt-4 text-4xl font-bold tracking-tight text-[#102b46]">{money(due)}.00</p><p className="mt-1 text-xs text-[#7c8a9b]">{stage === "confirmed" ? (s.balancePaid ? "You're paid in full. Thank you!" : `Final payment due ${dayLabel(b.day - 1)}`) : `Pay now to secure ${dayLabel(b.day)}`}</p>
      <div className="mt-5 h-2 rounded-full bg-[#e5ebf1]"><div className="h-full rounded-full bg-[#238da1] transition-all" style={{ width: `${b.total ? (paid / b.total) * 100 : 0}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-[#7c8a9b]"><span>{money(paid)} of {money(b.total)} paid</span><span>{Math.round(b.total ? (paid / b.total) * 100 : 0)}% paid</span></div>
      {due > 0 && <button onClick={() => setPay(stage === "confirmed" ? "balance" : stage === "approved" ? "deposit" : null)} className={`${BTN} mt-5`}>Pay {money(due)} {stage === "confirmed" ? "balance" : "deposit"} →</button>}</Card>
    <Card title="Booking summary"><p className="text-xs font-bold text-[#19334c]">{b.event} · {b.name}</p><p className="mt-1 text-[11px] text-[#7c8a9b]">{VENUE.name} · {b.space}<br />{dayLabel(b.day)}, {b.time}</p><dl className="mt-4 space-y-2 border-t border-[#e8eef3] pt-4 text-xs">{[["Booking total", money(b.total)], ["Deposit paid", paid ? `−${money(Math.min(paid, b.deposit))}` : "$0"], ["Balance due", money(Math.max(0, b.total - paid))]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-[#7c8a9b]">{k}</dt><dd className="font-bold text-[#19334c]">{v}</dd></div>)}</dl></Card></div>
    <Card title="Transaction history" sub="All payments for this booking">
      <div className="hidden grid-cols-[110px_1fr_150px_90px_90px_90px] gap-3 border-b border-[#e8eef3] pb-3 text-[10px] font-bold uppercase text-[#8795a6] sm:grid"><span>Date</span><span>Description</span><span>Payment method</span><span>Amount</span><span>Status</span><span>Receipt</span></div>
      {txs.length === 0 && <p className="py-6 text-center text-xs text-[#7c8a9b]">No payments yet.</p>}
      {txs.map((t) => <div key={t.t} className="grid items-center gap-2 border-b border-[#e8eef3] py-3 text-xs last:border-0 sm:grid-cols-[110px_1fr_150px_90px_90px_90px] sm:gap-3"><span className="text-[#6b7c8d]">{t.d}</span><b className="text-[#19334c]">{t.t}</b><span className="text-[#6b7c8d]">Visa ending 4242</span><b>{money(t.a)}.00</b><span><Chip tone="green">Paid</Chip></span><button onClick={() => s.toast_("Receipt downloaded (demo)")} className="w-fit font-bold text-[#238da1]">Download ↓</button></div>)}
    </Card></div>;

  const guests = locked ? <Locked /> : <GuestsPage />;

  const body = page === "Messages" ? <MessagesPage /> : page === "Requests" ? requests : page === "Contracts" ? contracts : page === "Add-ons & partners" ? addons : page === "Guests & RSVP" ? guests : page === "Payments" ? payments : overview;

  return <div className="flex min-h-screen bg-[#f3f6fa] text-[#19334c]">
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col bg-[#102f50] px-4 py-6 text-white md:flex">
      <img src={img("tavern-logo.svg")} alt={VENUE.name} width={72} height={72} className="rounded-full" /><p className="mt-3 text-sm font-bold">{VENUE.name}</p><p className="text-[10px] text-white/60">{VENUE.org}</p><p className="text-[10px] text-white/50">Powered by KneesUp Venues</p>
      <nav className="mt-8 space-y-1">{NAV.map((n) => <button key={n} onClick={() => go(n)} className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${page === n ? "bg-white/10 text-[#62d5dd]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>{n}{n === "Messages" && badge > 0 && <span className="ml-auto rounded-full bg-[#e95757] px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}</button>)}</nav>
      <div className="mt-auto text-[11px] leading-5 text-white/70"><p className="mb-2 text-xs font-bold text-white">VENUE DETAILS</p><p><b className="text-white">Event contact:</b> {VENUE.name} Events</p><p><b className="text-white">Email:</b> {VENUE.email}</p><p><b className="text-white">Mobile:</b> {VENUE.phone}</p><button onClick={() => s.goto(hostSlide)} className="mt-5 rounded-lg border border-white/20 px-3 py-2 text-[11px] font-bold text-white/80 hover:bg-white/10">Switch to host view</button></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-8">
      <div className="mb-4 flex gap-1 overflow-x-auto md:hidden">{NAV.map((n) => <button key={n} onClick={() => go(n)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${page === n ? "bg-[#153b5b] text-white" : "bg-white text-[#506579]"}`}>{n}</button>)}</div>
      {header}{body}
    </main>
    {pay && <PayModal title={pay === "deposit" ? "Pay booking deposit" : "Pay remaining balance"} amount={pay === "deposit" ? b.deposit : remaining} name={b.name} onClose={() => setPay(null)} onPaid={() => { if (pay === "deposit" && stage === "approved") { s.payDeposit(); go("My event"); s.goto("confirmed"); s.toast_("Deposit paid. Your reservation is confirmed!"); } else { s.payBalance(); s.toast_("Balance paid. Thank you!"); } setPay(null); }} />}
    {newReq && <NewRequest onClose={() => setNewReq(false)} />}
    {signing && <div className="fixed inset-0 z-50 grid place-items-center bg-[#09213a]/55 p-4" onMouseDown={() => setSigning(false)}><div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-base font-bold text-[#102b46]">Venue agreement</h2><div className="mt-4 max-h-40 overflow-auto rounded-xl bg-[#f3f6fa] p-4 text-xs leading-5 text-[#5f7184]">{VENUE.name} agrees to provide {sp.name} on {dayLabel(b.day)}, {b.time}, for {b.guests} guests. The deposit of {money(b.deposit)} secures the date. The remaining {money(remaining)} is due by Oct {b.day - 1}. Event policies apply.</div><label className="mt-4 flex items-start gap-2 text-xs text-[#445a6f]"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#153b5b]" />I have read and agree to this agreement and the event policies.</label><label className="mt-4 block text-[11px] font-bold text-[#445a6f]">Type your name to sign<input className={`${FIELD} mt-1.5`} defaultValue={b.name} /></label><div className="mt-5 flex justify-end gap-2"><button onClick={() => setSigning(false)} className={BTN2}>Cancel</button><button onClick={() => { s.signContract(); setSigning(false); s.toast_(`Agreement signed. ${VENUE.name} has been notified.`); }} className={BTN}>Sign agreement</button></div></div></div>}
    {s.toast && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#153b5b] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Icon name="check" size={15} />{s.toast}</div>}
  </div>;
}
