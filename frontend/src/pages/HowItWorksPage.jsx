import React from 'react';
import { Card } from '../components/ui/primitives';
import { SiteHeader, SiteFooter } from '../components/layout/SiteChrome';
import { Wallet, DollarSign, TrendingUp, CheckCircle, Shield, Sigma } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">How Inflation Market Works</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A complete guide to protecting your savings and trading macroeconomic risk
          </p>
        </div>

        {/* Value snapshot */}
        <section>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/40">
            <h2 className="text-3xl font-bold text-white mb-6">What Is Inflation Market?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-yellow-500/30 bg-black/30 p-5">
                <div className="flex items-center gap-3 mb-2 text-yellow-500"><Shield className="w-5 h-5"/><span className="font-bold text-white">Non-custodial</span></div>
                <p className="text-gray-300 text-sm">Monthly USDC epoch pools tied directly to official US CPI-U releases — zero leverage, zero liquidations.</p>
              </div>
              <div className="rounded-xl border border-yellow-500/30 bg-black/30 p-5">
                <div className="flex items-center gap-3 mb-2 text-yellow-500"><Sigma className="w-5 h-5"/><span className="font-bold text-white">Parimutuel Pool</span></div>
                <p className="text-gray-300 text-sm">All OVER and UNDER stakes sit in a single audited smart contract. Winners share the losing pool proportionally.</p>
              </div>
              <div className="rounded-xl border border-yellow-500/30 bg-black/30 p-5">
                <div className="flex items-center gap-3 mb-2 text-yellow-500"><TrendingUp className="w-5 h-5"/><span className="font-bold text-white">100% Refund Guard</span></div>
                <p className="text-gray-300 text-sm">If an epoch only has deposits on one side or is cancelled, participants claim a 100% refund with zero fee.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Five steps */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Five Steps</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><Wallet className="w-4 h-4"/><span className="text-white font-semibold">Connect</span></div>
              <p className="text-sm text-gray-300">Connect your wallet and select the supported network.</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><DollarSign className="w-4 h-4"/><span className="text-white font-semibold">Choose Mode</span></div>
              <p className="text-sm text-gray-300">Pick Hedge Mode (one-click OVER shield) or Predict Mode (OVER / UNDER target CPI).</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><TrendingUp className="w-4 h-4"/><span className="text-white font-semibold">Stake USDC</span></div>
              <p className="text-sm text-gray-300">Approve and deposit USDC into the current monthly epoch before the lock deadline.</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><CheckCircle className="w-4 h-4"/><span className="text-white font-semibold">CPI Release</span></div>
              <p className="text-sm text-gray-300">Official BLS/FRED CPI-U YoY print settles the epoch on-chain.</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-yellow-500"><Shield className="w-4 h-4"/><span className="text-white font-semibold">Claim</span></div>
              <p className="text-sm text-gray-300">Winners claim principal + proportional share of the opposing pool in USDC.</p>
            </div>
          </div>
        </section>

        {/* Settlement & Pool Math */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Settlement &amp; Pool Math</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <div className="text-xl font-bold text-white mb-2">Official CPI-U Release</div>
              <div className="text-gray-300">Each monthly epoch sets a target YoY CPI threshold (e.g., 2.80%). If the official BLS/FRED release is strictly above target, OVER wins; otherwise UNDER wins.</div>
            </Card>
            <Card>
              <div className="text-xl font-bold text-white mb-2">Parimutuel Payouts</div>
              <div className="text-gray-300">There is no house counterparty or LP drain. Every dollar of winning payout comes directly from the opposing side’s USDC pool, minus a 1.5% protocol fee on profits.</div>
            </Card>
          </div>
          <Card className="bg-white/5 border-white/10">
            <div className="text-sm font-bold text-white mb-3">Simple math</div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-md bg-black/40 border border-white/10 p-3 font-mono text-yellow-200 overflow-x-auto">
                Payout = Stake + (Stake / WinningPool) × DistributableLosingPool
                <div className="mt-2 text-xs text-gray-300">Winners receive their full principal back plus their pro-rata share of the losing pool (after the 1.5% fee).</div>
              </div>
              <div className="rounded-md bg-black/40 border border-white/10 p-3 font-mono text-yellow-200 overflow-x-auto">
                One-Sided / Cancelled Epoch → Refund = 100% of Stake (0% fee)
                <div className="mt-2 text-xs text-gray-300">If nobody takes the opposing side before lock, everyone gets 100% of their USDC back.</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Glossary (last) */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Glossary</h2>
          <Card>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <div className="text-sm font-semibold text-white">CPI-U (YoY)</div>
                <p>Consumer Price Index for All Urban Consumers, published monthly by the U.S. Bureau of Labor Statistics and mirrored via FRED.</p>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Epoch</div>
                <p>A monthly prediction and hedge window that locks before the official CPI release and settles once the print is published.</p>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">OVER / Hedge Side</div>
                <p>Wins when the official CPI print is strictly greater than the epoch’s target threshold.</p>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">UNDER Side</div>
                <p>Wins when the official CPI print is at or below the epoch’s target threshold.</p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
