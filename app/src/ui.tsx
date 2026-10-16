import { useState, type ReactNode } from "react";

export type IconName =
  | "arrow" | "bell" | "calendar" | "card" | "check" | "chevron" | "close" | "dashboard" | "download"
  | "event" | "insights" | "menu" | "message" | "plus" | "search" | "settings" | "sparkle" | "users"
  | "file" | "clock" | "shield" | "mail" | "upload" | "link";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
    card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.58 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.58 1.7 1.7 0 0 0 10 3h4v.08a1.7 1.7 0 0 0 1.05 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.42 9 1.7 1.7 0 0 0 21 10h.08v4H21a1.7 1.7 0 0 0-1.6 1z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    sparkle: <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 21h14" /></>,
    arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
    event: <><path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="3" /><path d="m8 15 2.5 2.5L16 12" /></>,
    insights: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V2" /><path d="M2 19h21" /></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    upload: <><path d="M12 15V3m0 0L8 7m4-4 4 4" /><path d="M5 21h14" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export const money = (n: number) => "$" + n.toLocaleString("en-US");
export const moneyShort = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : money(n));

const statusStyles: Record<string, string> = {
  Confirmed: "bg-[#dcf5e9] text-[#1c6c55]",
  "Approved · deposit due": "bg-[#fff3d9] text-[#8a6114]",
  "Pending inquiry": "bg-[#ffe5e5] text-[#a34242]",
};

export function Status({ children }: { children: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusStyles[children]}`}>{children}</span>;
}

/** Calendar chip colours by reservation status. Pending inquiries are dashed: not yet holding the date. */
export const calTone = (status: string) =>
  status === "Confirmed" ? "bg-[#d8f1e5] text-[#275c50]"
  : status === "Approved · deposit due" ? "bg-[#fff0cf] text-[#76571d]"
  : "border border-dashed border-[#e3a1a1] bg-[#fdeaea] text-[#854747]";

export function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-[#258fa0]" : "bg-[#cbd4dc]"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition ${enabled ? "left-[22px]" : "left-0.5"}`} /></button>;
}

export function MetricCard({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: IconName; tone: string }) {
  return <div className="card p-5">
    <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#7c8a9b]">{label}</p><p className="mt-2 text-[27px] font-bold tracking-[-0.04em] text-[#102b46]">{value}</p></div><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon name={icon} size={18} /></div></div>
    <p className="mt-3 text-[11px] text-[#7c8a9b]">{note}</p>
  </div>;
}

export function Empty({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="card grid min-h-[360px] place-items-center p-8 text-center"><div className="max-w-md"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e4f3f5] text-[#278b9b]"><Icon name={icon} size={24} /></div><h2 className="mt-5 text-xl font-bold text-[#17334d]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#7b8999]">{text}</p></div></div>;
}

export type Msg = { from: "host" | "guest"; text: string; at: string; tag?: string };

/** One conversation. `me` decides which side is "you"; the same thread renders in host and guest views. */
export function Chat({ msgs, me, peer, onSend, dark }: { msgs: Msg[]; me: "host" | "guest"; peer: string; onSend: (text: string) => void; dark?: boolean }) {
  const [text, setText] = useState("");
  const send = () => { if (text.trim()) { onSend(text.trim()); setText(""); } };
  return <div>
    <div className="space-y-3">{msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-5 ${m.from === me ? (dark ? "ml-auto bg-[#26382c] text-white" : "ml-auto bg-[#e5f4f6] text-[#315766]") : (dark ? "bg-white text-[#2d3a31]" : "bg-[#f2f5f8] text-[#42576b]")}`}>
      <b>{m.from === me ? "You" : peer}</b> · <span className="opacity-70">{m.at}</span>
      {m.tag && <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#6a7d8f]">{m.tag}</span>}
      <br />{m.text}
    </div>)}</div>
    <div className="mt-5 flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="field flex-1" placeholder="Write a message…" /><button onClick={send} className="primary-button" style={dark ? { background: "#26382c", borderColor: "#26382c" } : undefined}>Send</button></div>
  </div>;
}

/** Simulated card form. No payment is taken. */
export function PayModal({ title, amount, name, onClose, onPaid }: { title: string; amount: number; name: string; onClose: () => void; onPaid: () => void }) {
  const [busy, setBusy] = useState(false);
  const pay = () => { setBusy(true); window.setTimeout(onPaid, 800); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#09213a]/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-[#15324d]">{title}</h2><p className="mt-1 text-xs text-[#8190a0]">Secure payment via Stripe</p></div><button onClick={onClose} className="rounded-lg p-1 text-[#7f8d9c] hover:bg-[#f1f4f6]" aria-label="Close"><Icon name="close" /></button></div>
      <div className="mt-5 rounded-2xl bg-[#f3f7f9] p-4 text-center"><p className="text-[11px] font-bold uppercase text-[#7d8d9b]">Amount due now</p><p className="mt-1 text-3xl font-bold text-[#123454]">{money(amount)}</p></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="form-label sm:col-span-2">Card number<input className="field mt-2 w-full" defaultValue="4242 4242 4242 4242" /></label>
        <label className="form-label">Expiry<input className="field mt-2 w-full" defaultValue="12 / 28" /></label>
        <label className="form-label">CVC<input className="field mt-2 w-full" defaultValue="123" /></label>
        <label className="form-label sm:col-span-2">Name on card<input className="field mt-2 w-full" defaultValue={name} /></label>
      </div>
      <p className="mt-3 text-[10px] text-[#8a98a8]">Demo only. No real payment is taken.</p>
      <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="secondary-button">Cancel</button><button onClick={pay} disabled={busy} className="primary-button disabled:opacity-60">{busy ? "Processing…" : `Pay ${money(amount)}`}</button></div>
    </div>
  </div>;
}
