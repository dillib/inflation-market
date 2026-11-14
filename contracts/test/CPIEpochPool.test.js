const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CPIEpochPool", function () {
  const USDC_UNIT = 10n ** 6n;
  const MIN_DEPOSIT = 1n * USDC_UNIT; // 1 USDC
  const FEE_BPS = 150n; // 1.5%
  const TARGET_CPI_BPS = 280n; // 2.80%

  async function deployFixture() {
    const [owner, alice, bob, carol, treasury] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    const CPIEpochPool = await ethers.getContractFactory("CPIEpochPool");
    const pool = await CPIEpochPool.deploy(await usdc.getAddress(), MIN_DEPOSIT);
    await pool.waitForDeployment();

    // Mint 10,000 USDC to each trader and approve pool
    const mintAmount = 10_000n * USDC_UNIT;
    for (const user of [alice, bob, carol]) {
      await usdc.mint(user.address, mintAmount);
      await usdc.connect(user).approve(await pool.getAddress(), mintAmount);
    }

    const now = BigInt(await time.latest());
    const lockTime = now + 7n * 24n * 3600n;
    const resolveTime = lockTime + 3600n;

    return { pool, usdc, owner, alice, bob, carol, treasury, lockTime, resolveTime };
  }

  it("creates an epoch and accepts OVER / UNDER deposits", async function () {
    const { pool, alice, bob, lockTime, resolveTime } = await deployFixture();

    await expect(
      pool.createEpoch("US CPI-U YoY — Nov 2026", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS)
    ).to.emit(pool, "EpochCreated");

    expect(await pool.epochCount()).to.equal(1n);

    await expect(pool.connect(alice).deposit(0, true, 100n * USDC_UNIT))
      .to.emit(pool, "Deposited")
      .withArgs(0, alice.address, true, 100n * USDC_UNIT);

    await expect(pool.connect(bob).deposit(0, false, 200n * USDC_UNIT))
      .to.emit(pool, "Deposited")
      .withArgs(0, bob.address, false, 200n * USDC_UNIT);

    const ep = await pool.getEpoch(0);
    expect(ep.totalOver).to.equal(100n * USDC_UNIT);
    expect(ep.totalUnder).to.equal(200n * USDC_UNIT);
  });

  it("rejects deposits below minDeposit or after lockTime", async function () {
    const { pool, alice, lockTime, resolveTime } = await deployFixture();
    await pool.createEpoch("US CPI-U YoY — Nov 2026", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS);

    await expect(pool.connect(alice).deposit(0, true, 500_000n)).to.be.revertedWithCustomError(
      pool,
      "DepositTooSmall"
    );

    await time.increaseTo(lockTime);
    await expect(pool.connect(alice).deposit(0, true, 10n * USDC_UNIT)).to.be.revertedWithCustomError(
      pool,
      "EpochLocked"
    );
  });

  it("resolves OVER win proportionally, deducts fee, and blocks double claim", async function () {
    const { pool, usdc, alice, bob, carol, treasury, lockTime, resolveTime } = await deployFixture();
    await pool.createEpoch("US CPI-U YoY — Nov 2026", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS);

    // Alice: 100 OVER, Carol: 300 OVER (totalOver = 400)
    // Bob: 200 UNDER (totalUnder = 200)
    await pool.connect(alice).deposit(0, true, 100n * USDC_UNIT);
    await pool.connect(carol).deposit(0, true, 300n * USDC_UNIT);
    await pool.connect(bob).deposit(0, false, 200n * USDC_UNIT);

    await time.increaseTo(resolveTime);
    // Actual CPI 3.10% > 2.80% -> OVER wins
    await expect(pool.resolveEpoch(0, 310n))
      .to.emit(pool, "EpochResolved")
      .withArgs(0, 310n, true, false, 3n * USDC_UNIT); // 1.5% of 200 = 3 USDC

    // Distributable losing pool = 200 - 3 = 197 USDC
    // Alice gets 100 + (100/400)*197 = 149.25 USDC
    // Carol gets 300 + (300/400)*197 = 447.75 USDC
    const aliceBalBefore = await usdc.balanceOf(alice.address);
    await pool.connect(alice).claim(0);
    expect((await usdc.balanceOf(alice.address)) - aliceBalBefore).to.equal(149_250_000n);

    const carolBalBefore = await usdc.balanceOf(carol.address);
    await pool.connect(carol).claim(0);
    expect((await usdc.balanceOf(carol.address)) - carolBalBefore).to.equal(447_750_000n);

    // Bob lost -> NothingToClaim
    await expect(pool.connect(bob).claim(0)).to.be.revertedWithCustomError(pool, "NothingToClaim");

    // Alice cannot claim twice
    await expect(pool.connect(alice).claim(0)).to.be.revertedWithCustomError(pool, "AlreadyClaimed");

    // Owner withdraws 3 USDC fee without affecting pool
    await pool.withdrawFees(treasury.address);
    expect(await usdc.balanceOf(treasury.address)).to.equal(3n * USDC_UNIT);
    expect(await usdc.balanceOf(await pool.getAddress())).to.equal(0n);
  });

  it("treats exact target tie as UNDER win", async function () {
    const { pool, usdc, alice, bob, lockTime, resolveTime } = await deployFixture();
    await pool.createEpoch("US CPI-U YoY — Nov 2026", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS);

    await pool.connect(alice).deposit(0, true, 100n * USDC_UNIT);
    await pool.connect(bob).deposit(0, false, 100n * USDC_UNIT);

    await time.increaseTo(resolveTime);
    await pool.resolveEpoch(0, TARGET_CPI_BPS); // exact tie

    const ep = await pool.getEpoch(0);
    expect(ep.overWins).to.equal(false);

    const bobBefore = await usdc.balanceOf(bob.address);
    await pool.connect(bob).claim(0);
    expect((await usdc.balanceOf(bob.address)) - bobBefore).to.equal(198_500_000n); // 100 + 98.5
  });

  it("refunds 100% with zero fee if pool is one-sided or cancelled", async function () {
    const { pool, usdc, alice, bob, lockTime, resolveTime } = await deployFixture();

    // Epoch 0: one-sided
    await pool.createEpoch("Epoch 0", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS);
    await pool.connect(alice).deposit(0, true, 250n * USDC_UNIT);
    await time.increaseTo(resolveTime);
    await pool.resolveEpoch(0, 320n);

    const ep0 = await pool.getEpoch(0);
    expect(ep0.isRefund).to.equal(true);
    expect(ep0.feeAmount).to.equal(0n);

    const aliceBefore = await usdc.balanceOf(alice.address);
    await pool.connect(alice).claim(0);
    expect((await usdc.balanceOf(alice.address)) - aliceBefore).to.equal(250n * USDC_UNIT);

    // Epoch 1: cancelled
    const now2 = BigInt(await time.latest());
    await pool.createEpoch("Epoch 1", TARGET_CPI_BPS, now2 + 1000n, now2 + 2000n, FEE_BPS);
    await pool.connect(bob).deposit(1, false, 150n * USDC_UNIT);
    await pool.cancelEpoch(1);

    const bobBefore = await usdc.balanceOf(bob.address);
    await pool.connect(bob).claim(1);
    expect((await usdc.balanceOf(bob.address)) - bobBefore).to.equal(150n * USDC_UNIT);
  });

  it("enforces pause and previewPayout calculation", async function () {
    const { pool, alice, bob, lockTime, resolveTime } = await deployFixture();
    await pool.createEpoch("Epoch 0", TARGET_CPI_BPS, lockTime, resolveTime, FEE_BPS);

    await pool.connect(alice).deposit(0, true, 100n * USDC_UNIT);
    await pool.connect(bob).deposit(0, false, 100n * USDC_UNIT);

    // Preview adding 100 OVER when totalOver=100, totalUnder=100, fee=1.5%
    // winningPool = 200, distributable = 98.5, payout = 100 + (100/200)*98.5 = 149.25 USDC
    const est = await pool.previewPayout(0, true, 100n * USDC_UNIT);
    expect(est).to.equal(149_250_000n);

    await pool.pause();
    await expect(pool.connect(alice).deposit(0, true, 10n * USDC_UNIT)).to.be.revertedWithCustomError(
      pool,
      "EnforcedPause"
    );
    await pool.unpause();
    await pool.connect(alice).deposit(0, true, 10n * USDC_UNIT);
  });
});
