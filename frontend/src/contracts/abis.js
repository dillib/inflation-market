export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
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
