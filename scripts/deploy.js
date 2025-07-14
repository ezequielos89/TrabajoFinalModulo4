// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("📦 Desplegando contratos con la cuenta:", deployer.address);

  // BOTICOIN
  const BotiCoin = await hre.ethers.getContractFactory("BotiCoin");
  const boti = await BotiCoin.deploy(0);
  await boti.waitForDeployment();
  console.log("🪙 BotiCoin desplegado en:", await boti.getAddress());

  // PEPACOIN
  const PepaCoin = await hre.ethers.getContractFactory("PepaCoin");
  const pepa = await PepaCoin.deploy(0);
  await pepa.waitForDeployment();
  console.log("🪙 PepaCoin desplegado en:", await pepa.getAddress());

  // SIMPLESWAP
  const SimpleSwap = await hre.ethers.getContractFactory("TrabajoPracticoModulo3");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  console.log("🔁 SimpleSwap desplegado en:", await simpleSwap.getAddress());

  // Opcional: Guardar las direcciones en un JSON
  const fs = require("fs");
  const path = "./deployments/local.json";
  fs.writeFileSync(path, JSON.stringify({
    BotiCoin: await boti.getAddress(),
    PepaCoin: await pepa.getAddress(),
    SimpleSwap: await simpleSwap.getAddress()
  }, null, 2));
  console.log(`📄 Direcciones guardadas en ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

