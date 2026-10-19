import { useState } from "react";
import { Icon } from "./ui";
import { VENUE, Provider, useStore } from "./store";
import { Book } from "./Book";
import Mail from "./Mail";
import Guest from "./Guest";
import { CalendarView, Header, Overview, ReservationDetail, Reservations, Sidebar } from "./Host";
import { CustomersView, EventsView, InsightsView, MessagesView, PaymentsView, SettingsView } from "./Pages";

const META: Record<string, [string, string]> = {
  Overview: ["Good morning, Jack", `Here's what's happening at ${VENUE.name}`],
  Calendar: ["Reservation calendar", `Inquiries, holds and confirmed events across ${VENUE.name} spaces`],
  Reservations: ["Reservations", "Every guest, space and payment, including requests made a moment ago"],
  Events: ["Events", `Ticketed nights hosted by ${VENUE.name}`],
  Customers: ["Customers", "Guests who have booked or asked about a booking"],
  Messages: ["Messages", "The same conversation the guest sees in their portal"],
  Payments: ["Payments", "What's paid, what's outstanding, and deposits still to come"],
  Insights: ["Insights", "October at a glance"],
  Settings: ["Settings", `${VENUE.name} venue details`],
};

function HostApp() {
  const s = useStore();
  const [menu, setMenu] = useState(false);
  const navigate = (page: string) => s.set({ page, selected: null });
  const [title, subtitle] = META[s.page] ?? META.Overview;
  const body = s.selected ? <ReservationDetail guest={s.selected} onBack={() => s.set({ selected: null })} />
    : s.page === "Calendar" ? <CalendarView openReservation={s.select} />
    : s.page === "Reservations" ? <Reservations openReservation={s.select} />
    : s.page === "Events" ? <EventsView />
    : s.page === "Customers" ? <CustomersView openReservation={s.select} />
    : s.page === "Messages" ? <MessagesView openReservation={s.select} />
    : s.page === "Payments" ? <PaymentsView openReservation={s.select} />
    : s.page === "Insights" ? <InsightsView />
    : s.page === "Settings" ? <SettingsView />
    : <Overview openReservation={s.select} navigate={navigate} />;
  return <div className="min-h-screen bg-[#f3f6fa] text-[#19334c]">
    <Sidebar open={menu} setOpen={setMenu} navigate={navigate} />
    {menu && <button className="fixed inset-0 z-30 bg-[#071d32]/35 lg:hidden" onClick={() => setMenu(false)} aria-label="Close navigation" />}
    <main className="min-h-screen lg:pl-[230px]"><div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-8">
      {!s.selected && <Header title={title} subtitle={subtitle} setMenu={setMenu} onNew={() => s.goto("venue")} />}
      {body}
    </div></main>
    {s.toast && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#123b34] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Icon name="check" size={15} />{s.toast}</div>}
  </div>;
}

function Root() {
  const { mode } = useStore();
  if (mode === "book") return <Book />;
  if (mode === "mail") return <Mail />;
  if (mode === "guest") return <Guest />;
  return <HostApp />;
}

export default function App() {
  return <Provider><Root /></Provider>;
}
