# The Webber: MVP and go-to-market

Tagline: **Let's web you in.**
Promise: *Be the business people can find.* One fee, a website in a minute, and the owner stays in control.

## The MVP (what ships first, nothing more)

Already built and tested:

1. Describe your business, get a one-page site (AI on free OpenRouter models, built-in design as a fallback).
2. Tap to edit words and photos. Ask the AI for bigger changes. Undo from history.
3. Publish to its own link (`name.yourdomain.com`), take it offline, or cancel.
4. One fee, up to 3 sites, 250 AI changes a month. 14-day free trial.

Not in the MVP, on purpose: multi-page sites, a blog, online payments, bookings, templates marketplace, team seats. Add one only when three paying customers ask for the same thing.

Still to switch on before launch: `OPENROUTER_API_KEY`, a bucket (`STORAGE_DRIVER=s3`), a domain with wildcard DNS, and card payments (Lemon Squeezy) or manual WhatsApp/bank payment.

## Who it is for (the first market)

Small businesses in Jamaica and the Caribbean that already sell through WhatsApp and Instagram but have no website: barbers and salons, cook shops and caterers, tutors and lesson teachers, churches, tour and taxi operators, tradespeople. They do not need a "platform"; they need to be found and to look trusted. Start with one town and one or two trades so word of mouth spreads inside a group that knows each other.

## The offer

- Free for 14 days, no card. They see their own business on a real site before paying anything.
- One fee after that. No tiers to compare, no "Pro" to wonder about. (Default is $19 a month; change `PRICE_STARTER`.)
- Cancel any time, site goes quiet, nothing is deleted. Removing the fear of being trapped is part of the sale.
- Pay by card, bank transfer or WiPay for people without cards.

## Creating desire (honest persuasion)

What makes people want it is seeing it work for them. The tactics below all use true statements only.

1. **Show, do not tell.** Build a sample site for a real local business before you pitch (use their public name, hours and Instagram bio, mark it clearly "sample"). Send them the link on WhatsApp: "I made this for Island Spice Kitchen. Want it live?" Seeing their own name on a clean site is the strongest persuasion there is, and it is reciprocity: you gave first.
2. **Make the outcome vivid.** Lead with what changes for them: customers find you, one tap to WhatsApp, you can fix a price in 20 seconds. The landing page opens with that picture.
3. **Remove effort and fear.** "If you can send a WhatsApp message you can run your site." "Undo any change." "Cancel any time."
4. **Social proof, once it is real.** After the first customers, ask permission for a screenshot and one line. Never invent testimonials or counts; the product itself refuses to write fake reviews and the marketing should hold the same line.
5. **Real urgency only.** The free trial and a genuine launch offer (for example, the first 20 customers keep their price for life, if you commit to honouring that) are fine. A countdown that resets is not.
6. **A memorable line.** "Let's web you in." goes on the landing page, the intro film, the Work page and every sample link.

## Channels, in order

1. **WhatsApp outreach with sample sites.** 10 samples a week, 1 message each, follow up once.
2. **Instagram and TikTok before/after clips** (screen recording of describing a business and the site appearing). Use the spider mark and the tagline.
3. **Local groups and referrals.** Offer one month free to anyone who brings a business that signs up.
4. **A "Made with The Webber" footer link** on trial sites. Every site is a small ad.
5. **The portfolio.** The Webber case study and the Home banner send visitors to a working example.

## Measure the MVP

Targets for the first 60 days: 30 samples sent, 10 trials started, 4 paying. If trials start but nobody pays, the problem is the first-site quality, so improve the generation prompt and templates. If nobody starts, the problem is the pitch, so change the sample message and the trade you target.

Track in the admin panel: sign-ups, sites published, AI changes used, paid versus trial.

## Costs and the "earn while I sleep" goal

The AI runs on free models (1000 requests a day after a one-time $10 OpenRouter credit purchase), sites are static files in a bucket, and one small server runs everything. Monthly cost stays low and flat, so each extra customer is mostly margin. Daily support should be near zero because owners edit their own sites; keep a WhatsApp number for the few who need help.
