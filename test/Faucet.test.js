const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  let botiCoin, pepaCoin, faucet;
  let owner, addr1, addr2;

  const CLAIM_PEPA = ethers.parseEther("100");
  const CLAIM_BOTI = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const BotiCoin = await ethers.getContractFactory("BotiCoin");
    botiCoin = await BotiCoin.deploy(ethers.parseEther("1000"));
    await botiCoin.waitForDeployment();

    const PepaCoin = await ethers.getContractFactory("PepaCoin");
    pepaCoin = await PepaCoin.deploy(ethers.parseEther("1000"));
    await pepaCoin.waitForDeployment();

    const Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy(
      pepaCoin.target,
      botiCoin.target,
      CLAIM_PEPA,
      CLAIM_BOTI
    );
    await faucet.waitForDeployment();

    await pepaCoin.approve(faucet.target, ethers.parseEther("500"));
    await botiCoin.approve(faucet.target, ethers.parseEther("500"));
    await faucet.loadTokens(ethers.parseEther("500"), ethers.parseEther("500"));
  });

  it("Permite reclamar tokens y respeta el cooldown", async function () {
    await faucet.connect(addr1).claim();

    const pepaBalance = await pepaCoin.balanceOf(addr1.address);
    const botiBalance = await botiCoin.balanceOf(addr1.address);

    expect(pepaBalance).to.equal(CLAIM_PEPA);
    expect(botiBalance).to.equal(CLAIM_BOTI);

    await expect(faucet.connect(addr1).claim()).to.be.revertedWith("Wait cooldown");
  });

  it("No permite reclamar si el faucet no tiene fondos", async function () {
    // Vacía el faucet
    await faucet.withdrawTokens(owner.address);
    await expect(faucet.connect(addr1).claim()).to.be.revertedWith("Faucet empty PEPA");
  });

  it("Solo el owner puede cargar tokens", async function () {
    await expect(
      faucet.connect(addr1).loadTokens(ethers.parseEther("1"), ethers.parseEther("1"))
    ).to.be.revertedWith("Not owner");
  });

  it("Solo el owner puede retirar tokens", async function () {
    await expect(
      faucet.connect(addr1).withdrawTokens(addr1.address)
    ).to.be.revertedWith("Not owner");
  });

  it("Solo el owner puede cambiar los montos de claim", async function () {
    await expect(
      faucet.connect(addr1).setClaimAmounts(1, 1)
    ).to.be.revertedWith("Not owner");
    await faucet.setClaimAmounts(ethers.parseEther("10"), ethers.parseEther("5"));
    expect(await faucet.claimAmountPepa()).to.equal(ethers.parseEther("10"));
    expect(await faucet.claimAmountBoti()).to.equal(ethers.parseEther("5"));
  });

  it("Solo el owner puede cambiar el cooldown", async function () {
    await expect(
      faucet.connect(addr1).setCooldown(10)
    ).to.be.revertedWith("Not owner");
    await faucet.setCooldown(10);
    expect(await faucet.cooldown()).to.equal(10);
  });

  it("Emite evento al reclamar tokens", async function () {
    await expect(faucet.connect(addr1).claim())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(addr1.address, CLAIM_PEPA, CLAIM_BOTI);
  });

  it("Emite evento al retirar tokens", async function () {
    await expect(faucet.withdrawTokens(owner.address))
      .to.emit(faucet, "TokensWithdrawn")
      .withArgs(owner.address, await pepaCoin.balanceOf(faucet.target), await botiCoin.balanceOf(faucet.target));
  });

  it("Emite evento al cambiar montos de claim", async function () {
    await expect(faucet.setClaimAmounts(1, 1))
      .to.emit(faucet, "ClaimAmountsUpdated")
      .withArgs(1, 1);
  });

  it("Emite evento al cambiar cooldown", async function () {
    await expect(faucet.setCooldown(123))
      .to.emit(faucet, "CooldownUpdated")
      .withArgs(123);
  });
});