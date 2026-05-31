export interface PurchaseTranche {
  id: string;
  lot: number;
  price: number;
}

export interface AvgDownInput {
  ticker: string;
  companyName?: string;
  lotAwal: number;
  avgPriceAwal: number;
  currentPrice: number;
  lotBaru: number;
  hargaBeliBaru: number;
  feeBeli: number; // Persentase fee beli, e.g. 0.15 (%)
  feeJual: number; // Persentase fee jual, e.g. 0.25 (%)
  includeFees: boolean;
  avgPriceAwalIncludesFee?: boolean;
  tranches?: PurchaseTranche[];
}

export interface AvgDownResult {
  // Sebelum Avg Down
  avgPriceAwal: number;
  sharesAwal: number;
  investedAmountAwal: number; // Modal Awal
  marketValueAwal: number;
  floatingPLAwal: number;
  floatingPLAwalPct: number;
  
  // Pembelian Baru
  sharesBaru: number;
  capitalRequired: number; // Modal Baru yang dibutuhkan
  
  // Sesudah Avg Down
  sharesTotal: number;
  lotTotal: number;
  avgPriceBaru: number;
  investedAmountTotal: number; // Modal Total
  marketValueTotal: number;
  floatingPLTotal: number;
  floatingPLTotalPct: number;
  
  // Metriks Perbaikan (Sebelum vs Sesudah)
  avgPriceReductionPct: number; // Seberapa jauh harga rata-rata turun
  plImprovementPct: number; // Selisih persentase P&L
  lossShrunkPct: number | null; // Seberapa banyak floating loss berkurang (%), null jika tidak loss di awal
  turnedIntoProfit: boolean; // Apakah berubah dari loss menjadi profit/break-even
}

/**
 * Menghitung simulasi Average Down berdasarkan input user.
 */
export function calculateAvgDown(input: AvgDownInput): AvgDownResult {
  const {
    lotAwal,
    avgPriceAwal,
    currentPrice,
    lotBaru,
    hargaBeliBaru,
    feeBeli,
    feeJual,
    includeFees,
    avgPriceAwalIncludesFee = true,
    tranches = []
  } = input;

  const sharesAwal = lotAwal * 100;
  const feeBeliPct = feeBeli / 100;
  const feeJualPct = feeJual / 100;

  // 1. Sebelum Average Down
  const realAvgPriceAwal = (includeFees && !avgPriceAwalIncludesFee) 
    ? avgPriceAwal * (1 + feeBeliPct) 
    : avgPriceAwal;

  const investedAmountAwal = sharesAwal * realAvgPriceAwal;
  const marketValueAwal = sharesAwal * currentPrice;
  
  let floatingPLAwal = 0;
  if (includeFees) {
    // Estimasi nilai jual bersih setelah dipotong fee jual bursa
    const netSellValueAwal = marketValueAwal * (1 - feeJualPct);
    floatingPLAwal = netSellValueAwal - investedAmountAwal;
  } else {
    floatingPLAwal = marketValueAwal - investedAmountAwal;
  }
  const floatingPLAwalPct = investedAmountAwal > 0 
    ? (floatingPLAwal / investedAmountAwal) * 100 
    : 0;

  // 2. Pembelian Baru
  let sharesBaru = 0;
  let capitalRequired = 0;

  if (tranches && tranches.length > 0) {
    tranches.forEach(tranche => {
      const trancheShares = tranche.lot * 100;
      sharesBaru += trancheShares;
      let trancheCost = trancheShares * tranche.price;
      if (includeFees) {
        trancheCost = trancheCost * (1 + feeBeliPct);
      }
      capitalRequired += trancheCost;
    });
  } else {
    sharesBaru = lotBaru * 100;
    capitalRequired = sharesBaru * hargaBeliBaru;
    if (includeFees) {
      capitalRequired = capitalRequired * (1 + feeBeliPct);
    }
  }

  // 3. Setelah Average Down
  const sharesTotal = sharesAwal + sharesBaru;
  const lotTotal = sharesTotal / 100;
  const investedAmountTotal = investedAmountAwal + capitalRequired;
  const avgPriceBaru = sharesTotal > 0 ? investedAmountTotal / sharesTotal : 0;
  const marketValueTotal = sharesTotal * currentPrice;

  let floatingPLTotal = 0;
  if (includeFees) {
    // Estimasi nilai jual bersih setelah dipotong fee jual bursa
    const netSellValueTotal = marketValueTotal * (1 - feeJualPct);
    floatingPLTotal = netSellValueTotal - investedAmountTotal;
  } else {
    floatingPLTotal = marketValueTotal - investedAmountTotal;
  }
  const floatingPLTotalPct = investedAmountTotal > 0
    ? (floatingPLTotal / investedAmountTotal) * 100
    : 0;

  // 4. Metriks Perbaikan
  const avgPriceReductionPct = avgPriceAwal > 0
    ? ((avgPriceAwal - avgPriceBaru) / avgPriceAwal) * 100
    : 0;

  const plImprovementPct = floatingPLTotalPct - floatingPLAwalPct;

  let lossShrunkPct: number | null = null;
  let turnedIntoProfit = false;

  if (floatingPLAwalPct < 0) {
    if (floatingPLTotalPct >= 0) {
      lossShrunkPct = 100; // Kerugian berkurang 100% (sudah break-even atau profit)
      turnedIntoProfit = true;
    } else {
      // Kerugian awal minus (misal -20%), kerugian akhir minus (misal -5%)
      // Rumus: (AwalLoss - AkhirLoss) / AwalLoss
      // ((-20) - (-5)) / (-20) = -15 / -20 = 75%
      lossShrunkPct = ((floatingPLAwalPct - floatingPLTotalPct) / floatingPLAwalPct) * 100;
    }
  }

  return {
    avgPriceAwal: realAvgPriceAwal,
    sharesAwal,
    investedAmountAwal,
    marketValueAwal,
    floatingPLAwal,
    floatingPLAwalPct,
    sharesBaru,
    capitalRequired,
    sharesTotal,
    lotTotal,
    avgPriceBaru,
    investedAmountTotal,
    marketValueTotal,
    floatingPLTotal,
    floatingPLTotalPct,
    avgPriceReductionPct,
    plImprovementPct,
    lossShrunkPct,
    turnedIntoProfit
  };
}
