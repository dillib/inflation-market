// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CPIEpochPool
 * @notice Monthly parimutuel prediction & inflation-hedge pools settled on official US CPI prints.
 * @dev Users deposit collateral (e.g., USDC) into OVER (inflation > target) or UNDER (inflation <= target)
 *      before lockTime. Once the official CPI print is released, the epoch is resolved and winners share
 *      the losing pool proportionally, minus a small protocol fee. If an epoch is one-sided or cancelled,
 *      all participants can claim a 100% refund with zero fee.
 */
contract CPIEpochPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant MAX_FEE_BPS = 500; // 5% max protocol fee

    struct Epoch {
        string title;
        uint256 targetCpiBps; // e.g., 280 = 2.80% YoY
        uint256 lockTime;
        uint256 resolveTime;
        uint256 feeBps;
        uint256 totalOver;
        uint256 totalUnder;
        uint256 actualCpiBps;
        uint256 feeAmount;
        bool resolved;
        bool cancelled;
        bool overWins;
        bool isRefund;
    }

    struct UserPosition {
        uint256 overStake;
        uint256 underStake;
        bool claimed;
    }

    IERC20 public immutable collateralToken;
    uint256 public minDeposit;
    uint256 public totalFeesAccrued;

    Epoch[] private _epochs;
    mapping(uint256 => mapping(address => UserPosition)) private _positions;

    event EpochCreated(
        uint256 indexed epochId,
        string title,
        uint256 targetCpiBps,
        uint256 lockTime,
        uint256 resolveTime,
        uint256 feeBps
    );
    event Deposited(
        uint256 indexed epochId,
        address indexed user,
        bool indexed isOver,
        uint256 amount
    );
    event EpochResolved(
        uint256 indexed epochId,
        uint256 actualCpiBps,
        bool overWins,
        bool isRefund,
        uint256 feeAmount
    );
    event EpochCancelled(uint256 indexed epochId);
    event Claimed(uint256 indexed epochId, address indexed user, uint256 payout);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event MinDepositUpdated(uint256 newMinDeposit);

    error InvalidEpoch();
    error InvalidParameters();
    error EpochLocked();
    error EpochNotReady();
    error EpochAlreadySettled();
    error EpochNotSettled();
    error DepositTooSmall();
    error NothingToClaim();
    error AlreadyClaimed();
    error ZeroAddress();

    constructor(address collateralToken_, uint256 minDeposit_) Ownable(msg.sender) {
        if (collateralToken_ == address(0)) revert ZeroAddress();
        if (minDeposit_ == 0) revert InvalidParameters();
        collateralToken = IERC20(collateralToken_);
        minDeposit = minDeposit_;
    }

    function epochCount() external view returns (uint256) {
        return _epochs.length;
    }

    function getEpoch(uint256 epochId) external view returns (Epoch memory) {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        return _epochs[epochId];
    }

    function getUserPosition(uint256 epochId, address user)
        external
        view
        returns (
            uint256 overStake,
            uint256 underStake,
            bool claimed,
            uint256 claimablePayout
        )
    {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        UserPosition storage pos = _positions[epochId][user];
        overStake = pos.overStake;
        underStake = pos.underStake;
        claimed = pos.claimed;
        if (!claimed) {
            claimablePayout = _calculatePayout(_epochs[epochId], pos);
        }
    }

    function previewPayout(uint256 epochId, bool isOver, uint256 amount)
        external
        view
        returns (uint256 estimatedPayout)
    {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        if (amount == 0) return 0;
        Epoch storage ep = _epochs[epochId];

        uint256 winningPool = (isOver ? ep.totalOver : ep.totalUnder) + amount;
        uint256 losingPool = isOver ? ep.totalUnder : ep.totalOver;
        if (losingPool == 0) return amount;

        uint256 distributable = losingPool - ((losingPool * ep.feeBps) / BASIS_POINTS);
        return amount + ((amount * distributable) / winningPool);
    }

    function createEpoch(
        string calldata title,
        uint256 targetCpiBps,
        uint256 lockTime,
        uint256 resolveTime,
        uint256 feeBps
    ) external onlyOwner returns (uint256 epochId) {
        if (bytes(title).length == 0) revert InvalidParameters();
        if (lockTime <= block.timestamp || resolveTime < lockTime) revert InvalidParameters();
        if (feeBps > MAX_FEE_BPS) revert InvalidParameters();

        epochId = _epochs.length;
        _epochs.push(
            Epoch({
                title: title,
                targetCpiBps: targetCpiBps,
                lockTime: lockTime,
                resolveTime: resolveTime,
                feeBps: feeBps,
                totalOver: 0,
                totalUnder: 0,
                actualCpiBps: 0,
                feeAmount: 0,
                resolved: false,
                cancelled: false,
                overWins: false,
                isRefund: false
            })
        );

        emit EpochCreated(epochId, title, targetCpiBps, lockTime, resolveTime, feeBps);
    }

    function deposit(uint256 epochId, bool isOver, uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        Epoch storage ep = _epochs[epochId];
        if (ep.resolved || ep.cancelled) revert EpochAlreadySettled();
        if (block.timestamp >= ep.lockTime) revert EpochLocked();
        if (amount < minDeposit) revert DepositTooSmall();

        collateralToken.safeTransferFrom(msg.sender, address(this), amount);

        UserPosition storage pos = _positions[epochId][msg.sender];
        if (isOver) {
            pos.overStake += amount;
            ep.totalOver += amount;
        } else {
            pos.underStake += amount;
            ep.totalUnder += amount;
        }

        emit Deposited(epochId, msg.sender, isOver, amount);
    }

    function resolveEpoch(uint256 epochId, uint256 actualCpiBps)
        external
        onlyOwner
        nonReentrant
    {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        Epoch storage ep = _epochs[epochId];
        if (ep.resolved || ep.cancelled) revert EpochAlreadySettled();
        if (block.timestamp < ep.resolveTime) revert EpochNotReady();

        ep.resolved = true;
        ep.actualCpiBps = actualCpiBps;
        ep.overWins = actualCpiBps > ep.targetCpiBps;

        if (ep.totalOver == 0 || ep.totalUnder == 0) {
            ep.isRefund = true;
            ep.feeAmount = 0;
        } else {
            uint256 losingPool = ep.overWins ? ep.totalUnder : ep.totalOver;
            uint256 fee = (losingPool * ep.feeBps) / BASIS_POINTS;
            ep.feeAmount = fee;
            totalFeesAccrued += fee;
        }

        emit EpochResolved(epochId, actualCpiBps, ep.overWins, ep.isRefund, ep.feeAmount);
    }

    function cancelEpoch(uint256 epochId) external onlyOwner nonReentrant {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        Epoch storage ep = _epochs[epochId];
        if (ep.resolved || ep.cancelled) revert EpochAlreadySettled();

        ep.cancelled = true;
        ep.isRefund = true;

        emit EpochCancelled(epochId);
    }

    function claim(uint256 epochId) external nonReentrant {
        if (epochId >= _epochs.length) revert InvalidEpoch();
        Epoch storage ep = _epochs[epochId];
        if (!ep.resolved && !ep.cancelled) revert EpochNotSettled();

        UserPosition storage pos = _positions[epochId][msg.sender];
        if (pos.claimed) revert AlreadyClaimed();

        uint256 payout = _calculatePayout(ep, pos);
        if (payout == 0) revert NothingToClaim();

        pos.claimed = true;
        collateralToken.safeTransfer(msg.sender, payout);

        emit Claimed(epochId, msg.sender, payout);
    }

    function withdrawFees(address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        uint256 amount = totalFeesAccrued;
        if (amount == 0) revert NothingToClaim();

        totalFeesAccrued = 0;
        collateralToken.safeTransfer(to, amount);

        emit FeesWithdrawn(to, amount);
    }

    function setMinDeposit(uint256 newMinDeposit) external onlyOwner {
        if (newMinDeposit == 0) revert InvalidParameters();
        minDeposit = newMinDeposit;
        emit MinDepositUpdated(newMinDeposit);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _calculatePayout(Epoch storage ep, UserPosition storage pos)
        private
        view
        returns (uint256)
    {
        if (!ep.resolved && !ep.cancelled) return 0;

        if (ep.isRefund) {
            return pos.overStake + pos.underStake;
        }

        uint256 userWinningStake = ep.overWins ? pos.overStake : pos.underStake;
        if (userWinningStake == 0) return 0;

        uint256 winningPool = ep.overWins ? ep.totalOver : ep.totalUnder;
        uint256 losingPool = ep.overWins ? ep.totalUnder : ep.totalOver;
        uint256 distributableLosingPool = losingPool - ep.feeAmount;

        return userWinningStake + ((userWinningStake * distributableLosingPool) / winningPool);
    }
}
