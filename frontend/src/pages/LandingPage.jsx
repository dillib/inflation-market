import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Shield,
  Wallet,
  TrendingUp,
  CheckCircle,
  Sigma,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui/primitives';
import { SiteHeader, SiteFooter } from '../components/layout/SiteChrome';
import { MARKETS } from '../config/constants';
import { HOME_FAQS } from '../components/faq/FAQSection';
import UserJourneyModal from '../components/landing/UserJourneyModal';
import InfoTooltip from '../components/ui/InfoTooltip';

const formatPercent = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : '—';
};

function TickerRow({ title, subtitle, items, showArrows = false, variant = 'default' }) {
  if (!items || items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
        <span>{title}</span>
        {subtitle && <span className="text-[11px] text-gray-500">{subtitle}</span>}
      </div>
      <div className={`border border-white/10 rounded-xl bg-white/5 ticker ${variant === 'official' ? 'ticker-official' : ''} ${variant === 'hedge' ? 'ticker-hedge' : ''}`}>
        <div className="ticker-track px-4 py-2">
          {doubled.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{item.label}</span>
              <span className="text-sm text-white font-semibold">{item.value}</span>
              {showArrows && typeof item.change === 'number' && (
                <span className={`flex items-center gap-1 text-xs font-bold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
              {!showArrows && typeof item.change === 'number' && (
                <span className={`text-xs font-bold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? '+' : ''}
                  {item.change.toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  const handleStartTrading = () => {
    setShowJourneyModal(true);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (HOME_FAQS || []).slice(0, 8).map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const actualTickerItems = [
    {
      label: 'US CPI YoY',
      value: formatPercent(process.env.REACT_APP_CPI_YOY),
      change: Number(process.env.REACT_APP_CPI_YOY),
    },
    {
      label: 'US CPI MoM',
      value: formatPercent(process.env.REACT_APP_CPI_MOM),
      change: Number(process.env.REACT_APP_CPI_MOM),
    },
    {
      label: 'Food CPI YoY',
      value: formatPercent(process.env.REACT_APP_CPI_FOOD_YOY),
      change: Number(process.env.REACT_APP_CPI_FOOD_YOY),
    },
    {
      label: 'Energy CPI YoY',
      value: formatPercent(process.env.REACT_APP_CPI_ENERGY_YOY),
      change: Number(process.env.REACT_APP_CPI_ENERGY_YOY),
    },
    {
      label: 'Medical CPI YoY',
      value: formatPercent(process.env.REACT_APP_CPI_MEDICAL_YOY),
      change: Number(process.env.REACT_APP_CPI_MEDICAL_YOY),
    },
    {
      label: 'Rent CPI YoY',
      value: formatPercent(process.env.REACT_APP_CPI_RENT_YOY),
      change: Number(process.env.REACT_APP_CPI_RENT_YOY),
    },
  ].filter((item) => item.value && item.value !== '—' && Number.isFinite(item.change));
  if (actualTickerItems.length === 0) {
    const fallbackActual = [
      { label: 'US CPI YoY', change: 3.40 },
      { label: 'US CPI MoM', change: 0.32 },
      { label: 'Food CPI YoY', change: 3.25 },
      { label: 'Energy CPI YoY', change: -4.10 },
      { label: 'Medical CPI YoY', change: 5.80 },
      { label: 'Rent CPI YoY', change: 6.10 },
    ];
    fallbackActual.forEach((item) => {
      item.value = `${item.change.toFixed(2)}%`;
    });
    actualTickerItems.push(...fallbackActual);
  }
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />
      <UserJourneyModal isOpen={showJourneyModal} onClose={() => setShowJourneyModal(false)} />

      <section className="px-4 pt-6">
        <div className="max-w-6xl mx-auto space-y-3">
          <TickerRow
            title="Official inflation benchmarks"
            subtitle="Source: U.S. Bureau of Labor Statistics"
            items={actualTickerItems}
            showArrows
            variant="official"
          />
        </div>
      </section>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 mb-6">
            <Zap className="w-4 h-4" />
            Non-custodial • Zero Liquidations • Monthly US CPI Epoch Pools
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Hedge or Predict Monthly US Inflation
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
            Stake USDC in parimutuel Monthly US CPI Epoch Pools settled on official BLS/FRED CPI-U releases. One-click inflation protection or Over/Under predictions—with zero leverage and zero liquidation risk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button onClick={handleStartTrading} className="text-lg px-10 py-6">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to="/app">
              <Button variant="ghost" className="text-lg px-10 py-6 w-full">
                Open CPI Pool
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="w-8 h-8 rounded-md bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-gray-300 text-sm font-medium inline-flex items-center">
                Non-custodial
                <InfoTooltip
                  title="Non-Custodial"
                  content="You maintain complete control of your funds at all times. CPIEpochPool smart contracts hold all USDC stakes and settle payouts on-chain."
                />
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="w-8 h-8 rounded-md bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
                <Sigma className="w-5 h-5" />
              </div>
              <span className="text-gray-300 text-sm font-medium inline-flex items-center">
                Official BLS / FRED CPI
                <InfoTooltip
                  title="Official Settlement Data"
                  content="Each monthly epoch settles against the official U.S. Bureau of Labor Statistics CPI-U YoY print mirrored via the Federal Reserve (FRED) API."
                />
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="w-8 h-8 rounded-md bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-gray-300 text-sm font-medium inline-flex items-center">
                Zero liquidations
                <InfoTooltip
                  title="Parimutuel Epoch Pools"
                  content="No leverage, no hourly funding rates, and no liquidation risk. One-sided or cancelled epochs automatically refund 100% with zero fee."
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Markets Ticker (auto-scroll, no scrollbar) */}
      <section className="px-4 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-1 text-xs text-gray-400 px-1">
            <span>Macro reference indicators</span>
            <span className="text-[11px] text-gray-500">Flagship market: US CPI-U YoY Monthly Epoch Pool</span>
          </div>
          <div className="border border-white/10 rounded-xl bg-white/5 ticker">
            <div className="ticker-track px-4 py-3">
              {[...MARKETS, ...MARKETS].map((m, i) => (
                <div key={m.id + '-' + i} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{m.name}</span>
                  <span className="text-sm text-white font-semibold">${m.price.toFixed(2)}</span>
                  <span className={`text-xs font-bold ${m.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{m.change24h >= 0 ? '+' : ''}{m.change24h.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Actually Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Actually Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A parimutuel monthly CPI pool designed around real-world CPI Release Day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">1</div>
                <h3 className="text-xl font-bold text-white inline-flex items-center">
                  Monthly CPI Target
                  <InfoTooltip
                    title="Monthly Epoch Setup"
                    content="Each month has one clear US CPI-U YoY threshold (e.g. 2.80%) and a lock deadline before the official BLS release."
                  />
                </h3>
              </div>
              <p className="text-gray-300 mb-3">Each epoch sets a clear US CPI-U YoY target and locks before the monthly BLS/FRED CPI release.</p>
              <div className="text-sm text-blue-400 font-mono bg-blue-500/10 rounded px-3 py-2">
                OVER: CPI &gt; Target | UNDER: CPI ≤ Target
              </div>
            </Card>

            <Card className="border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xl">2</div>
                <h3 className="text-xl font-bold text-white inline-flex items-center">
                  Hedge or Predict
                  <InfoTooltip
                    title="Two Simple Modes"
                    content="Hedge Mode stakes USDC on OVER to protect against inflation spikes. Predict Mode lets you choose OVER or UNDER with live pool odds."
                  />
                </h3>
              </div>
              <p className="text-gray-300 mb-3">Use Hedge Mode for one-click inflation protection, or Predict Mode to back OVER or UNDER with USDC.</p>
              <div className="text-sm text-green-400 font-mono bg-green-500/10 rounded px-3 py-2">
                Max Loss = Stake (Zero Liquidations)
              </div>
            </Card>

            <Card className="border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">3</div>
                <h3 className="text-xl font-bold text-white inline-flex items-center">
                  Proportional Settlement
                  <InfoTooltip
                    title="Parimutuel Payouts"
                    content="Winners receive their principal plus a proportional share of the losing pool (minus a 1.5% fee). One-sided pools refund 100% with 0% fee."
                  />
                </h3>
              </div>
              <p className="text-gray-300 mb-3">Once the CPI print is released, winners claim their principal plus a pro-rata share of the losing pool.</p>
              <div className="text-sm text-purple-400 font-mono bg-purple-500/10 rounded px-3 py-2">
                Payout = Stake + Share(LosingPool)
              </div>
            </Card>
          </div>

          {/* Example Flow Diagram - Horizontal Two Scenarios */}
          <Card className="bg-gradient-to-br from-white/5 to-white/0 border-white/20 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">The Complete Flow: Two-Sided Market</h3>
            <p className="text-center text-gray-400 mb-8 text-sm">Both longs and shorts can win - it depends on which direction inflation moves</p>

            {/* Scenario 1: Rising Inflation - Longs Win */}
            <div className="mb-10">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-blue-300">Scenario 1: Inflation Rises (3% CPI)</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Long Side Wins - Horizontal Flow */}
                <div className="border-2 border-green-500/30 rounded-xl p-6 bg-green-500/5">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-2">
                      <Shield className="w-4 h-4" />
                      Long Position ✓
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Deposit</div>
                      <div className="text-[10px] text-gray-400">$10k</div>
                    </div>
                    <div className="text-green-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-xs font-semibold text-white">CPI +3%</div>
                      <div className="text-[10px] text-green-400">+$300</div>
                    </div>
                    <div className="text-green-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-xs font-semibold text-green-400">Winner!</div>
                      <div className="text-[10px] text-green-400">Protected</div>
                    </div>
                  </div>
                </div>

                {/* Short Side Loses - Horizontal Flow */}
                <div className="border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-sm font-semibold mb-2">
                      <TrendingUp className="w-4 h-4 transform rotate-180" />
                      Short Position ✗
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Deposit</div>
                      <div className="text-[10px] text-gray-400">$10k</div>
                    </div>
                    <div className="text-red-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-red-400 transform rotate-180" />
                      </div>
                      <div className="text-xs font-semibold text-white">CPI +3%</div>
                      <div className="text-[10px] text-red-400">-$300</div>
                    </div>
                    <div className="text-red-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">📉</span>
                      </div>
                      <div className="text-xs font-semibold text-red-400">Loser</div>
                      <div className="text-[10px] text-red-400">Wrong side</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 2: Falling Inflation - Shorts Win */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400 transform rotate-180" />
                  <span className="font-bold text-purple-300">Scenario 2: Inflation Falls (-2% CPI / Deflation)</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Long Side Loses - Horizontal Flow */}
                <div className="border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-sm font-semibold mb-2">
                      <Shield className="w-4 h-4" />
                      Long Position ✗
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Deposit</div>
                      <div className="text-[10px] text-gray-400">$10k</div>
                    </div>
                    <div className="text-red-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-red-400 transform rotate-180" />
                      </div>
                      <div className="text-xs font-semibold text-white">CPI -2%</div>
                      <div className="text-[10px] text-red-400">-$200</div>
                    </div>
                    <div className="text-red-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">📉</span>
                      </div>
                      <div className="text-xs font-semibold text-red-400">Loser</div>
                      <div className="text-[10px] text-red-400">Wrong side</div>
                    </div>
                  </div>
                </div>

                {/* Short Side Wins - Horizontal Flow */}
                <div className="border-2 border-green-500/30 rounded-xl p-6 bg-green-500/5">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-2">
                      <TrendingUp className="w-4 h-4 transform rotate-180" />
                      Short Position ✓
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Deposit</div>
                      <div className="text-[10px] text-gray-400">$10k</div>
                    </div>
                    <div className="text-green-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-green-400 transform rotate-180" />
                      </div>
                      <div className="text-xs font-semibold text-white">CPI -2%</div>
                      <div className="text-[10px] text-green-400">+$200</div>
                    </div>
                    <div className="text-green-400 text-2xl">→</div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-xs font-semibold text-green-400">Winner!</div>
                      <div className="text-[10px] text-green-400">Right side</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Flow Between Sides */}
            <div className="relative mb-6">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-green-500 via-purple-500 to-red-500" />
              <div className="relative flex items-center justify-center">
                <div className="bg-purple-500/20 border-2 border-purple-500/40 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                    <RefreshCw className="w-4 h-4" />
                    <span>Funding flows between Long ⇄ Short to maintain price</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-200">
                <strong>Why Both Sides?</strong> Longs need shorts as counterparties. Neither side is "always right" - both can win or lose depending on inflation direction. The funding mechanism keeps the market price anchored to real CPI data by creating continuous payments between the two sides based on supply/demand imbalance.
              </p>
            </div>
          </Card>

          {/* Key Differences */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="border-red-500/30">
              <h4 className="text-lg font-bold text-red-400 mb-3">❌ Traditional Savings</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>0.5% interest while inflation runs at 3%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Lose 2.5% purchasing power annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>No protection mechanism</span>
                </li>
              </ul>
            </Card>

            <Card className="border-green-500/30">
              <h4 className="text-lg font-bold text-green-400 mb-3">✅ Inflation Market</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Position gains track CPI increases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Purchasing power preserved or increased</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Anchored to real US Treasury + CPI data</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Inflation Market */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-yellow-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Inflation Market?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The only protocol that anchors your savings to real economic data instead of speculative crypto prices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Hedge Inflation Risk',
                description: 'Long positions protect savings from rising prices. Your position value tracks CPI increases, preserving purchasing power.'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Speculate on Deflation',
                description: 'Short positions profit when inflation falls. Express bearish macro views or hedge against deflationary environments.'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Earn Funding Yields',
                description: 'Funding flows continuously between longs and shorts. When you\'re on the right side of the market imbalance, you earn passive yield.'
              }
            ].map((feature, i) => (
              <Card key={i} className="text-center hover:border-yellow-500/40 transition-all">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto mb-4">
                  {feature.icon}
                </div>
                <div className="text-xl font-bold text-white mb-2">{feature.title}</div>
                <div className="text-sm text-gray-400">{feature.description}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-lg text-gray-400">Three steps to get started with the test prototype.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><Wallet className="w-4 h-4"/><span className="text-white font-semibold">Connect</span></div>
              <p className="text-sm text-gray-300">Connect your wallet and switch to the supported network.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><TrendingUp className="w-4 h-4"/><span className="text-white font-semibold">Choose Hedge or Predict</span></div>
              <p className="text-sm text-gray-300">Pick one-click Hedge Mode (CPI Over) or Predict Mode (Over / Under target CPI).</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><CheckCircle className="w-4 h-4"/><span className="text-white font-semibold">Stake &amp; Claim</span></div>
              <p className="text-sm text-gray-300">Deposit USDC before lock. Winners share the opposing pool when CPI is released.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-2 border-yellow-500/40 text-center p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready for the Next CPI Release?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Open the Monthly US CPI Epoch Pool to hedge rising living costs or predict the next BLS CPI-U print with zero liquidation risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleStartTrading} className="text-lg px-8 py-6">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/app">
                <Button variant="ghost" className="text-lg px-8 py-6 w-full">
                  Open CPI Pool
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}

