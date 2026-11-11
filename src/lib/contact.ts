import { brand } from "@/data/studio";

/** WhatsApp link with a starting message, so the visitor only has to press send. */
export const whatsappAbout = (about: string) => `https://wa.me/18767902268?text=${encodeURIComponent(`Hi Aaron, I would like help with ${about}`)}`;
export const whatsapp = whatsappAbout("");

const vcard = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  `FN:${brand.name}`,
  "N:Prince;Aaron;;;",
  `ORG:${brand.studio}`,
  "TITLE:Computer Science graduate, tutor and developer",
  `TEL;TYPE=CELL:${brand.phone}`,
  `EMAIL:${brand.email}`,
  `URL:${brand.linkedin}`,
  "ADR;TYPE=WORK:;;;Mandeville;Manchester;;Jamaica",
  "END:VCARD",
].join("\r\n");

/** Downloads a .vcf so the visitor can add Aaron to their contacts in one tap. */
export const saveContact = () => {
  const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "aaron-prince.vcf";
  a.click();
  URL.revokeObjectURL(url);
};
