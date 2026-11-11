/**
 * How clients pay. Fill in `bank` and the Pay page shows it with a reference code per payment.
 * While it is empty the page shows no account details and sends the visitor to ask you for them.
 */
export const bank = {
  accountName: "",
  bank: "",
  accountNumber: "",
  branch: "",
  currency: "",
};

export const bankReady = Object.values(bank).every((v) => v.trim());

/** Scope only, no prices: every package is quoted within 24 hours. */
export const packages = [
  { name: "Launch page", scope: "A clear one-to-five page site on your own domain, built for phones first, with a contact form that reaches you.", fits: "A new business, a church, a service you want found." },
  { name: "Business system", scope: "Ordering, bookings, dashboards or reporting shaped around how your business already works.", fits: "A shop, bakery, salon or team doing the same tasks by hand." },
  { name: "Keep it running", scope: "Fixes, updates and small changes after launch, on a simple monthly arrangement.", fits: "Anyone who wants a person to call when something breaks." },
];
