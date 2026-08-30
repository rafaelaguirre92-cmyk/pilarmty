import type { Locale } from "@/lib/types";

export type GiveBankDetails = {
  bank: string;
  holder: string;
  account: string;
  clabe: string;
  card: string;
  cardCopy: string;
};

const bankDetails: GiveBankDetails = {
  bank: "Santander",
  holder: "Pilar de la Verdad AC",
  account: "65511504306",
  clabe: "014580655115043062",
  card: "5579 0890 0748 5256",
  cardCopy: "5579089007485256"
};

export function getGiveBankDetails(_locale: Locale) {
  return bankDetails;
}
