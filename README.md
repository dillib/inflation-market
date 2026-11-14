# Inflation Market

Focused, non-custodial **Monthly US CPI Epoch Pools** settled on official BLS/FRED CPI-U releases.

## Structure

- [contracts/](contracts/) — `CPIEpochPool.sol` (parimutuel USDC Over/Under CPI pools, automatic refunds for one-sided/cancelled epochs), Hardhat tests, and deployment script.
- [frontend/](frontend/) — React + Tailwind app featuring the Monthly CPI Epoch Pool (`CPIPoolPage`), wallet connection, and [api/inflation.py](frontend/api/inflation.py) for live FRED CPI data.

## Quick Start

### Contracts
```bash
cd contracts
npm install
npx hardhat test
npx hardhat run scripts/deploy/deploy-cpi-pool.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```
