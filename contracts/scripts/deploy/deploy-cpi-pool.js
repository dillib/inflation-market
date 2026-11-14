const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying CPIEpochPool with account:", deployer.address);

  let usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    console.log("No USDC_ADDRESS set; deploying MockERC20 (USDC, 6 decimals)...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockUsdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("MockERC20 deployed to:", usdcAddress);

    // Mint 100,000 test USDC to deployer
    await (await mockUsdc.mint(deployer.address, 100_000n * 10n ** 6n)).wait();
  }

  const minDeposit = 1_000_000n; // 1 USDC (6 decimals)
  const CPIEpochPool = await hre.ethers.getContractFactory("CPIEpochPool");
  const pool = await CPIEpochPool.deploy(usdcAddress, minDeposit);
  await pool.waitForDeployment();

  const poolAddress = await pool.getAddress();
  console.log("CPIEpochPool deployed to:", poolAddress);

  // Seed initial monthly US CPI epoch (target 2.80% YoY)
  const now = Math.floor(Date.now() / 1000);
  const lockTime = now + 25 * 24 * 3600;
  const resolveTime = lockTime + 2 * 24 * 3600;
  await (
    await pool.createEpoch(
      "US CPI-U YoY — Next Release",
      280, // 2.80%
      lockTime,
      resolveTime,
      150 // 1.50% fee
    )
  ).wait();
  console.log("Seeded Epoch #0 (US CPI-U YoY — Next Release, target 2.80%)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
