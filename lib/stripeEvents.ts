export function isPaidCheckoutEvent(eventType: string, paymentStatus?: string | null) {
  if (eventType === "checkout.session.async_payment_succeeded") return true;
  return eventType === "checkout.session.completed" && paymentStatus === "paid";
}
