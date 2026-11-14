export const NETWORKS = {
  ARBITRUM_SEPOLIA: 421614,
};

export const getAddresses = () => ({
  chainId: Number(process.env.REACT_APP_CHAIN_ID || NETWORKS.ARBITRUM_SEPOLIA),
  rpcUrl: process.env.REACT_APP_RPC_URL || '',
  usdc: process.env.REACT_APP_USDC || '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  cpiEpochPool: process.env.REACT_APP_CPI_POOL || '',
});
