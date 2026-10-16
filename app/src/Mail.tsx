import { Icon, money } from "./ui";
import { KIKI, dayLabel, first, useStore } from "./store";
import { img } from "./Book";

/* The three emails in the journey. Plain mock mail client, one button per email. */
export default function Mail() {
  const { page, booking: b, goto } = useStore();
  const mail = {
    hostNew: { account: KIKI.email, from: "KneesUp Venues", fromAddr: "no-reply@kneesupvenues.com", to: KIKI.email, time: "Today, 9:12 AM", unreadBadge: 1,
      subject: `New reservation request: ${b.event} (${b.guests} guests)`, cta: "Review request", go: "review",
      body: <><p>Hi Kiki's team,</p><p className="mt-3"><b>{b.name}</b> just sent a reservation request through your booking page.</p>
        <Details rows={[["Event", b.event], ["Space", b.space], ["Date", dayLabel(b.day)], ["Time", b.time], ["Guests", String(b.guests)], ["Contact", `${b.email} · ${b.phone}`]]} />
        <p className="mt-4 text-[#5b6a78]">"{b.note}"</p><p className="mt-4">Review the request, set the price and send a deposit request in one click.</p></> },
    deposit: { account: b.email, from: "Kiki's La Quinta", fromAddr: "events@kikislaquinta.com", to: b.email, time: "Today, 10:20 AM", unreadBadge: 1,
      subject: `Your request is approved: pay your deposit to secure ${dayLabel(b.day)}`, cta: `Pay ${money(b.deposit)} deposit`, go: "pay",
      body: <><p>Hi {first(b.name)},</p><p className="mt-3">Great news: Kiki's would love to host <b>{b.event}</b>. Here is your confirmed pricing:</p>
        <Details rows={[["Space", b.space], ["Date", `${dayLabel(b.day)}, ${b.time}`], ["Event total", money(b.total)], ["Deposit due now", money(b.deposit)], ["Remaining balance", `${money(b.total - b.deposit)} due Oct ${b.day - 1}`]]} />
        <p className="mt-4">Pay the deposit to lock in your date. You'll get a personal guest portal to plan your menu, requests and guests.</p></> },
  }[page === "deposit" ? "deposit" : "hostNew"];
  return <div className="flex h-screen flex-col bg-[#eef1f5] text-[#1b2630]">
    <div className="flex items-center gap-3 border-b border-[#dde3ea] bg-white px-5 py-3 text-xs"><Icon name="mail" size={16} /><b>Inbox</b><span className="text-[#7c8794]">{mail.account}</span><span className="ml-auto rounded-full bg-[#e8f1ff] px-2.5 py-1 font-bold text-[#2f62b5]">{mail.unreadBadge} unread</span></div>
    <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_1fr]">
      <aside className="hidden border-r border-[#dde3ea] bg-white lg:block">
        <div className="border-l-4 border-[#2f62b5] bg-[#f0f5ff] px-4 py-3.5"><p className="text-xs font-bold">{mail.from}</p><p className="mt-1 line-clamp-2 text-xs font-semibold">{mail.subject}</p><p className="mt-1 text-[10px] text-[#7c8794]">{mail.time}</p></div>
        {["Your weekly summary", "Receipt from Sysco", "Staff schedule update"].map((s) => <div key={s} className="border-b border-[#eef1f4] px-4 py-3.5 opacity-60"><p className="text-xs font-semibold">{s}</p><p className="mt-1 text-[10px] text-[#7c8794]">Yesterday</p></div>)}
      </aside>
      <main className="overflow-auto p-6">
        <article className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold">{mail.subject}</h1>
          <div className="mt-4 flex items-center gap-3 border-b border-[#eef1f4] pb-4 text-xs"><div className="grid size-9 place-items-center rounded-full bg-[#2a392c] text-white">{mail.from[0]}</div><div className="flex-1"><p className="font-bold">{mail.from} <span className="font-normal text-[#7c8794]">&lt;{mail.fromAddr}&gt;</span></p><p className="text-[#7c8794]">to {mail.to}</p></div><span className="text-[#7c8794]">{mail.time}</span></div>
          <div className="py-6 text-sm leading-6 text-[#2f3b46]"><img src={img("kiki-logo.png")} alt="" width={44} height={44} className="mb-5 rounded-full" />{mail.body}</div>
          <button onClick={() => goto(mail.go)} className="rounded-xl bg-[#2a392c] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#35483a]">{mail.cta}</button>
          <p className="mt-6 border-t border-[#eef1f4] pt-4 text-[11px] text-[#9aa5b1]">Sent by KneesUp Venues on behalf of Kiki's La Quinta · Demo email</p>
        </article>
      </main>
    </div>
  </div>;
}

const Details = ({ rows }: { rows: string[][] }) => <dl className="mt-4 divide-y divide-[#eef1f4] rounded-xl border border-[#e3e8ee] text-xs">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-[#7c8794]">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>;
