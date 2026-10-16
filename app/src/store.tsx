import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { money, type Msg } from "./ui";

/* The demo's "backend". Every booking lives in localStorage ("kneesup-demo-db-v1"), and the host workspace, guest
 * portal, emails and calendar all read from it, so a booking made anywhere shows up everywhere, survives a reload and
 * syncs across browser tabs (storage event). Nothing is real: no server, no payments. */

export type Mode = "book" | "mail" | "host" | "guest" | "pay";
export type Stage = "inquiry" | "approved" | "confirmed";
export type ResStatus = "Pending inquiry" | "Approved · deposit due" | "Confirmed";

export const TODAY = 6; // demo "today": Tuesday Oct 6, 2026, 10:00 AM
export const DEMO_NOW = new Date(2026, 9, 6, 10, 0).getTime();
const KEY = "kneesup-demo-db-v2";

export const KIKI = { name: "Kiki's La Quinta", addr: "46660 Washington Street, Suites 8-9, La Quinta, CA 92253", email: "events@kikislaquinta.com", phone: "(760) 777-8008" };
export const SPACES = [
  { id: "semi", name: "Semi-Private Large Party Dining", short: "Semi-Private Dining", cap: 75, min: 12, img: "kiki-dining.jpg" },
  { id: "main", name: "Main Dining Room", short: "Main Dining Room", cap: 100, min: 10, img: "kiki-salad.jpg" },
  { id: "patio", name: "Outdoor Patio", short: "Outdoor Patio", cap: 40, min: 10, img: "kiki-sign.jpg" },
  { id: "buyout", name: "Full Venue Buyout (Including Outdoor Patio)", short: "Full Venue Buyout", cap: 100, min: 40, img: "kiki-cocktails.jpg" },
];
export const spaceOf = (id: string) => SPACES.find((s) => s.id === id) ?? SPACES[0];
export const CAL_SPACES = ["Semi-Private Dining", "Main Dining Room", "Outdoor Patio", "Full Venue Buyout"];

export type Booking = { name: string; email: string; phone: string; guests: number; note: string; event: string; spaceId: string; space: string; day: number; time: string; total: number; deposit: number };
export type Res = { id: string; guest: string; email: string; day: number; space: string; time: string; event: string; status: ResStatus; total: number; deposit: number; paid: number; guests: number; paidOn?: string[]; unread?: boolean; live?: boolean };
export type Person = { name: string; email: string; status: "Attending" | "Pending" | "Declined"; diet: string };
export type Upload = { name: string; by: string; at: string };
export type Req = { type: string; details: string; date: string; status: "Pending" | "Approved" };
export type Action = { text: string; key?: "approveMenu" | "approveRequests" };
export type Step = { label: string; done: boolean };
/** One booking in the demo database. */
export type Rec = { id: string; booking: Booking; stage: Stage; contractSigned: boolean; headcount: boolean; balancePaid: boolean; menu: string | null; menuApproved: boolean; addons: string[]; guestList: Person[]; uploads: Upload[]; requests: Req[]; guestSeen: number };
type DB = { recs: Rec[]; active: string | null; threads: Record<string, Msg[]>; read: string[]; seq: number };

export const DEFAULT_BOOKING: Booking = { name: "Allison Johnson", email: "allison.johnson@email.com", phone: "(310) 555-0198", guests: 45, note: "Birthday dinner with family and friends. We'd love the disco ball room!", event: "Allison's Birthday", spaceId: "semi", space: SPACES[0].short, day: 10, time: "6:00–9:00 PM", total: 0, deposit: 0 };
export const DEFAULT_GUESTS: Person[] = [
  { name: "Jamie Carter", email: "jamie@email.com", status: "Attending", diet: "Vegetarian" },
  { name: "Morgan Lee", email: "morgan@email.com", status: "Attending", diet: "No restrictions" },
  { name: "Taylor Reed", email: "taylor@email.com", status: "Pending", diet: "—" },
  { name: "Chris Young", email: "chris@email.com", status: "Declined", diet: "—" },
  { name: "Alex Johnson", email: "alex@email.com", status: "Attending", diet: "Gluten-free" },
  { name: "Riley Park", email: "riley@email.com", status: "Pending", diet: "Nut allergy" },
];
export const SEED_REQS: Req[] = [
  { type: "Seating arrangement", details: "Long banquet tables so everyone can sit near the birthday table.", date: "Oct 6, 9:42 AM", status: "Approved" },
  { type: "Dietary restrictions", details: "Two vegetarian guests and one gluten-free guest.", date: "Oct 6, 9:58 AM", status: "Pending" },
];
/** Suggested price for the host's approval form (Kiki's has no fixed prices). */
export const suggest = (guests: number) => { const total = guests * 40; return { total, deposit: Math.round(total / 2) }; };

const R = (day: number, guest: string, space: string, time: string, event: string, status: ResStatus, total: number, paid: number, guests: number, extra: Partial<Res> = {}): Res =>
  ({ id: guest, guest, email: guest.toLowerCase().replace(" ", ".") + "@email.com", day, space, time, event, status, total, deposit: Math.round(total / 2), paid, guests, ...extra });
export const SEED: Res[] = [
  R(6, "Elena Brooks", "Main Dining Room", "5:00–7:00 PM", "Client dinner", "Confirmed", 1200, 1200, 14, { paidOn: ["Sep 21", "Oct 1"] }),
  R(7, "Daniel Kim", "Semi-Private Dining", "5:30–8:00 PM", "Anniversary dinner", "Approved · deposit due", 900, 0, 8),
  R(8, "Olivia Chen", "Outdoor Patio", "5:00–8:00 PM", "Wedding rehearsal", "Confirmed", 2200, 1100, 30, { paidOn: ["Sep 24"] }),
  R(9, "Michael Tower", "Semi-Private Dining", "6:00–9:00 PM", "Corporate dinner", "Pending inquiry", 1800, 0, 36, { unread: true }),
  R(10, "Jordan Blake", "Outdoor Patio", "5:00–8:00 PM", "Team reception", "Confirmed", 900, 450, 14, { paidOn: ["Sep 29"] }),
  R(11, "Nora Patel", "Full Venue Buyout", "4:30–8:00 PM", "Wedding celebration", "Confirmed", 4800, 2400, 90, { paidOn: ["Sep 18"] }),
  R(13, "Sam Lee", "Semi-Private Dining", "5:00–8:00 PM", "Family dinner", "Approved · deposit due", 900, 0, 12),
  R(16, "Mia Garcia", "Main Dining Room", "7:00–9:00 PM", "Engagement dinner", "Pending inquiry", 1500, 0, 20, { unread: true }),
  R(24, "Ethan Wright", "Outdoor Patio", "5:00–9:00 PM", "Retirement party", "Confirmed", 2200, 1100, 40, { paidOn: ["Oct 1"] }),
];

export const MENUS = [
  ["Family-style feast", "House focaccia, seasonal salads, Bucatini Cacio e Pepe and braised short rib, served to share."],
  ["Preset three-course", "Choice of starter, pasta or entrée, and dessert. A seated, elegant service."],
  ["Pizza & pasta party", "Handcrafted pizzas and hearty pastas for a relaxed, high-energy night."],
];
export const MARKET = [
  ["Signature cocktail package", 450, "Two house cocktails for every guest on arrival"],
  ["Wine pairing flight", 380, "Sommelier-selected Italian and California pours"],
  ["Cake & dessert service", 220, "Plating, candles and cake cutting by our team"],
  ["DJ & dance floor", 900, "Four-hour set under the disco ball"],
  ["Photo booth", 650, "Three hours, attendant and a digital gallery"],
  ["Florals & decor styling", 425, "Table florals and custom entry styling"],
] as const;
export const TICKETED = [
  { name: "Pasta Night & Disco", day: 9, time: "7:00 PM", sold: 52, cap: 60, price: 65, space: "Main Dining Room" },
  { name: "Italian Wine Dinner", day: 15, time: "6:30 PM", sold: 28, cap: 40, price: 95, space: "Semi-Private Dining" },
  { name: "Aperitivo on the Patio", day: 23, time: "5:00 PM", sold: 24, cap: 40, price: 35, space: "Outdoor Patio" },
  { name: "Halloween Disco Ball", day: 31, time: "8:00 PM", sold: 71, cap: 100, price: 45, space: "Full Venue Buyout" },
];

export const first = (n: string) => n.split(" ")[0];
export const owed = (r: Res) => Math.max(0, r.total - r.paid);
export const dayLabel = (day: number) => new Date(2026, 9, day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
export const weekday = (day: number) => new Date(2026, 9, day).toLocaleDateString("en-US", { weekday: "long" });
/** 24h [start, end] from "6:00–9:00 PM". All bookings start in the afternoon or evening. */
export const hoursOf = (time: string): [number, number] => {
  const m = time.match(/(\d+):\d+–(\d+):\d+ (AM|PM)/);
  return m ? [(+m[1] % 12) + 12, (+m[2] % 12) + (m[3] === "PM" ? 12 : 0)] : [16, 21];
};
export const priceOf = (r: { total: number }) => (r.total ? money(r.total) : "Price TBD");
export function payLabel(r: Res) {
  if (r.status === "Pending inquiry") return "Not requested yet";
  if (r.status === "Approved · deposit due") return `Deposit ${money(r.deposit)} due`;
  return owed(r) === 0 ? "Paid in full" : `Deposit paid · ${money(owed(r))} due`;
}

const seedMsgs = (guest: string): Msg[] => {
  const r = SEED.find((x) => x.guest === guest);
  if (r?.status === "Pending inquiry") return [{ from: "guest", text: `Hi! Is ${r.space} available on Oct ${r.day} for a ${r.event.toLowerCase()} (${r.guests} guests)?`, at: "Oct 5, 4:20 PM" }];
  return [
    { from: "host", text: `Hi ${first(guest)}, please confirm your menu and final headcount by Oct ${(r?.day ?? 10) - 2}.`, at: "Oct 2, 10:14 AM" },
    { from: "guest", text: "Thanks! We'd like the family-style menu. I'll send the final guest list soon.", at: "Oct 2, 11:03 AM" },
  ];
};
const approvedMsg = (b: Booking): Msg => ({ from: "host", text: `Hi ${first(b.name)}, we'd love to host ${b.event}! Your request is approved at ${money(b.total)}. Please pay the ${money(b.deposit)} deposit to secure ${b.space} on Oct ${b.day}.`, at: "Just now" });
const confirmedMsg = (): Msg => ({ from: "host", text: "Deposit received, thank you! You can now choose your menu, sign the agreement and invite your guests from the portal.", at: "Just now" });

/* ---- the database: small pure functions over DB ---- */
const EMPTY: DB = { recs: [], active: null, threads: {}, read: [], seq: 1 };
const load = (): DB => { try { const j = localStorage.getItem(KEY); return j ? { ...EMPTY, ...JSON.parse(j) } : EMPTY; } catch { return EMPTY; } };
const patchRec = (d: DB, id: string | null, fn: (r: Rec) => Partial<Rec>): DB => ({ ...d, recs: d.recs.map((r) => (r.id === id ? { ...r, ...fn(r) } : r)) });
const addMsg = (d: DB, id: string, m: Msg, hostRead?: boolean): DB => ({ ...d, threads: { ...d.threads, [id]: [...(d.threads[id] ?? seedMsgs(id)), m] }, read: hostRead === undefined ? d.read : hostRead ? [...new Set([...d.read, id])] : d.read.filter((x) => x !== id) });
const create = (d: DB, b: Booking): DB => {
  const id = `b${d.seq}`;
  const rec: Rec = { id, booking: b, stage: "inquiry", contractSigned: false, headcount: false, balancePaid: false, menu: null, menuApproved: false, addons: [], guestList: DEFAULT_GUESTS, uploads: [], requests: [], guestSeen: 0 };
  return { ...d, seq: d.seq + 1, active: id, recs: [...d.recs, rec], threads: { ...d.threads, [id]: [{ from: "guest", text: b.note || "Hi! We'd love to book a private event.", at: "Just now", tag: "Inquiry" }] }, read: d.read.filter((x) => x !== id) };
};
const approveId = (d: DB, id: string, total: number, deposit: number): DB => {
  const r = d.recs.find((x) => x.id === id); if (!r) return d;
  const b = { ...r.booking, total, deposit };
  return addMsg(patchRec(d, id, () => ({ booking: b, stage: "approved" })), id, approvedMsg(b), true);
};
const payId = (d: DB, id: string): DB => { const r = d.recs.find((x) => x.id === id); return r ? addMsg(patchRec(d, id, () => ({ stage: "confirmed", requests: SEED_REQS })), id, confirmedMsg()) : d; };
const doApprove = (d: DB, total: number, deposit: number) => (d.active ? approveId(d, d.active, total, deposit) : d);
const doPay = (d: DB) => (d.active ? payId(d, d.active) : d);
const ORDER: Stage[] = ["inquiry", "approved", "confirmed"];
/** Jumping ahead fills in the first booking only, and never rewinds it. Later bookings stay as the guest left them. */
const ensure = (d0: DB, min: Stage): DB => {
  const d = d0.recs.length ? d0 : create(d0, { ...DEFAULT_BOOKING });
  const id = d.recs[0].id;
  let cur = ORDER.indexOf(d.recs[0].stage), n = d;
  if (cur < 1 && ORDER.indexOf(min) >= 1) { const s = suggest(n.recs[0].booking.guests); n = approveId(n, id, s.total, s.deposit); cur = 1; }
  if (cur < 2 && ORDER.indexOf(min) >= 2) n = payId(n, id);
  return n;
};

/** Is [day, time, space] taken by a held (approved/confirmed) reservation? Pending inquiries don't hold dates. */
export const clash = (rs: Res[], day: number, time: string, space: string, ignore?: string) => {
  const [a, z] = hoursOf(time);
  return rs.find((r) => r.id !== ignore && r.status !== "Pending inquiry" && r.day === day && (r.space === space || r.space === "Full Venue Buyout" || space === "Full Venue Buyout") && hoursOf(r.time)[0] < z && a < hoursOf(r.time)[1]);
};

type UI = { mode: Mode; page: string; selected: string | null; toast: string };
type Ctx = UI & {
  rec: Rec | undefined; booking: Booking; stage: Stage | "none"; contractSigned: boolean; headcount: boolean; balancePaid: boolean; menu: string | null; menuApproved: boolean; addons: string[]; guestList: Person[]; uploads: Upload[]; requests: Req[]; guestSeen: number;
  reservations: Res[]; live: Res | undefined; user: { name: string; role: string; ini: string }; unread: number;
  set: (patch: Partial<UI>) => void; toast_: (msg: string) => void; goto: (slide: string) => void; select: (id: string | null) => void; reset: () => void;
  threadOf: (id: string) => Msg[]; unreadOf: (r: Res) => boolean; markRead: (id: string) => void; sendMsg: (id: string, from: "host" | "guest", text: string, tag?: string) => void; seen: () => void;
  submitInquiry: (b: Booking) => void; approve: (total: number, deposit: number) => void; payDeposit: () => void; payBalance: () => void; signContract: () => void; confirmHeadcount: () => void;
  submitMenu: (menu: string) => void; approveMenu: () => void; toggleAddon: (name: string) => void; addGuest: (p: Person) => void; addUpload: (name: string, by: string) => void;
  addRequest: (type: string, details: string) => void; approveRequests: () => void;
  actionsFor: (r: Res) => Action[]; progressFor: (r: Res) => Step[];
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useStore = () => useContext(C);

const toRes = (r: Rec): Res => {
  const b = r.booking, conf = r.stage === "confirmed";
  return { id: r.id, guest: b.name, email: b.email, day: b.day, space: b.space, time: b.time, event: b.event, total: b.total, deposit: b.deposit, guests: b.guests, live: true,
    status: r.stage === "inquiry" ? "Pending inquiry" : r.stage === "approved" ? "Approved · deposit due" : "Confirmed",
    paid: conf ? b.deposit + (r.balancePaid ? b.total - b.deposit : 0) : 0, paidOn: conf ? ["Oct 6", ...(r.balancePaid ? ["Oct 6"] : [])] : undefined };
};

export function Provider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [ui, setUi] = useState<UI>({ mode: "book", page: "form", selected: null, toast: "" });
  const last = useRef(JSON.stringify(db));
  const timer = useRef(0);

  // persist, and follow other tabs
  useEffect(() => { const j = JSON.stringify(db); if (j !== last.current) { last.current = j; try { localStorage.setItem(KEY, j); } catch { /* storage full or blocked: demo keeps working in memory */ } } }, [db]);
  useEffect(() => {
    const on = (e: StorageEvent) => { if (e.key !== KEY && e.key !== null) return; const j = e.newValue; if (j === last.current) return; last.current = j ?? JSON.stringify(EMPTY); setDb(j ? { ...EMPTY, ...JSON.parse(j) } : EMPTY); };
    addEventListener("storage", on); return () => removeEventListener("storage", on);
  }, []);
  // the shell page drives navigation
  useEffect(() => {
    const on = (e: MessageEvent) => {
      const d = e.data;
      if (d?.k === "reset") { try { localStorage.removeItem(KEY); } catch { /* ignore */ } last.current = JSON.stringify(EMPTY); setDb(EMPTY); }
      if (d?.k === "nav") {
        if (d.ensure) setDb((p) => ensure(p, d.ensure));
        setUi((p) => ({ ...p, mode: d.mode, page: d.page ?? (d.mode === "host" ? "Overview" : d.mode === "guest" ? "My event" : "form"), selected: d.select ? "active" : null }));
      }
    };
    addEventListener("message", on);
    if (parent !== window) parent.postMessage({ k: "ready" }, "*");
    return () => removeEventListener("message", on);
  }, []);

  const set = useCallback((patch: Partial<UI>) => setUi((p) => ({ ...p, ...patch })), []);
  const toast_ = useCallback((msg: string) => { setUi((p) => ({ ...p, toast: msg })); clearTimeout(timer.current); timer.current = window.setTimeout(() => setUi((p) => ({ ...p, toast: "" })), 3200); }, []);
  const goto = useCallback((slide: string) => { if (parent !== window) parent.postMessage({ k: "goto", slide, keep: true }, "*"); }, []);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } last.current = JSON.stringify(EMPTY); setDb(EMPTY); }, []);

  const rec = db.recs.find((r) => r.id === db.active);
  const recOf = (r: Res) => db.recs.find((x) => x.id === r.id);
  const reservations = [...SEED, ...db.recs.map(toRes)].sort((x, y) => x.day - y.day || hoursOf(x.time)[0] - hoursOf(y.time)[0]);
  const live = rec ? toRes(rec) : undefined;
  const select = (id: string | null) => { if (id && db.recs.some((r) => r.id === id)) setDb((p) => ({ ...p, active: id })); setUi((p) => ({ ...p, page: "Reservations", selected: id })); };

  const threadOf = (id: string) => db.threads[id] ?? seedMsgs(id);
  const unreadOf = (r: Res) => !db.read.includes(r.id) && (r.live ? threadOf(r.id).at(-1)?.from === "guest" : !!r.unread);
  const unread = reservations.filter(unreadOf).length;
  const markRead = (id: string) => setDb((p) => (p.read.includes(id) ? p : { ...p, read: [...p.read, id] }));
  const sendMsg = (id: string, from: "host" | "guest", text: string, tag?: string) => setDb((p) => addMsg(p, id, { from, text, at: "Just now", tag }, from === "host"));
  const seen = () => setDb((p) => patchRec(p, p.active, (r) => ({ guestSeen: (p.threads[r.id] ?? []).length })));

  const act = (fn: (r: Rec) => Partial<Rec>) => setDb((p) => patchRec(p, p.active, fn));
  const submitInquiry = (b: Booking) => { setDb((p) => create(p, { ...b, total: 0, deposit: 0 })); };
  const approve = (total: number, deposit: number) => setDb((p) => doApprove(p, total, deposit));
  const payDeposit = () => setDb(doPay);
  const pending = (r?: Rec) => (r?.requests ?? []).filter((q) => q.status === "Pending").length;

  const actionsFor = (r: Res): Action[] => {
    if (r.status === "Pending inquiry") return [{ text: "Review the inquiry, set the price and send a deposit request" }];
    if (r.status === "Approved · deposit due") return [{ text: `Waiting for ${first(r.guest)} to pay the ${money(r.deposit)} deposit` }];
    const a: Action[] = [], x = recOf(r);
    if (x) {
      if (x.menu && !x.menuApproved) a.push({ text: `Approve ${first(r.guest)}'s menu choice: ${x.menu}`, key: "approveMenu" });
      else if (!x.menu) a.push({ text: "Waiting for the guest to choose a menu" });
      if (pending(x)) a.push({ text: `${pending(x)} guest request${pending(x) > 1 ? "s" : ""} to review`, key: "approveRequests" });
      if (!x.contractSigned) a.push({ text: "Venue agreement is awaiting the guest's signature" });
      if (!x.headcount) a.push({ text: `Final headcount due Oct ${r.day - 2}` });
    } else a.push({ text: `Final headcount due Oct ${r.day - 2}` });
    if (owed(r) > 0) a.push({ text: `${money(owed(r))} balance due Oct ${r.day - 1}` });
    return a;
  };
  const progressFor = (r: Res): Step[] => {
    const ok = r.status !== "Pending inquiry", dep = r.status === "Confirmed", x = recOf(r);
    return [
      { label: "Inquiry", done: true },
      { label: "Venue & space", done: ok },
      { label: "Deposit", done: dep },
      { label: "Food & beverage", done: !!x?.menuApproved },
      { label: "Additional details", done: !!x && x.requests.length > 0 && pending(x) === 0 },
      { label: "Final guest count", done: !!x?.headcount },
      { label: "Final terms & contracts", done: !!x?.contractSigned },
      { label: "Remaining balance", done: dep && owed(r) === 0 },
      { label: "Event day", done: false },
    ];
  };

  const v = {
    rec, booking: rec?.booking ?? DEFAULT_BOOKING, stage: (rec?.stage ?? "none") as Stage | "none", contractSigned: !!rec?.contractSigned, headcount: !!rec?.headcount, balancePaid: !!rec?.balancePaid, menu: rec?.menu ?? null, menuApproved: !!rec?.menuApproved,
    addons: rec?.addons ?? [], guestList: rec?.guestList ?? DEFAULT_GUESTS, uploads: rec?.uploads ?? [], requests: rec?.requests ?? [], guestSeen: rec?.guestSeen ?? 0,
  };
  return <C.Provider value={{ ...ui, selected: ui.selected === "active" ? db.active : ui.selected, ...v, reservations, live, user: { name: "Jack", role: "Owner", ini: "J" }, unread, set, toast_, goto, select, reset, threadOf, unreadOf, markRead, sendMsg, seen,
    submitInquiry, approve, payDeposit, payBalance: () => act(() => ({ balancePaid: true })), signContract: () => act(() => ({ contractSigned: true })), confirmHeadcount: () => act(() => ({ headcount: true })),
    submitMenu: (menu) => setDb((p) => ({ ...patchRec(p, p.active, () => ({ menu, menuApproved: false })), read: p.read.filter((x) => x !== p.active) })),
    approveMenu: () => act(() => ({ menuApproved: true })), toggleAddon: (n) => act((r) => ({ addons: r.addons.includes(n) ? r.addons.filter((x) => x !== n) : [...r.addons, n] })),
    addGuest: (g) => act((r) => ({ guestList: [...r.guestList, g] })), addUpload: (name, by) => act((r) => ({ uploads: [...r.uploads, { name, by, at: "Just now" }] })),
    addRequest: (type, details) => act((r) => ({ requests: [{ type, details, date: "Just now", status: "Pending" }, ...r.requests] })), approveRequests: () => act((r) => ({ requests: r.requests.map((q) => ({ ...q, status: "Approved" as const })) })),
    actionsFor, progressFor }}>{children}</C.Provider>;
}
