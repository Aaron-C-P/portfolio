/**
 * Résumé Studio settings. The page works for free up to the preview; the clean download costs `price`.
 * Cards are never typed into this site: set VITE_RESUME_CHECKOUT_URL to a hosted payment link
 * (Lemon Squeezy, PayPal, or any provider that accepts you) and the Pay button opens it.
 * Until then the page offers bank transfer / WiPay using the details in src/data/pay.ts.
 */
export const studio = {
  name: "Résumé Studio",
  price: 10,
  currency: "USD",
  checkoutUrl: ((import.meta.env.VITE_RESUME_CHECKOUT_URL as string | undefined) ?? "").trim(),
};

export const priceLabel = `$${studio.price} ${studio.currency}`;
