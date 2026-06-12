export interface CompoundingInput {
  title: string;
  initialAmount: number;
  contributionAmount: number;
  contributionFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  annualReturnRate: number;
  compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'yearly';
  durationYears: number;
  durationMonths: number;
  inflationRate: number;
  taxRate: number;
}

export interface CompoundingPeriodDetail {
  period: number; // Nomor bulan (1, 2, 3...)
  year: number;
  month: number; // Bulan ke-n di tahun tersebut (1-12)
  startingBalance: number;
  deposit: number;
  interestEarned: number;
  taxDeducted: number;
  endingBalance: number;
  realEndingBalance: number; // Disesuaikan inflasi
  cumulativeDeposits: number;
  cumulativeInterest: number;
  cumulativeTax: number;
}

export interface CompoundingYearlySummary {
  year: number;
  startingBalance: number;
  totalDeposits: number;
  totalInterestEarned: number;
  totalTaxDeducted: number;
  endingBalance: number;
  realEndingBalance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
}

export interface CompoundingResult {
  nominalEndingBalance: number;
  realEndingBalance: number;
  totalDeposits: number;
  totalInterestEarned: number;
  totalTaxDeducted: number;
  monthlyDetails: CompoundingPeriodDetail[];
  yearlySummaries: CompoundingYearlySummary[];
}

/**
 * Menghitung simulasi bunga majemuk (compounding interest) secara rinci bulan demi bulan.
 */
export function calculateCompounding(input: CompoundingInput): CompoundingResult {
  const {
    initialAmount,
    contributionAmount,
    contributionFrequency,
    annualReturnRate,
    compoundingFrequency,
    durationYears,
    durationMonths,
    inflationRate,
    taxRate
  } = input;

  const totalMonths = Math.max(1, durationYears * 12 + durationMonths);
  const r_annual = annualReturnRate / 100;
  const i_annual = inflationRate / 100;
  const t_rate = taxRate / 100;

  // 1. Hitung interest rate bulanan ekuivalen (r_monthly) berdasarkan frekuensi compounding
  let r_monthly = 0;
  if (compoundingFrequency === 'yearly') {
    r_monthly = Math.pow(1 + r_annual, 1 / 12) - 1;
  } else if (compoundingFrequency === 'quarterly') {
    r_monthly = Math.pow(1 + r_annual / 4, 1 / 3) - 1;
  } else if (compoundingFrequency === 'monthly') {
    r_monthly = r_annual / 12;
  } else if (compoundingFrequency === 'daily') {
    // Menggunakan 365 hari setahun, ekuivalen bulanan
    r_monthly = Math.pow(1 + r_annual / 365, 365 / 12) - 1;
  }

  // 2. Hitung inflasi bulanan ekuivalen (i_monthly)
  const i_monthly = Math.pow(1 + i_annual, 1 / 12) - 1;

  // 3. Simulasikan bulan demi bulan
  const monthlyDetails: CompoundingPeriodDetail[] = [];
  let currentBalance = initialAmount;
  let cumulativeDeposits = initialAmount;
  let cumulativeInterest = 0;
  let cumulativeTax = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const startingBalance = currentBalance;
    const year = Math.ceil(m / 12);
    const monthOfYear = m % 12 === 0 ? 12 : m % 12;

    // Hitung deposit bulan ini
    let deposit = 0;
    if (contributionFrequency === 'daily') {
      // Pendekatan 30.417 hari per bulan
      deposit = contributionAmount * 30.417;
    } else if (contributionFrequency === 'weekly') {
      // Pendekatan 4.333 minggu per bulan
      deposit = contributionAmount * 4.333;
    } else if (contributionFrequency === 'monthly') {
      deposit = contributionAmount;
    } else if (contributionFrequency === 'yearly') {
      // Setoran ditambahkan setiap akhir tahun (bulan ke-12, 24, 36, dst)
      if (m % 12 === 0) {
        deposit = contributionAmount;
      }
    }

    // Hitung bunga yang didapat bulan ini
    const interestEarned = startingBalance * r_monthly;
    const taxDeducted = interestEarned * t_rate;
    const netInterest = interestEarned - taxDeducted;

    // Saldo akhir sebelum disesuaikan inflasi
    currentBalance = startingBalance + deposit + netInterest;
    
    // Akumulasi modal disetor, bunga kotor, dan pajak
    cumulativeDeposits += deposit;
    cumulativeInterest += interestEarned;
    cumulativeTax += taxDeducted;

    // Hitung saldo akhir riil (daya beli disesuaikan inflasi sejak awal simulasi)
    const discountFactor = Math.pow(1 + i_monthly, m);
    const realEndingBalance = currentBalance / discountFactor;

    monthlyDetails.push({
      period: m,
      year,
      month: monthOfYear,
      startingBalance,
      deposit,
      interestEarned,
      taxDeducted,
      endingBalance: currentBalance,
      realEndingBalance,
      cumulativeDeposits,
      cumulativeInterest,
      cumulativeTax
    });
  }

  // 4. Hitung ringkasan tahunan
  const yearlySummaries: CompoundingYearlySummary[] = [];
  for (let y = 1; y <= Math.ceil(totalMonths / 12); y++) {
    const startIdx = (y - 1) * 12;
    const endIdx = Math.min(y * 12 - 1, totalMonths - 1);
    
    const yearDetails = monthlyDetails.slice(startIdx, endIdx + 1);
    if (yearDetails.length === 0) continue;

    const firstMonth = yearDetails[0];
    const lastMonth = yearDetails[yearDetails.length - 1];

    const totalDeposits = yearDetails.reduce((sum, d) => sum + d.deposit, 0);
    const totalInterestEarned = yearDetails.reduce((sum, d) => sum + d.interestEarned, 0);
    const totalTaxDeducted = yearDetails.reduce((sum, d) => sum + d.taxDeducted, 0);

    yearlySummaries.push({
      year: y,
      startingBalance: firstMonth.startingBalance,
      totalDeposits,
      totalInterestEarned,
      totalTaxDeducted,
      endingBalance: lastMonth.endingBalance,
      realEndingBalance: lastMonth.realEndingBalance,
      cumulativeDeposits: lastMonth.cumulativeDeposits,
      cumulativeInterest: lastMonth.cumulativeInterest
    });
  }

  return {
    nominalEndingBalance: currentBalance,
    realEndingBalance: monthlyDetails[totalMonths - 1].realEndingBalance,
    totalDeposits: cumulativeDeposits,
    totalInterestEarned: cumulativeInterest,
    totalTaxDeducted: cumulativeTax,
    monthlyDetails,
    yearlySummaries
  };
}

export interface DailyCompoundingInput {
  title: string;
  initialAmount: number;
  contributionAmount: number;
  dailyReturnRate: number;
  durationDays: number;
  feeBeli: number;
  feeJual: number;
}

export interface DailyCompoundingDetail {
  period: number; // Hari ke-n
  startingBalance: number;
  deposit: number;
  interestEarned: number; // Profit hari ini
  taxDeducted: number;
  endingBalance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
  cumulativeTax: number;
}

export interface DailyCompoundingResult {
  nominalEndingBalance: number;
  totalDeposits: number;
  totalInterestEarned: number;
  totalTaxDeducted: number;
  details: DailyCompoundingDetail[];
}

export function calculateDailyCompounding(input: DailyCompoundingInput): DailyCompoundingResult {
  const {
    initialAmount,
    contributionAmount,
    dailyReturnRate,
    durationDays,
    feeBeli,
    feeJual
  } = input;

  const r_daily = dailyReturnRate / 100;
  const f_beli = feeBeli / 100;
  const f_jual = feeJual / 100;

  const details: DailyCompoundingDetail[] = [];
  let currentBalance = initialAmount;
  let cumulativeDeposits = initialAmount;
  let cumulativeInterest = 0;
  let cumulativeTax = 0;

  const totalDays = Math.max(1, durationDays);

  for (let d = 1; d <= totalDays; d++) {
    const startingBalance = currentBalance;
    const deposit = contributionAmount;

    // Gross daily target profit
    const interestEarned = startingBalance * r_daily;
    
    // Broker Buy and Sell fees
    const buyFee = startingBalance * f_beli;
    const sellFee = (startingBalance + interestEarned) * f_jual;
    const taxDeducted = buyFee + sellFee;
    
    const netInterest = interestEarned - taxDeducted;

    currentBalance = startingBalance + deposit + netInterest;

    cumulativeDeposits += deposit;
    cumulativeInterest += interestEarned;
    cumulativeTax += taxDeducted;

    details.push({
      period: d,
      startingBalance,
      deposit,
      interestEarned,
      taxDeducted,
      endingBalance: currentBalance,
      cumulativeDeposits,
      cumulativeInterest,
      cumulativeTax
    });
  }

  return {
    nominalEndingBalance: currentBalance,
    totalDeposits: cumulativeDeposits,
    totalInterestEarned: cumulativeInterest,
    totalTaxDeducted: cumulativeTax,
    details
  };
}

