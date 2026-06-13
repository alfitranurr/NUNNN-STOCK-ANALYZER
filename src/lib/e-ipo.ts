/**
 * E-IPO Jeli Logic Helper
 * Calculates OJK IPO central allocation (penjatahan terpusat), clawbacks,
 * and splits between Retail & Non-Retail under old (SEOJK 15/2020) and new (SEOJK 25/2025) rules.
 */

export interface EIpoInput {
  ticker: string;
  companyName: string;
  price: number; // Harga per lembar saham (IDR)
  totalLots: number; // Jumlah lot ditawarkan
  oversubscription: number; // Kali oversubscription (X), misal 25
  totalSubscribers: number; // Asumsi jumlah pemesan total (orang)
  retailRatio: number; // Persentase pemesan ritel (%), misal 80
  personalOrderLots?: number; // Jumlah pesanan lot user sendiri (opsional)
}

export interface RuleAllotmentDetail {
  totalPoolLots: number;
  retailPoolLots: number;
  nonRetailPoolLots: number;
  retailAllotmentPerPerson: number; // dalam Lot (desimal)
  nonRetailAllotmentPerPerson: number; // dalam Lot (desimal)
  retailProbability1Lot: number; // Peluang mendapat 1 lot (%)
  nonRetailProbability1Lot: number; // Peluang mendapat 1 lot (%)
  personalAllotmentProportional: number; // Lot dari pemesanan pribadi (proporsional)
  personalAllotmentAverage: number; // Lot dari pemesanan pribadi (alokasi rata-rata minimum)
  personalAllotmentGuaranteed: number; // Lot yang dijamin didapat (pembulatan ke bawah)
  personalAllotmentProbabilityExtra: number; // Peluang dapat 1 lot tambahan (%)
}

export interface EIpoResult {
  emissionValue: number; // Nilai Emisi (IDR)
  golongan: number; // Golongan Penawaran Umum (1 - 5)
  initialPercentage: number; // Persentase alokasi awal terpusat (%)
  initialLots: number; // Jumlah lot alokasi awal
  adjustedPercentage: number; // Persentase alokasi setelah clawback (%)
  adjustedLots: number; // Jumlah lot alokasi setelah clawback
  retailSubscribers: number; // Jumlah pemesan ritel (orang)
  nonRetailSubscribers: number; // Jumlah pemesan non-ritel (orang)
  oldRule: RuleAllotmentDetail; // Perhitungan di bawah SEOJK 15/2020 (1:2)
  newRule: RuleAllotmentDetail; // Perhitungan di bawah SEOJK 25/2025 (1:1)
}

/**
 * Mendapatkan Golongan Penawaran Umum berdasarkan Nilai Emisi
 * Golongan I: <= 100 Miliar
 * Golongan II: > 100 Miliar s.d <= 250 Miliar
 * Golongan III: > 250 Miliar s.d <= 500 Miliar
 * Golongan IV: > 500 Miliar s.d <= 1 Triliun
 * Golongan V: > 1 Triliun
 */
export function getGolongan(emissionValue: number): number {
  if (emissionValue <= 100_000_000_000) return 1;
  if (emissionValue <= 250_000_000_000) return 2;
  if (emissionValue <= 500_000_000_000) return 3;
  if (emissionValue <= 1_000_000_000_000) return 4;
  return 5;
}

/**
 * Mendapatkan batasan minimal dan alokasi awal saham terpusat
 * Mengembalikan objek berisi persentase alokasi awal dan nilai rupiah minimal.
 */
export function getInitialAllocationConfig(golongan: number): { percentage: number; minRupiah: number } {
  switch (golongan) {
    case 1:
      return { percentage: 20, minRupiah: 10_000_000_000 };
    case 2:
      return { percentage: 15, minRupiah: 20_000_000_000 };
    case 3:
      return { percentage: 10, minRupiah: 37_500_000_000 };
    case 4:
      return { percentage: 7.5, minRupiah: 50_000_000_000 };
    case 5:
    default:
      return { percentage: 2.5, minRupiah: 75_000_000_000 };
  }
}

/**
 * Menghitung persentase alokasi terpusat awal yang sebenarnya (mana yang lebih tinggi nilainya)
 */
export function calculateInitialAllotment(emissionValue: number, price: number): { percentage: number; lots: number } {
  const golongan = getGolongan(emissionValue);
  const config = getInitialAllocationConfig(golongan);
  
  const valFromPct = emissionValue * (config.percentage / 100);
  const finalVal = Math.max(valFromPct, config.minRupiah);
  
  // Konversi balik ke persentase & lot
  const finalLots = finalVal / (price * 100);
  const finalPct = (finalVal / emissionValue) * 100;
  
  return {
    percentage: Math.min(finalPct, 100),
    lots: Math.min(finalLots, emissionValue / (price * 100))
  };
}

/**
 * Mendapatkan persentase penyesuaian alokasi terpusat (Clawback) berdasarkan oversubscription
 */
export function getClawbackPercentage(golongan: number, oversubscription: number, initialPct: number): number {
  if (oversubscription < 2.5) {
    return initialPct; // Tidak ada penyesuaian
  }

  let adjustedPct = initialPct;

  if (oversubscription >= 2.5 && oversubscription < 10) {
    // Penyesuaian I
    switch (golongan) {
      case 1: adjustedPct = 22.5; break;
      case 2: adjustedPct = 17.5; break;
      case 3: adjustedPct = 12.5; break;
      case 4: adjustedPct = 10; break;
      case 5: adjustedPct = 5; break;
    }
  } else if (oversubscription >= 10 && oversubscription < 25) {
    // Penyesuaian II
    switch (golongan) {
      case 1: adjustedPct = 25; break;
      case 2: adjustedPct = 20; break;
      case 3: adjustedPct = 15; break;
      case 4: adjustedPct = 12.5; break;
      case 5: adjustedPct = 7.5; break;
    }
  } else if (oversubscription >= 25) {
    // Penyesuaian III
    switch (golongan) {
      case 1: adjustedPct = 30; break;
      case 2: adjustedPct = 25; break;
      case 3: adjustedPct = 20; break;
      case 4: adjustedPct = 17.5; break;
      case 5: adjustedPct = 12.5; break;
    }
  }

  // Jika persentase alokasi awal secara tidak sengaja lebih tinggi dibanding penyesuaian, gunakan yang tertinggi
  return Math.max(initialPct, adjustedPct);
}

/**
 * Menghitung detail pembagian lot dan peluang untuk aturan tertentu
 */
function getRuleDetails(
  poolLots: number,
  retailSubscribers: number,
  nonRetailSubscribers: number,
  retailShare: number, // Porsi alokasi ritel (misal 0.5 untuk 1:1, atau 0.3333 untuk 1:2)
  oversubscription: number,
  personalOrderLots: number,
  personalOrderIsRetail: boolean
): RuleAllotmentDetail {
  const retailPoolLots = poolLots * retailShare;
  const nonRetailPoolLots = poolLots * (1 - retailShare);
  
  const retailAllotmentPerPerson = retailSubscribers > 0 ? retailPoolLots / retailSubscribers : 0;
  const nonRetailAllotmentPerPerson = nonRetailSubscribers > 0 ? nonRetailPoolLots / nonRetailSubscribers : 0;

  // Peluang mendapat 1 lot minimal (lottery probability)
  // Jika jatah rata-rata >= 1, peluang mendapat jatah min adalah 100%
  // Jika < 1, peluangnya adalah proporsional dari desimalnya.
  const retailProbability1Lot = retailAllotmentPerPerson >= 1 ? 100 : retailAllotmentPerPerson * 100;
  const nonRetailProbability1Lot = nonRetailAllotmentPerPerson >= 1 ? 100 : nonRetailAllotmentPerPerson * 100;

  // Perhitungan pesanan pribadi
  const targetMinAllotment = personalOrderIsRetail ? retailAllotmentPerPerson : nonRetailAllotmentPerPerson;
  
  // Alokasi proporsional murni berdasarkan oversubscription
  const personalAllotmentProportional = oversubscription > 0 ? personalOrderLots / oversubscription : personalOrderLots;
  
  // Alokasi rata-rata minimum (pooling allotment minimum per orang)
  const personalAllotmentAverage = Math.min(personalOrderLots, targetMinAllotment);

  // Bagian dijamin dapat & peluang ekstra (untuk representasi desimal)
  // Jatah total estimasi: bisa proporsional atau average depending on scenario, 
  // di sini kita gunakan model proporsional sebagai estimasi realistis pesanan besar, 
  // dan alokasi rata-rata sebagai batas bawah (jika dijatah merata).
  const estimatedAllotment = Math.max(personalAllotmentAverage, personalAllotmentProportional);
  
  const personalAllotmentGuaranteed = Math.floor(estimatedAllotment);
  const extraPart = estimatedAllotment - personalAllotmentGuaranteed;
  const personalAllotmentProbabilityExtra = extraPart * 100;

  return {
    totalPoolLots: poolLots,
    retailPoolLots,
    nonRetailPoolLots,
    retailAllotmentPerPerson,
    nonRetailAllotmentPerPerson,
    retailProbability1Lot,
    nonRetailProbability1Lot,
    personalAllotmentProportional,
    personalAllotmentAverage,
    personalAllotmentGuaranteed,
    personalAllotmentProbabilityExtra
  };
}

/**
 * Menghitung simulasi penjatahan E-IPO lengkap
 */
export function calculateEIpoAllotment(input: EIpoInput): EIpoResult {
  const { price, totalLots, oversubscription, totalSubscribers, retailRatio, personalOrderLots = 0 } = input;
  
  const totalShares = totalLots * 100;
  const emissionValue = totalShares * price;
  const golongan = getGolongan(emissionValue);
  
  // 1. Alokasi Awal Terpusat
  const initialAllotment = calculateInitialAllotment(emissionValue, price);
  
  // 2. Alokasi Setelah Clawback (Penyesuaian)
  const adjustedPct = getClawbackPercentage(golongan, oversubscription, initialAllotment.percentage);
  const adjustedLots = totalLots * (adjustedPct / 100);
  
  // 3. Jumlah Pemesan
  const retailSubscribers = Math.round(totalSubscribers * (retailRatio / 100));
  const nonRetailSubscribers = Math.round(totalSubscribers * (1 - retailRatio / 100));

  // 4. Deteksi kategori pesanan pribadi
  const personalOrderValue = personalOrderLots * 100 * price;
  const personalOrderIsRetail = personalOrderValue <= 100_000_000;

  // 5. Hitung Detail Aturan Lama (SEOJK 15/2020 - Rasio Ritel vs Non-Ritel = 1:2)
  const oldRule = getRuleDetails(
    adjustedLots,
    retailSubscribers,
    nonRetailSubscribers,
    1 / 3, // Porsi ritel adalah 1 bagian dari total 3 bagian
    oversubscription,
    personalOrderLots,
    personalOrderIsRetail
  );

  // 6. Hitung Detail Aturan Baru (SEOJK 25/2025 - Rasio Ritel vs Non-Ritel = 1:1)
  const newRule = getRuleDetails(
    adjustedLots,
    retailSubscribers,
    nonRetailSubscribers,
    1 / 2, // Porsi ritel adalah 1 bagian dari total 2 bagian (50%)
    oversubscription,
    personalOrderLots,
    personalOrderIsRetail
  );

  return {
    emissionValue,
    golongan,
    initialPercentage: initialAllotment.percentage,
    initialLots: initialAllotment.lots,
    adjustedPercentage: adjustedPct,
    adjustedLots,
    retailSubscribers,
    nonRetailSubscribers,
    oldRule,
    newRule
  };
}
