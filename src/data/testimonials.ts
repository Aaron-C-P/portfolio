/**
 * Real words from real clients only. Visitors can send one from the Home page; it reaches your Leads
 * (filter "Testimonial") and is NOT shown until you copy it here with the person's permission.
 */
export type Testimonial = { quote: string; name: string; role?: string };
export const testimonials: Testimonial[] = [];
