// Makes a Résumé Studio unlock code by hand, for someone who paid by bank transfer or WiPay.
// No redeploy needed: the site checks the code's signature using RESUME_CODE_SECRET.
//   RESUME_CODE_SECRET=<same value as on Vercel> node scripts/resume/make-code.mjs RS-2024-ABCD
// The argument is the order reference the customer was shown (any digits in it are used), or leave it out for a fresh number.
import { makeCode, maxAgeDays } from "../../api/_resumeCodes.js";

if (!process.env.RESUME_CODE_SECRET) {
  console.error("Set RESUME_CODE_SECRET to the same value you set on Vercel, then run again.");
  process.exit(1);
}
const ref = process.argv[2] || "";
const digits = ref.replace(/\D/g, "");
const id = digits || String(Date.now()).slice(-9);
console.log(`\nUnlock code: ${makeCode(id)}\nWorks for ${maxAgeDays()} days. Email it to the customer with the steps on the Get it page.\n`);
