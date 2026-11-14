import { useCallback, useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'ethers';
import { useContracts } from './useContracts';
import { useAppState } from '../app';

const DEMO_EPOCHS = [
  {
    id: 0,
    title: 'US CPI-U YoY — Dec 2026 Release',
    targetCpiBps: 280,
    lockTime: Math.floor(Date.now() / 1000) + 14 * 24 * 3600,
    resolveTime: Math.floor(Date.now() / 1000) + 16 * 24 * 3600,
    feeBps: 150,
    totalOver: 18450,
    totalUnder: 14200,
    actualCpiBps: 0,
    resolved: false,
    cancelled: false,
    overWins: false,
    isRefund: false,
  },
];

export default function useCPIEpochPool() {
  const { getRead, getWrite, addresses } = useContracts();
  const { account } = useAppState();
  const isOnChain = Boolean(addresses.cpiEpochPool);

  const [epochs, setEpochs] = useState(DEMO_EPOCHS);
  const [selectedEpochId, setSelectedEpochId] = useState(0);
  const [userPosition, setUserPosition] = useState({
    overStake: 0,
    underStake: 0,
    claimed: false,
    claimablePayout: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isOnChain) {
      setEpochs((prev) => prev);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const read = await getRead();
      const pool = read.cpiEpochPool;
      const count = Number(await pool.epochCount());
      const loaded = [];
      for (let i = 0; i < count; i += 1) {
        const ep = await pool.getEpoch(i);
        loaded.push({
          id: i,
          title: ep.title,
          targetCpiBps: Number(ep.targetCpiBps),
          lockTime: Number(ep.lockTime),
          resolveTime: Number(ep.resolveTime),
          feeBps: Number(ep.feeBps),
          totalOver: Number(formatUnits(ep.totalOver, 6)),
          totalUnder: Number(formatUnits(ep.totalUnder, 6)),
          actualCpiBps: Number(ep.actualCpiBps),
          resolved: ep.resolved,
          cancelled: ep.cancelled,
          overWins: ep.overWins,
          isRefund: ep.isRefund,
        });
      }
      if (loaded.length > 0) {
        setEpochs(loaded);
      }

      if (account?.address && count > selectedEpochId) {
        const pos = await pool.getUserPosition(selectedEpochId, account.address);
        setUserPosition({
          overStake: Number(formatUnits(pos.overStake, 6)),
          underStake: Number(formatUnits(pos.underStake, 6)),
          claimed: pos.claimed,
          claimablePayout: Number(formatUnits(pos.claimablePayout, 6)),
        });
      }
    } catch (err) {
      setError(err?.message || 'Failed to load CPI epoch pool');
    } finally {
      setLoading(false);
    }
  }, [isOnChain, getRead, account?.address, selectedEpochId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const estimatePayout = useCallback(
    (epoch, isOver, amountNum) => {
      if (!epoch || !amountNum || amountNum <= 0) return 0;
      const winningPool = (isOver ? epoch.totalOver : epoch.totalUnder) + amountNum;
      const losingPool = isOver ? epoch.totalUnder : epoch.totalOver;
      if (losingPool <= 0) return amountNum;
      const feeFactor = (10000 - epoch.feeBps) / 10000;
      return amountNum + (amountNum * (losingPool * feeFactor)) / winningPool;
    },
    []
  );

  const deposit = useCallback(
    async (epochId, isOver, amountUsdc) => {
      const amountNum = Number(amountUsdc);
      if (!Number.isFinite(amountNum) || amountNum < 1) {
        throw new Error('Minimum deposit is 1 USDC');
      }

      if (!isOnChain) {
        setEpochs((prev) =>
          prev.map((ep) =>
            ep.id === epochId
              ? {
                  ...ep,
                  totalOver: ep.totalOver + (isOver ? amountNum : 0),
                  totalUnder: ep.totalUnder + (!isOver ? amountNum : 0),
                }
              : ep
          )
        );
        setUserPosition((prev) => ({
          ...prev,
          overStake: prev.overStake + (isOver ? amountNum : 0),
          underStake: prev.underStake + (!isOver ? amountNum : 0),
        }));
        return { mode: 'demo' };
      }

      const read = await getRead();
      const write = await getWrite();
      const signerAddr = await write.cpiEpochPool.runner.getAddress();
      const decimals = await read.erc20(addresses.usdc).decimals();
      const rawAmount = parseUnits(String(amountNum), decimals);

      const allowance = await read.erc20(addresses.usdc).allowance(signerAddr, addresses.cpiEpochPool);
      if (allowance < rawAmount) {
        await (await write.erc20(addresses.usdc).approve(addresses.cpiEpochPool, rawAmount)).wait();
      }
      const receipt = await (await write.cpiEpochPool.deposit(epochId, isOver, rawAmount)).wait();
      await refresh();
      return { mode: 'onchain', receipt };
    },
    [isOnChain, getRead, getWrite, addresses, refresh]
  );

  const claim = useCallback(
    async (epochId) => {
      if (!isOnChain) {
        setUserPosition((prev) => ({ ...prev, claimed: true, claimablePayout: 0 }));
        return { mode: 'demo' };
      }
      const write = await getWrite();
      const receipt = await (await write.cpiEpochPool.claim(epochId)).wait();
      await refresh();
      return { mode: 'onchain', receipt };
    },
    [isOnChain, getWrite, refresh]
  );

  return {
    isOnChain,
    epochs,
    selectedEpochId,
    setSelectedEpochId,
    currentEpoch: epochs[selectedEpochId] || epochs[0],
    userPosition,
    loading,
    error,
    refresh,
    estimatePayout,
    deposit,
    claim,
  };
}
