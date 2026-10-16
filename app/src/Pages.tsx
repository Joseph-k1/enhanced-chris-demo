import { useState } from "react";
import { Chat, Empty, Icon, MetricCard, Status, money } from "./ui";
import { TICKETED, first, owed, payLabel, priceOf, useStore, type Res } from "./store";

const key = (r: Res) => r.id;

export function MessagesView({ openReservation }: { openReservation: (id: string) => void }) {
  const s = useStore();
  const rows = s.reservations;
  const [sel, setSel] = useState(s.live?.id ?? rows[0]?.id);
  if (!rows.length) return <Empty icon="message" title="No conversations yet" text="Guest messages appear here once a request comes in." />;
  const r = rows.find((x) => x.id === sel) ?? rows[0];
  return <section className="card grid min-h-[560px] overflow-hidden lg:grid-cols-[320px_1fr]">
    <div className="max-h-[640px] overflow-auto border-b border-[#e6edf2] lg:border-b-0 lg:border-r">{rows.map((x) => <button key={key(x)} onClick={() => { setSel(x.id); s.markRead(x.id); }} className={`flex w-full items-start gap-3 border-b border-[#edf1f5] px-4 py-4 text-left hover:bg-[#f7fafc] ${x.id === r.id ? "bg-[#eef8f9]" : ""}`}>
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4f1f2] text-[11px] font-bold text-[#276a73]">{x.guest.split(" ").map((n) => n[0]).join("")}</div>
      <div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-xs font-bold text-[#263f57]">{x.guest}{s.unreadOf(x) && <span className="size-2 rounded-full bg-[#e95757]" />}</p><p className="mt-0.5 truncate text-[11px] text-[#8794a3]">{s.threadOf(x.id).at(-1)?.text}</p><p className="mt-0.5 text-[10px] text-[#a3afbc]">{x.event} · Oct {x.day}</p></div>
    </button>)}</div>
    <div className="flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between border-b border-[#edf1f5] pb-4"><div><h2 className="section-title">{r.guest}</h2><p className="mt-1 text-xs text-[#8795a4]">{r.event} · Oct {r.day} · <Status>{r.status}</Status></p></div><button onClick={() => openReservation(r.id)} className="secondary-button">Open reservation</button></div>
      <Chat msgs={s.threadOf(r.id)} me="host" peer={first(r.guest)} onSend={(t) => s.sendMsg(r.id, "host", t)} />
    </div>
  </section>;
}

export function PaymentsView({ openReservation }: { openReservation: (id: string) => void }) {
  const s = useStore();
  const rows = s.reservations;
  const collected = rows.reduce((a, r) => a + r.paid, 0);
  const outstanding = rows.filter((r) => r.status === "Confirmed").reduce((a, r) => a + owed(r), 0);
  const awaiting = rows.filter((r) => r.status === "Approved · deposit due").reduce((a, r) => a + r.deposit, 0);
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="Collected" value={money(collected)} note="deposits and balances received" icon="card" tone="bg-[#e5f5eb] text-[#25755a]" />
      <MetricCard label="Outstanding balances" value={money(outstanding)} note="on confirmed reservations" icon="clock" tone="bg-[#fff1db] text-[#a16b20]" />
      <MetricCard label="Awaiting deposits" value={money(awaiting)} note="approved, not yet paid" icon="message" tone="bg-[#ffe9e9] text-[#a34242]" />
    </div>
    <section className="card overflow-hidden">
      <div className="border-b border-[#e7edf3] p-5"><h2 className="section-title">Every reservation</h2><p className="mt-1 text-xs text-[#8b98a8]">Paid against still outstanding. New requests have no price until you set one.</p></div>
      {rows.map((r) => <div key={key(r)} className="grid items-center gap-2 border-b border-[#ebf0f4] px-5 py-4 last:border-0 lg:grid-cols-[64px_1.4fr_90px_90px_110px_1.2fr_120px] lg:gap-3">
        <span className="text-xs font-bold text-[#334b61]">Oct {r.day}</span>
        <button onClick={() => openReservation(r.id)} className="text-left"><p className="text-xs font-bold text-[#1b374f]">{r.guest}</p><p className="text-[11px] text-[#8491a1]">{r.event}</p></button>
        <span className="text-xs">{priceOf(r)}</span><span className="text-xs font-semibold text-[#278169]">{money(r.paid)}</span><span className="text-xs font-semibold text-[#8a6114]">{r.status === "Pending inquiry" ? "—" : money(owed(r))}</span>
        <span className="text-xs text-[#40546a]">{payLabel(r)}</span>
        {r.status !== "Pending inquiry" && owed(r) > 0 ? <button onClick={() => s.toast_(`Reminder sent to ${first(r.guest)}`)} className="secondary-button !min-h-8 !px-3 text-xs">Send reminder</button> : <span />}
      </div>)}
    </section>
  </div>;
}

export function EventsView() {
  const { toast_ } = useStore();
  const [made, setMade] = useState(false);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d9ebee] bg-[#eef8f9] p-4"><p className="max-w-2xl text-xs leading-5 text-[#2c6773]"><b>Events are tickets Kiki's sells itself</b>, like Pasta Night. Private bookings such as Allison's Birthday are reservations, under Reservations and Calendar.</p><button onClick={() => { setMade(true); toast_("Event draft created (demo)"); }} className="primary-button"><Icon name="plus" size={14} />{made ? "Draft created" : "Create event"}</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{TICKETED.map((e) => <div key={e.name} className="card overflow-hidden"><div className="h-2 bg-[#5bb8c6]" /><div className="p-5"><div className="grid size-12 place-items-center rounded-xl bg-[#edf5f7] text-center"><span className="text-[10px] font-bold uppercase text-[#77909c]">Oct</span><span className="-mt-2 text-lg font-bold text-[#183750]">{e.day}</span></div><h3 className="mt-4 text-sm font-bold text-[#1d3851]">{e.name}</h3><p className="mt-1 text-xs text-[#65788b]">{e.space} · {e.time}</p><div className="mt-4 h-1.5 rounded-full bg-[#e6edf2]"><div className="h-full rounded-full bg-[#2fa7b8]" style={{ width: `${(e.sold / e.cap) * 100}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-[#8190a0]"><span>{e.sold} / {e.cap} tickets</span><b className="text-[#183750]">{money(e.sold * e.price)}</b></div></div></div>)}</div>
  </div>;
}

export function CustomersView({ openReservation }: { openReservation: (id: string) => void }) {
  const { reservations } = useStore();
  return <section className="card overflow-hidden"><div className="border-b border-[#e6edf2] p-5"><h2 className="section-title">Customers</h2><p className="mt-1 text-xs text-[#8795a4]">Everyone who has booked or asked about a booking at Kiki's</p></div>
    {reservations.map((r) => <button key={key(r)} onClick={() => openReservation(r.id)} className="grid w-full gap-2 border-b border-[#e9eef2] px-5 py-4 text-left last:border-0 hover:bg-[#f8fafb] md:grid-cols-[1.4fr_1fr_100px_110px] md:items-center md:gap-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-[#e4f1f2] text-[11px] font-bold text-[#276a73]">{r.guest.split(" ").map((x) => x[0]).join("")}</div><div><p className="text-xs font-bold text-[#263f57]">{r.guest}</p><p className="mt-1 text-[10px] text-[#8794a3]">{r.email}</p></div></div><p className="text-xs text-[#637588]">{r.event}</p><Status>{r.status}</Status><p className="text-xs font-bold text-[#1f3b53]">{priceOf(r)}</p></button>)}
  </section>;
}

export function InsightsView() {
  const { reservations } = useStore();
  const confirmed = reservations.filter((r) => r.status === "Confirmed");
  const avg = confirmed.length ? Math.round(confirmed.reduce((a, r) => a + r.total, 0) / confirmed.length) : 0;
  return <div className="grid gap-4 sm:grid-cols-3">
    <MetricCard label="Confirmed reservations" value={String(confirmed.length)} note="holding a date in October" icon="calendar" tone="bg-[#e7f4f7] text-[#23869a]" />
    <MetricCard label="Average confirmed booking" value={money(avg)} note="event price, before add-ons" icon="card" tone="bg-[#e5f5eb] text-[#25755a]" />
    <MetricCard label="Open inquiries" value={String(reservations.filter((r) => r.status === "Pending inquiry").length)} note="waiting on a price from Kiki's" icon="message" tone="bg-[#fff1db] text-[#a16b20]" />
  </div>;
}

export function SettingsView() {
  return <section className="card max-w-2xl p-6"><h2 className="section-title">Kiki's La Quinta</h2><p className="mt-1 text-xs text-[#8795a4]">This workspace only ever shows Kiki's. Another venue's bookings cannot appear here.</p>
    <dl className="mt-5 divide-y divide-[#eef1f4] text-sm">{[["Address", "46660 Washington Street, Suites 8-9, La Quinta, CA 92253"], ["Events email", "events@kikislaquinta.com"], ["Phone", "(760) 777-8008"], ["Owner", "Jack"], ["Hours", "Tue–Thu 4:30–8 PM · Fri–Sat 4:30–9 PM · Sun 4:30–8 PM · Closed Monday"]].map(([k, v]) => <div key={k} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]"><dt className="text-xs font-bold text-[#8290a0]">{k}</dt><dd>{v}</dd></div>)}</dl>
  </section>;
}
