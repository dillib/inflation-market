import { ethers } from 'ethers';
import { useCallback, useMemo } from 'react';
import { getAddresses } from '../contracts/addresses';
import { ERC20_ABI, CPI_EPOCH_POOL_ABI } from '../contracts/abis';
import { useProvider } from './useProvider';

export function useContracts() {
  const { getReadProvider, getSigner } = useProvider();
  const addr = useMemo(() => getAddresses(), []);

  const getRead = useCallback(async () => {
    const provider = getReadProvider();
    return {
      erc20: (address) => new ethers.Contract(address, ERC20_ABI, provider),
      cpiEpochPool: addr.cpiEpochPool ? new ethers.Contract(addr.cpiEpochPool, CPI_EPOCH_POOL_ABI, provider) : null,
      addresses: addr,
    };
  }, [getReadProvider, addr]);

  const getWrite = useCallback(async () => {
    const signer = await getSigner();
    return {
      erc20: (address) => new ethers.Contract(address, ERC20_ABI, signer),
      cpiEpochPool: addr.cpiEpochPool ? new ethers.Contract(addr.cpiEpochPool, CPI_EPOCH_POOL_ABI, signer) : null,
      addresses: addr,
    };
  }, [getSigner, addr]);

  return { getRead, getWrite, addresses: addr };
}
