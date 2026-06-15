import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanCompanyName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .replace(/\.JK/gi, '')
    .replace(/^(PT\.?\s+)/i, '') // Hapus awalan PT
    .replace(/\(\s*Persero\s*\)/gi, '')
    .replace(/Persero/gi, '')
    .replace(/\(\s*\)/g, '') // Hapus tanda kurung kosong jika ada
    .replace(/  +/g, ' ')
    .trim();
}
