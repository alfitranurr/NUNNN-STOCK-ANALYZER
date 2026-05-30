'use client';

import * as React from 'react';
import { Percent, Info, Settings2, Sparkles } from 'lucide-react';
import { AvgDownInput } from '@/lib/calculator';

interface CalculatorFormProps {
  onCalculate: (values: AvgDownInput) => void;
  onSavePlan?: (title: string) => void;
  isSaving?: boolean;
  user?: any;
  initialValues?: {
    ticker: string;
    company_name?: string;
    lot_awal: number;
    avg_price_awal: number;
    current_price: number;
    lot_baru: number;
    harga_beli_baru: number;
    fee_beli: number;
    fee_jual: number;
  } | null;
}

const POPULAR_TICKERS = [
  { symbol: 'ANTM', name: 'Aneka Tambang Tbk' },
  { symbol: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk' },
  { symbol: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk' },
  { symbol: 'BBRI', name: 'Bank Rakyat Indonesia Tbk' },
  { symbol: 'BBCA', name: 'Bank Central Asia Tbk' },
  { symbol: 'BMRI', name: 'Bank Mandiri Tbk' },
  { symbol: 'BBNI', name: 'Bank Negara Indonesia Tbk' },
  { symbol: 'TLKM', name: 'Telkom Indonesia Tbk' },
  { symbol: 'ASII', name: 'Astra International Tbk' },
  { symbol: 'ADRO', name: 'Adaro Energy Indonesia Tbk' },
];

const BROKER_PRESETS = [
  { id: 'stockbit', name: 'Stockbit', buy: 0.15, sell: 0.25 },
  { id: 'ajaib', name: 'Ajaib', buy: 0.15, sell: 0.25 },
  { id: 'ipot', name: 'IPOT (Indo Premier)', buy: 0.19, sell: 0.29 },
  { id: 'custom', name: 'Custom Fee', buy: 0.0, sell: 0.0 }
];

export function CalculatorForm({ onCalculate, onSavePlan, isSaving = false, user, initialValues }: CalculatorFormProps) {
  const [ticker, setTicker] = React.useState('ANTM');
  const [companyName, setCompanyName] = React.useState('Aneka Tambang Tbk');
  const [lotAwal, setLotAwal] = React.useState<number | ''>(10);
  const [avgPriceAwal, setAvgPriceAwal] = React.useState<number | ''>(1500);
  const [currentPrice, setCurrentPrice] = React.useState<number | ''>(1350);
  
  const [lotBaru, setLotBaru] = React.useState<number | ''>(15);
  const [hargaBeliBaru, setHargaBeliBaru] = React.useState<number | ''>(1250);
  
  const [brokerPreset, setBrokerPreset] = React.useState('stockbit');
  const [feeBeli, setFeeBeli] = React.useState(0.15);
  const [feeJual, setFeeJual] = React.useState(0.25);
  const [includeFees, setIncludeFees] = React.useState(true);

  // Sync state if initialValues changes
  React.useEffect(() => {
    if (initialValues) {
      setTicker(initialValues.ticker);
      setCompanyName(initialValues.company_name || '');
      setLotAwal(initialValues.lot_awal);
      setAvgPriceAwal(initialValues.avg_price_awal);
      setCurrentPrice(initialValues.current_price);
      setLotBaru(initialValues.lot_baru);
      setHargaBeliBaru(initialValues.harga_beli_baru);
      setFeeBeli(initialValues.fee_beli);
      setFeeJual(initialValues.fee_jual);
      setIncludeFees(initialValues.fee_beli > 0 || initialValues.fee_jual > 0);
      
      // Tentukan preset berdasarkan fee
      const matchedPreset = BROKER_PRESETS.find(p => p.buy === initialValues.fee_beli && p.sell === initialValues.fee_jual);
      if (matchedPreset) {
        setBrokerPreset(matchedPreset.id);
      } else {
        setBrokerPreset('custom');
      }
    }
  }, [initialValues]);

  const [showTickerSuggestions, setShowTickerSuggestions] = React.useState(false);
  const [showAdvancedFee, setShowAdvancedFee] = React.useState(false);

  // Trigger calculation on input changes
  React.useEffect(() => {
    // Standard default fallback values for math calculations if blank
    const calculationInput: AvgDownInput = {
      ticker: ticker || 'IDX',
      lotAwal: Number(lotAwal) || 0,
      avgPriceAwal: Number(avgPriceAwal) || 0,
      currentPrice: Number(currentPrice) || 0,
      lotBaru: Number(lotBaru) || 0,
      hargaBeliBaru: Number(hargaBeliBaru) || 0,
      feeBeli: includeFees ? Number(feeBeli) : 0,
      feeJual: includeFees ? Number(feeJual) : 0,
      includeFees
    };
    onCalculate(calculationInput);
  }, [
    ticker, lotAwal, avgPriceAwal, currentPrice, 
    lotBaru, hargaBeliBaru, feeBeli, feeJual, includeFees,
    onCalculate
  ]);

  const handleTickerSelect = (symbol: string, name: string) => {
    setTicker(symbol);
    setCompanyName(name);
    setShowTickerSuggestions(false);
  };

  const handlePresetChange = (presetId: string) => {
    setBrokerPreset(presetId);
    const selected = BROKER_PRESETS.find(p => p.id === presetId);
    if (selected && presetId !== 'custom') {
      setFeeBeli(selected.buy);
      setFeeJual(selected.sell);
    }
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePlan) {
      onSavePlan(`Rencana Avg Down ${ticker}`);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-purple" />
            Rencana Average Down
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simulasikan harga rata-rata baru portofolio Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSaveClick} className="space-y-6">
        {/* Ticker & Nama Emiten */}
        <div className="relative">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kode Saham (Ticker)</label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setTicker(val);
                const found = POPULAR_TICKERS.find(t => t.symbol === val);
                setCompanyName(found ? found.name : '');
              }}
              onFocus={() => setShowTickerSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTickerSuggestions(false), 200)}
              placeholder="E.g., ANTM"
              className="w-1/3 text-center font-bold tracking-wider glass-input px-3 py-2.5 text-base placeholder:text-slate-500/50 uppercase"
              required
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nama Perusahaan (Opsional)"
              className="w-2/3 glass-input px-4 py-2.5 text-sm placeholder:text-slate-500/30"
            />
          </div>

          {/* Autocomplete Tickers */}
          {showTickerSuggestions && (
            <div className="absolute top-[72px] left-0 w-full glass-card p-2 z-25 max-h-[200px] overflow-y-auto border border-brand-purple/20 bg-slate-900/90 dark:bg-black/90 shadow-xl">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-3.5 py-1">Saham Populer (BEI)</p>
              {POPULAR_TICKERS.filter(t => t.symbol.includes(ticker) || t.name.toLowerCase().includes(ticker.toLowerCase())).map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleTickerSelect(item.symbol, item.name)}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-brand-purple/20 text-sm transition-colors flex justify-between items-center cursor-pointer"
                >
                  <span className="font-bold text-white">{item.symbol}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[150px]">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posisi Awal (Current Portfolio Status) */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>1. Posisi Portofolio Awal</span>
            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-white/5" />
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Lot</label>
              <input
                type="number"
                min="1"
                value={lotAwal}
                onChange={(e) => setLotAwal(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
                className="mt-1 w-full glass-input px-3 py-2 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg Price (Rp)</label>
              <input
                type="number"
                min="1"
                value={avgPriceAwal}
                onChange={(e) => setAvgPriceAwal(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
                className="mt-1 w-full glass-input px-3 py-2 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Current Price (Rp)</label>
              <input
                type="number"
                min="1"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
                className="mt-1 w-full glass-input px-3 py-2 text-sm font-semibold"
                required
              />
            </div>
          </div>
        </div>

        {/* Rencana Pembelian Baru (Average Down Plan) */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>2. Rencana Pembelian Baru</span>
            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-white/5" />
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Lot Baru</label>
              <input
                type="number"
                min="1"
                value={lotBaru}
                onChange={(e) => setLotBaru(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
                className="mt-1 w-full glass-input px-3.5 py-2.5 text-sm font-semibold border-brand-purple/20 focus:border-brand-purple"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Harga Beli Baru (Rp)</label>
              <input
                type="number"
                min="1"
                value={hargaBeliBaru}
                onChange={(e) => setHargaBeliBaru(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                placeholder="0"
                className="mt-1 w-full glass-input px-3.5 py-2.5 text-sm font-semibold border-brand-purple/20 focus:border-brand-purple"
                required
              />
            </div>
          </div>
        </div>

        {/* Opsi Tambahan: Broker Fee & Biaya Transaksi */}
        <div className="rounded-xl border border-slate-200/50 dark:border-white/5 p-4 bg-slate-50 dark:bg-slate-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-brand-indigo" />
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Perhitungkan Broker Fee</span>
                <p className="text-[10px] text-slate-400">Menghitung PPN, Levy & PPh secara presisi.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeFees} 
                onChange={(e) => setIncludeFees(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-purple"></div>
            </label>
          </div>

          {includeFees && (
            <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-3.5 animate-fadeIn">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preset Sekuritas</label>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {BROKER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetChange(preset.id)}
                      className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all cursor-pointer ${
                        brokerPreset === preset.id
                          ? 'bg-brand-purple/20 border-brand-purple text-brand-purple dark:text-violet-300'
                          : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400">Fee Beli (%)</label>
                    {brokerPreset !== 'custom' && (
                      <span className="text-[9px] text-slate-500 font-semibold">{brokerPreset.toUpperCase()}</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={feeBeli}
                    onChange={(e) => {
                      setFeeBeli(Math.max(0, parseFloat(e.target.value) || 0));
                      setBrokerPreset('custom');
                    }}
                    disabled={brokerPreset !== 'custom'}
                    className="mt-1 w-full glass-input px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400">Fee Jual (%)</label>
                    {brokerPreset !== 'custom' && (
                      <span className="text-[9px] text-slate-500 font-semibold">{brokerPreset.toUpperCase()}</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={feeJual}
                    onChange={(e) => {
                      setFeeJual(Math.max(0, parseFloat(e.target.value) || 0));
                      setBrokerPreset('custom');
                    }}
                    disabled={brokerPreset !== 'custom'}
                    className="mt-1 w-full glass-input px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-start gap-1.5 mt-1 bg-white/5 dark:bg-black/20 p-2 rounded-lg border border-slate-200/10 dark:border-white/5">
                <Info className="h-3.5 w-3.5 text-brand-purple shrink-0 mt-0.5" />
                <span>
                  Fee Beli ditambahkan ke modal pembelian baru. Fee Jual dikurangkan dari nilai bersih penjualan saat memproyeksikan P&L real-time.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Simpan Rencana Button */}
        {onSavePlan && (
          <button
            type="submit"
            disabled={isSaving || !lotAwal || !avgPriceAwal || !lotBaru || !hargaBeliBaru}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            <span>{user ? 'Simpan Rencana ke Cloud' : 'Simpan Rencana (Lokal)'}</span>
          </button>
        )}
      </form>
    </div>
  );
}
