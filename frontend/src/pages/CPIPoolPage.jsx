import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Wallet,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button, Card, PyramidLogo } from '../components/ui/primitives';
import { useAppState } from '../app';
import { useToast } from '../components/toast/ToastProvider';
import useCPIEpochPool from '../hooks/useCPIEpochPool';
import useInflationData from '../hooks/useInflationData';

function formatCountdown(targetUnix) {
  const diff = Math.max(0, targetUnix - Math.floor(Date.now() / 1000));
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

export default function CPIPoolPage() {
  const { account, connect, disconnect, isLoading } = useAppState();
  const { addToast } = useToast();
  const {
    isOnChain,
    currentEpoch,
    userPosition,
    loading,
    error,
    refresh,
    estimatePayout,
    deposit,
    claim,
  } = useCPIEpochPool();
  const inflationFeed = useInflationData();

  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'protect' ? 'hedge' : searchParams.get('mode') === 'predict' ? 'predict' : 'hedge';
  const [mode, setMode] = useState(initialMode); // 'hedge' | 'predict'
  const [isOver, setIsOver] = useState(true);
  const [amount, setAmount] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  const effectiveIsOver = mode === 'hedge' ? true : isOver;
  const amountNum = Number(amount) || 0;
  const totalPool = (currentEpoch?.totalOver || 0) + (currentEpoch?.totalUnder || 0);
  const overPct = totalPool > 0 ? (currentEpoch.totalOver / totalPool) * 100 : 50;
  const underPct = 100 - overPct;
  const estimatedPayout = useMemo(
    () => estimatePayout(currentEpoch, effectiveIsOver, amountNum),
    [estimatePayout, currentEpoch, effectiveIsOver, amountNum]
  );
  const multiplier = amountNum > 0 ? estimatedPayout / amountNum : 0;
  const targetPct = ((currentEpoch?.targetCpiBps || 280) / 100).toFixed(2);
  const fredLatest = inflationFeed?.markets?.[0];

  const handleDeposit = async () => {
    if (isOnChain && !account?.isConnected) {
      await connect();
      return;
    }
    setSubmitting(true);
    try {
      const res = await deposit(currentEpoch.id, effectiveIsOver, amountNum);
      addToast(
        res.mode === 'onchain'
          ? `Deposited $${amountNum} USDC into ${effectiveIsOver ? 'OVER' : 'UNDER'} pool`
          : `Preview: simulated $${amountNum} USDC deposit into ${effectiveIsOver ? 'OVER' : 'UNDER'} pool`,
        'success'
      );
    } catch (err) {
      addToast(err?.shortMessage || err?.message || 'Deposit failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setSubmitting(true);
    try {
      await claim(currentEpoch.id);
      addToast('Payout claimed successfully', 'success');
    } catch (err) {
      addToast(err?.shortMessage || err?.message || 'Claim failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 sticky top-0 z-40 bg-black/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <PyramidLogo className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-white">Inflation Market</span>
            </Link>
            <nav className="hidden md:flex items-center gap-2 text-sm">
              <Link to="/app" className="px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 font-medium">
                CPI Epoch Pool
              </Link>
              <Link to="/how-it-works" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                How It Works
              </Link>
              <Link to="/faq" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                FAQ
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnChain
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}
            >
              {isOnChain ? 'Live Contract' : 'Interactive Preview'}
            </span>
            {!account?.isConnected ? (
              <Button onClick={connect} loading={isLoading}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Button onClick={disconnect}>
                {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-yellow-400 font-semibold mb-1">
              Monthly Macro Epoch • Zero Liquidations • Parimutuel USDC Pool
            </div>
            <h1 className="text-3xl font-extrabold">{currentEpoch?.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400">Locks in:</span>
              <span className="font-bold">{formatCountdown(currentEpoch?.lockTime || 0)}</span>
            </div>
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
              title="Refresh pool state"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-gray-400 mb-1">Target Threshold</div>
            <div className="text-2xl font-bold text-yellow-400">{targetPct}% YoY</div>
            <div className="text-xs text-gray-500 mt-1">OVER wins if CPI &gt; {targetPct}%</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-400 mb-1">Total Pool Liquidity</div>
            <div className="text-2xl font-bold">${totalPool.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">100% backed by USDC</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-400 mb-1">Implied Split (Over / Under)</div>
            <div className="text-2xl font-bold">
              <span className="text-green-400">{overPct.toFixed(0)}%</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-red-400">{underPct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-red-500/40 overflow-hidden mt-2">
              <div className="h-full bg-green-400" style={{ width: `${overPct}%` }} />
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-400 mb-1">Latest Official CPI (FRED)</div>
            <div className="text-2xl font-bold">
              {fredLatest ? fredLatest.price.toFixed(2) : '337.51'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fredLatest ? `MoM change: ${fredLatest.change24h}%` : 'BLS CPI-U Index (Oct 2026)'}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setMode('hedge')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  mode === 'hedge' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Hedge Mode (Inflation Shield)
              </button>
              <button
                onClick={() => setMode('predict')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  mode === 'predict' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Predict Mode (Over / Under)
              </button>
            </div>

            {mode === 'hedge' ? (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-sm text-yellow-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-300 mb-1">
                    One-Click Cost-of-Living Hedge
                  </div>
                  Automatically stakes USDC on <strong>CPI &gt; {targetPct}%</strong>. If inflation surprises
                  to the upside on release day, you receive a proportional share of the Under pool with zero
                  liquidation risk.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsOver(true)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isOver
                      ? 'border-green-400 bg-green-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-green-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> OVER (&gt; {targetPct}%)
                    </span>
                    <span className="text-xs text-gray-300">{overPct.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Pool: ${currentEpoch?.totalOver?.toLocaleString()}
                  </div>
                </button>
                <button
                  onClick={() => setIsOver(false)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    !isOver
                      ? 'border-red-400 bg-red-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-400 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4" /> UNDER (≤ {targetPct}%)
                    </span>
                    <span className="text-xs text-gray-300">{underPct.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Pool: ${currentEpoch?.totalUnder?.toLocaleString()}
                  </div>
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">Deposit Amount (USDC)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-yellow-500"
                />
                {[25, 100, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Selected Side</span>
                <span className={`font-bold ${effectiveIsOver ? 'text-green-400' : 'text-red-400'}`}>
                  {effectiveIsOver ? `OVER > ${targetPct}%` : `UNDER ≤ ${targetPct}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Payout (at current odds)</span>
                <span className="font-bold text-yellow-400">
                  ${estimatedPayout.toFixed(2)} ({multiplier.toFixed(2)}x)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol Fee (winning profit pool only)</span>
                <span>{((currentEpoch?.feeBps || 150) / 100).toFixed(2)}%</span>
              </div>
            </div>

            <Button onClick={handleDeposit} loading={submitting} className="w-full py-3.5 text-base">
              {mode === 'hedge'
                ? `Activate $${amountNum} Inflation Hedge`
                : `Stake $${amountNum} on ${effectiveIsOver ? 'OVER' : 'UNDER'}`}
            </Button>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-bold">Your Epoch Position</h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-gray-400">OVER Stake</span>
                <span className="font-bold text-green-400">${userPosition.overStake.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-gray-400">UNDER Stake</span>
                <span className="font-bold text-red-400">${userPosition.underStake.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  {currentEpoch?.resolved || currentEpoch?.cancelled ? 'Settled' : 'Open until lock'}
                </span>
              </div>
            </div>

            {userPosition.claimablePayout > 0 && !userPosition.claimed && (
              <Button onClick={handleClaim} loading={submitting} className="w-full">
                Claim ${userPosition.claimablePayout.toFixed(2)} USDC
              </Button>
            )}

            <div className="pt-3 border-t border-white/10 text-xs text-gray-400 space-y-1.5">
              <div>• No leverage or liquidation risk.</div>
              <div>• One-sided or cancelled epochs refund 100% with zero fee.</div>
              <div>• Settlement source: Official BLS CPI-U release.</div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
