export type Hint = {
  role: 'Guest' | 'Venue host'; title: string; text: string; emphasis?: string;
  target: (doc: Document) => HTMLElement | null;
};
const clean = (text: string | null) => (text || '').replace(/\s+/g, ' ').trim();
export const find = (doc: Document, selector: string, text: string | RegExp) =>
  Array.from(doc.querySelectorAll<HTMLElement>(selector)).find(el =>
    el.getClientRects().length && (typeof text === 'string' ? clean(el.textContent) === text : text.test(clean(el.textContent)))) ?? null;
export const button = (doc: Document, text: string | RegExp) => find(doc, 'button', text);
const heading = (doc: Document, text: string | RegExp) => find(doc, 'h1,h2,h3', text);
export const IDS = ['venue','book','checkout','sent','mailHost','review','mailGuest','pay','confirmed','hostbook','calendar','messages'];

export function hintFor(id: string, doc: Document, action: boolean): Hint {
  switch (id) {
    case 'venue': return { role:'Guest', title:'Start a booking', text:'Click Book Full Venue to request the entire venue.', emphasis:'Book Full Venue', target:d=>button(d,'Book Full Venue') };
    case 'book': {
      const next = button(doc,'Continue reservation') as HTMLButtonElement | null;
      if (action && next?.disabled) return {role:'Guest', title:'Choose an available date and time', text:'Continue is unavailable for this selection. Check the availability message and choose a free date or a valid time range.', target:d=>heading(d,'Select date & time')?.closest('section') ?? null};
      return {role:'Guest', title:action?'Continue with your selection':'Choose a space, date and time', text:action?'Select Continue reservation to enter your guest and event details.':'Keep the full venue or choose one space, then select an available date and time.', target:d=>action?button(d,'Continue reservation'):heading(d,/^Select space/)?.closest('section')??null};
    }
    case 'checkout': return {role:'Guest', title:action?'Send your request':'Review your event details', text:action?'Select Reserve Now. This sends an inquiry; it does not confirm the booking or take payment.':'Check the sample contact details, guest count and event description. No payment is taken at this stage.', target:d=>action?button(d,'Reserve Now'):heading(d,'Confirm reservation details')};
    case 'sent': return {role:'Guest', title:'Your request is with the venue', text:'Select “See what KneesUp Tavern receives” to switch to the host’s inbox. Approval and payment come next.', target:d=>button(d,/^See what .* receives$/)};
    case 'mailHost': return {role:'Venue host', title:'Now you’re the venue host', text:'The guest’s request has arrived. Select Review request to inspect it and prepare a quote.', target:d=>button(d,'Review request')};
    case 'review': {
      if (button(doc,'See guest email')) return {role:'Venue host',title:'The quote has been sent',text:'Select See guest email to view the deposit invitation as the guest.',target:d=>button(d,'See guest email')};
      if (!button(doc,'Approve & send deposit request') && heading(doc,/^Reservation ·/)) return {role:'Venue host',title:'This booking has already progressed',text:'You’re revisiting the same booking. Use Start over to replay approval, or Next to continue the walkthrough.',target:d=>heading(d,/^Reservation ·/)};
      return {role:'Venue host',title:action?'Send the quote':'Set the price and deposit',text:action?'Select Approve & send deposit request. The guest will receive the quote and payment invitation.':'Review the event price and deposit. The suggested deposit starts at 50%; you can adjust either amount.',target:d=>action?button(d,'Approve & send deposit request'):find(d,'label','Event price')?.parentElement??null};
    }
    case 'mailGuest': return {role:'Guest',title:'Now you’re back with the guest',text:'Review the approved quote, then select the deposit button to open the guest portal.',target:d=>button(d,/^Pay .* deposit$/)};
    case 'pay': {
      if (!button(doc,/^Pay .* deposit/)) return {role:'Guest',title:'The deposit is already paid',text:'This demo keeps your booking as you move Back and Next. Continue to confirmation, or use Start over to replay the payment.',target:d=>heading(d,'Booking summary')};
      return {role:'Guest',title:'Try the demo deposit',text:'Select Pay deposit, then use the prefilled test payment. This is a simulation; no real money moves.',target:d=>button(d,/^Pay .* deposit/)};
    }
    case 'confirmed': return {role:'Guest',title:'The booking is confirmed',text:'The deposit secures the booking. Review the confirmed status and event details, then use Next to see the host’s side.',target:d=>heading(d,/ · /)};
    case 'hostbook': return {role:'Venue host',title:'The same booking, on the host’s side',text:'Review the confirmed reservation and payment status. Select Next to find it on the calendar.',target:d=>heading(d,/^Reservation ·/)};
    case 'calendar': {
      if (heading(doc,/^Reservation ·/)) return {role:'Venue host',title:'Inspect the reservation',text:'You opened a calendar booking. Use the existing Calendar navigation to return, or Next to continue to messaging.',target:d=>heading(d,/^Reservation ·/)};
      return {role:'Venue host',title:'Explore the calendar views',text:'Switch between Month, Week and Day, then select a reservation to inspect it. Confirmed bookings hold their space.',target:d=>button(d,'Week')?.parentElement??null};
    }
    default: return {role:'Venue host',title:'Keep the conversation together',text:'Choose the guest’s conversation and send a sample reply. It is shared with the guest portal. Use Open reservation → Open guest portal → Messages to see the guest’s side.',target:d=>button(d,'Send')?.parentElement??null};
  }
}
