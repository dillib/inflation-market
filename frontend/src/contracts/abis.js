// Minimal ABIs needed for basic integration

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
];

export const VAULT_ABI = [
  'function deposit(address token, uint256 amount) external returns (uint256 shares)',
  'function availableBalance(address user, address token) external view returns (uint256)',
];

export const POSITION_MANAGER_ABI = [
  'function openPosition(bool isLong, uint256 collateralAmount, uint256 leverage, uint256 minPrice, uint256 maxPrice) external returns (bytes32)',
  'function closePosition(bytes32 positionId) external returns (int256 pnl)',
  'function addMargin(bytes32 positionId, uint256 amount) external',
  'function removeMargin(bytes32 positionId, uint256 amount) external',
  // Read methods expected by usePositions
  'function getUserPositions(address user) view returns (bytes32[])',
  'function getPosition(bytes32 id) view returns (address trader, uint256 timestamp, int256 size, uint256 collateral, uint256 leverage, uint256 entryPrice, int256 entryFundingIndex, uint256 liquidationPrice, bool isLong)',
  'function isPositionLiquidatable(bytes32 id) view returns (bool)',
  // Events used for subscriptions
  'event PositionOpened(bytes32 indexed positionId, address indexed trader)',
  'event PositionClosed(bytes32 indexed positionId, address indexed trader)',
  'event MarginAdded(bytes32 indexed positionId, address indexed trader, uint256 amount)',
  'event MarginRemoved(bytes32 indexed positionId, address indexed trader, uint256 amount)'
];

export const VAMM_ABI = [
  'function getMarkPrice() external view returns (uint256)',
  'function getPriceForTrade(int256 size) external view returns (uint256 newMarkPrice, uint256 priceImpact)'
];

export const INDEX_ORACLE_ABI = [
  'function getIndexPrice() external view returns (uint256)'
];

export const FUNDING_CALCULATOR_ABI = [
  'function currentFundingRate() external view returns (int256)'
];

export const CPI_EPOCH_POOL_ABI = [
  'function epochCount() external view returns (uint256)',
  'function minDeposit() external view returns (uint256)',
  'function getEpoch(uint256 epochId) external view returns (tuple(string title, uint256 targetCpiBps, uint256 lockTime, uint256 resolveTime, uint256 feeBps, uint256 totalOver, uint256 totalUnder, uint256 actualCpiBps, uint256 feeAmount, bool resolved, bool cancelled, bool overWins, bool isRefund))',
  'function getUserPosition(uint256 epochId, address user) external view returns (uint256 overStake, uint256 underStake, bool claimed, uint256 claimablePayout)',
  'function previewPayout(uint256 epochId, bool isOver, uint256 amount) external view returns (uint256 estimatedPayout)',
  'function deposit(uint256 epochId, bool isOver, uint256 amount) external',
  'function claim(uint256 epochId) external',
  'event Deposited(uint256 indexed epochId, address indexed user, bool indexed isOver, uint256 amount)',
  'event EpochResolved(uint256 indexed epochId, uint256 actualCpiBps, bool overWins, bool isRefund, uint256 feeAmount)',
  'event Claimed(uint256 indexed epochId, address indexed user, uint256 payout)'
];
